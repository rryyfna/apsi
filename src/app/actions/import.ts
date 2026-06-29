'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export type ImportedStudent = {
  nim: string;
  nama: string;
  nilai: {
    tugas: number;
    uts: number;
    uas: number;
    partisipasi: number;
    proyek: number;
  };
};

export async function importGradesFromExcel(kelasId: string, payload: { students: ImportedStudent[] }) {
  try {
    let successCount = 0;
    const { students } = payload;
    
    // Ambil bobot kelas yang sudah ada di database, jangan overwrite dari Excel.
    const kelas = await db.kelas.findUnique({ 
      where: { id: kelasId },
      include: { cpmkKolomNilai: true } 
    });
    if (!kelas) {
      return { success: false, message: 'Kelas tidak ditemukan.' };
    }

    const getBobot = (namaKolom: string) => {
      const k = kelas.cpmkKolomNilai.find(k => k.namaKolom.toLowerCase() === namaKolom.toLowerCase());
      return k ? k.bobot / 100 : 0;
    };

    const wTugas = getBobot('Tugas');
    const wUts = getBobot('UTS');
    const wUas = getBobot('UAS');
    const wPartisipasi = getBobot('Partisipasi');
    const wProyek = getBobot('Proyek');

    // Overwrite: hapus semua data nilai/enrollment lama di kelas ini sebelum memasukkan yang baru
    await db.enrollment.deleteMany({
      where: { kelasId: kelasId }
    });

    // Process each student one by one
    for (const student of students) {
      try {
        const newUser = await db.user.upsert({
          where: { username: student.nim },
          update: { name: student.nama },
          create: {
            username: student.nim,
            password: student.nim, // Default password
            name: student.nama,
            role: 'MAHASISWA',
          }
        });
        
        let mhs = await db.mahasiswa.upsert({
          where: { nim: student.nim },
          update: { name: student.nama },
          create: {
            userId: newUser.id,
            nim: student.nim,
            name: student.nama,
          }
        });
        
        let total = 0;
        if (student.nilai.tugas != null) total += (student.nilai.tugas * wTugas);
        if (student.nilai.uts != null) total += (student.nilai.uts * wUts);
        if (student.nilai.uas != null) total += (student.nilai.uas * wUas);
        if (student.nilai.partisipasi != null) total += (student.nilai.partisipasi * wPartisipasi);
        if (student.nilai.proyek != null) total += (student.nilai.proyek * wProyek);

        let huruf = 'E';
        let skala4 = 0.0;
        if (total >= 85) { huruf = 'A'; skala4 = 4.0; }
        else if (total >= 80) { huruf = 'A-'; skala4 = 3.7; }
        else if (total >= 75) { huruf = 'B+'; skala4 = 3.3; }
        else if (total >= 70) { huruf = 'B'; skala4 = 3.0; }
        else if (total >= 65) { huruf = 'C+'; skala4 = 2.7; }
        else if (total >= 60) { huruf = 'C'; skala4 = 2.0; }
        else if (total >= 50) { huruf = 'D'; skala4 = 1.0; }

        // Upsert the enrollment record for this class
        await db.enrollment.upsert({
          where: {
            mahasiswaId_kelasId: {
              mahasiswaId: mhs.id,
              kelasId: kelasId,
            }
          },
          update: {
            nilaiTugas: student.nilai.tugas,
            nilaiUts: student.nilai.uts,
            nilaiUas: student.nilai.uas,
            nilaiPartisipasi: student.nilai.partisipasi,
            nilaiProyek: student.nilai.proyek,
            nilaiTotal: Math.round(total * 100) / 100,
            nilaiAkhir: skala4,
            huruf: huruf
          },
          create: {
            mahasiswaId: mhs.id,
            kelasId: kelasId,
            nilaiTugas: student.nilai.tugas,
            nilaiUts: student.nilai.uts,
            nilaiUas: student.nilai.uas,
            nilaiPartisipasi: student.nilai.partisipasi,
            nilaiProyek: student.nilai.proyek,
            nilaiTotal: Math.round(total * 100) / 100,
            nilaiAkhir: skala4,
            huruf: huruf
          }
        });
        
        successCount++;
      } catch (err) {
        console.error('Failed to process student:', student.nim, err);
      }
    }
    
    revalidatePath('/dosen/nilai');
    revalidatePath('/admin/nilai');
    return { success: true, count: successCount, message: `Berhasil mengimpor data ${successCount} mahasiswa.` };
    
  } catch (error: any) {
    console.error('Import Error:', error);
    return { success: false, message: error.message || 'Terjadi kesalahan saat mengimpor data.' };
  }
}
