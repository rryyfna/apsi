'use server';

import { db } from '@/lib/db';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function getMataKuliahWithCpmk() {
  const mk = await db.mataKuliah.findMany({
    include: {
      cpmk: true
    },
    orderBy: { kodeMk: 'asc' }
  });
  return mk;
}

export async function saveCpmkSetting(mataKuliahId: string, cpmks: { id?: string, kode: string, deskripsi: string, deskripsiEn?: string }[]) {
  try {
    const existingCpmks = await db.cPMK.findMany({ where: { mataKuliahId } });
    const existingIds = existingCpmks.map(c => c.id);
    const incomingIds = cpmks.map(c => c.id).filter(id => id && id.startsWith('c'));

    // Delete those that are removed
    const idsToDelete = existingIds.filter(id => !incomingIds.includes(id));
    if (idsToDelete.length > 0) {
      await db.cPMK.deleteMany({
        where: { id: { in: idsToDelete } }
      });
    }

    // Upsert the rest
    for (const item of cpmks) {
      if (item.id && item.id.startsWith('c')) {
        await db.cPMK.update({
          where: { id: item.id },
          data: {
            kode: item.kode,
            deskripsi: item.deskripsi || '',
            deskripsiEn: item.deskripsiEn || null
          }
        });
      } else {
        await db.cPMK.create({
          data: {
            kode: item.kode,
            deskripsi: item.deskripsi || '',
            deskripsiEn: item.deskripsiEn || null,
            mataKuliahId
          }
        });
      }
    }

    revalidatePath('/kaprodi/cpmk');
    return { success: true };
  } catch (error: any) {
    console.error('Error saving CPMK:', error);
    return { success: false, error: error.message || 'Gagal menyimpan pengaturan CPMK' };
  }
}

export async function getMonitoringCpl(filters?: { angkatan?: string, semester?: number }) {
  const whereClause: any = {};
  
  if (filters?.angkatan || filters?.semester) {
    whereClause.AND = [];
    if (filters.angkatan) {
      whereClause.AND.push({ mahasiswa: { angkatan: filters.angkatan } });
    }
    if (filters.semester) {
      whereClause.AND.push({ kelas: { mataKuliah: { semester: filters.semester } } });
    }
  }

  const enrollments = await db.enrollment.findMany({
    where: whereClause,
    include: {
      mahasiswa: true,
      kelas: {
        include: {
          cpmkKolomNilai: true,
          mataKuliah: {
            include: {
              cpmk: {
                include: {
                  cplMappings: {
                    include: {
                      cpl: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  const studentMap = new Map<string, any>();

  for (const en of enrollments) {
    const nim = en.mahasiswa.nim;
    if (!studentMap.has(nim)) {
      studentMap.set(nim, {
        id: en.mahasiswa.id,
        nim: nim,
        name: en.mahasiswa.name,
        cplScores: {},
        cpmkDetails: []
      });
    }

    const mhs = studentMap.get(nim);

    // Hitung skor masing-masing CPMK berdasarkan plotting kelas
    const cpmkScores = new Map<string, number>();

    en.kelas.mataKuliah.cpmk.forEach(cpmk => {
      let score = 0;
      const mappings = en.kelas.cpmkKolomNilai.filter(m => m.cpmkId === cpmk.id);
      
      mappings.forEach(m => {
        const percentage = m.bobot / 100;
        let colScore = 0;
        if (m.namaKolom.toLowerCase() === 'tugas') colScore = en.nilaiTugas || 0;
        else if (m.namaKolom.toLowerCase() === 'uts') colScore = en.nilaiUts || 0;
        else if (m.namaKolom.toLowerCase() === 'uas') colScore = en.nilaiUas || 0;
        else if (m.namaKolom.toLowerCase() === 'partisipasi') colScore = en.nilaiPartisipasi || 0;
        else if (m.namaKolom.toLowerCase() === 'proyek') colScore = en.nilaiProyek || 0;
        
        score += colScore * percentage;
      });
      cpmkScores.set(cpmk.id, score);

      mhs.cpmkDetails.push({
        cpmkKode: cpmk.kode,
        cpmkNama: cpmk.deskripsi,
        matkul: en.kelas.mataKuliah.namaMk,
        score: Math.round(score),
        isFulfilled: score >= 60
      });
    });

    // Petakan skor CPMK ke CPL
    // Karena "a" dianggap sama semua, IK = Average(CPMK), CPL = Average(IK).
    // Secara matematis jika bobot sama, skor CPL kelas ini adalah rata-rata skor CPMK yang terkait.
    const classCplScores = new Map<string, { total: number, count: number }>();
    
    en.kelas.mataKuliah.cpmk.forEach(cpmk => {
      const cpmkScore = cpmkScores.get(cpmk.id) || 0;
      cpmk.cplMappings.forEach(mapping => {
        const cplKode = mapping.cpl.kode;
        if (!classCplScores.has(cplKode)) {
          classCplScores.set(cplKode, { total: 0, count: 0 });
        }
        const data = classCplScores.get(cplKode)!;
        data.total += cpmkScore;
        data.count += 1;
      });
    });

    // Tambahkan rata-rata CPL kelas ini ke skor agregat mahasiswa
    for (const [cplKode, data] of classCplScores.entries()) {
      if (!mhs.cplScores[cplKode]) {
        mhs.cplScores[cplKode] = { total: 0, count: 0 };
      }
      const cplScoreForClass = data.total / data.count; // Average of mapped CPMKs
      mhs.cplScores[cplKode].total += cplScoreForClass;
      mhs.cplScores[cplKode].count += 1;
    }
  }

  const result = Array.from(studentMap.values()).map(mhs => {
    let finalScores: Record<string, number> = {};
    for (const [cplKode, data] of Object.entries(mhs.cplScores) as any) {
      finalScores[cplKode] = Math.round(data.total / data.count);
    }

    // Inject dummy data for UI testing / demo requirements based on angkatan
    for (let i = 1; i <= 10; i++) {
      const cplKey = `CPL-${i}`;
      if (mhs.nim.startsWith('I0321')) {
        finalScores[cplKey] = Math.floor(Math.random() * 10) + 90; // 90-99 (Hampir lulus semua)
      } else if (mhs.nim.startsWith('I0322')) {
        finalScores[cplKey] = Math.floor(Math.random() * 15) + 85; // 85-99 (Semester akhir)
      } else if (mhs.nim.startsWith('I0323')) {
        finalScores[cplKey] = Math.floor(Math.random() * 20) + 80; // 80-99 (Sem 7, wajib selesai)
      } else if (mhs.nim.startsWith('I0324')) {
        finalScores[cplKey] = Math.floor(Math.random() * 25) + 60; // 60-84 (Sem 5, masih pertengahan)
      } else if (mhs.nim.startsWith('I0325')) {
        finalScores[cplKey] = Math.floor(Math.random() * 30) + 45; // 45-74 (Sem 3, baru mulai, banyak merah)
      } else if (!finalScores[cplKey]) {
        finalScores[cplKey] = Math.floor(Math.random() * 40) + 60; // Default
      }

      // Generate dummy cpmkDetails for scores that are not perfectly green (< 80)
      if (finalScores[cplKey] < 80) {
        // Find if already has real cpmk
        const hasRealCpmk = mhs.cpmkDetails.some((d: any) => d.cpmkKode.startsWith(`CPMK-${i}`));
        if (!hasRealCpmk) {
          const numCpmk = Math.floor(Math.random() * 3) + 1; // 1 to 3 CPMKs per CPL
          const dummyMatkuls = [
            'Matematika Optimasi', 'Sistem Produksi', 'Perancangan Tata Letak Pabrik', 
            'Manajemen Kualitas', 'Ergonomi Industri', 'Simulasi Sistem', 
            'Ekonomi Teknik', 'Kesehatan dan Keselamatan Kerja', 'Pemodelan Sistem', 
            'Manajemen Rantai Pasok', 'Sistem Enterprise (Pilihan)', 
            'Data Mining Terapan (Pilihan)', 'Otomasi Industri (Pilihan)'
          ];
          const dummyDeskripsi = [
            `Mampu mengaplikasikan prinsip dasar dan metode analisis untuk menyelesaikan kasus ${cplKey}`,
            `Mahasiswa dapat mengidentifikasi masalah rekayasa sistem terintegrasi pada lingkup ${cplKey}`,
            `Mampu merancang komponen atau sistem yang berhubungan dengan target capaian ${cplKey}`,
            `Memiliki keterampilan dalam merumuskan solusi alternatif berdasarkan teori pada ${cplKey}`,
            `Mampu menggunakan perangkat lunak (software) modern untuk menganalisis data terkait ${cplKey}`,
            `Mampu mengevaluasi dampak teknis dan manajerial dari implementasi studi ${cplKey}`,
            `Mampu melakukan presentasi lisan dan tulisan mengenai laporan proyek ${cplKey}`
          ];
          
          for (let j = 1; j <= numCpmk; j++) {
            const randomMatkul = dummyMatkuls[Math.floor(Math.random() * dummyMatkuls.length)];
            const randomDeskripsi = dummyDeskripsi[Math.floor(Math.random() * dummyDeskripsi.length)];
            const cpmkScoreOffset = Math.floor(Math.random() * 10) - 5; // -5 to +5 variance
            const cpmkScore = Math.max(0, Math.min(100, finalScores[cplKey] + cpmkScoreOffset));
            
            mhs.cpmkDetails.push({
              cpmkKode: `CPMK-${i}.${j}`,
              cpmkNama: randomDeskripsi,
              matkul: randomMatkul,
              score: cpmkScore,
              isFulfilled: cpmkScore >= 80
            });
          }
        }
      }
    }

    // Clean up unfulfilled cpmk for those we forced to pass
    if (mhs.nim.startsWith('I0321')) {
      mhs.cpmkDetails = mhs.cpmkDetails.filter((d: any) => d.score < 80 && false); // clear them all
    }

    return {
      id: mhs.id,
      nim: mhs.nim,
      name: mhs.name,
      cplScores: finalScores,
      unfulfilledCpmk: mhs.cpmkDetails.filter((d: any) => d.score < 80)
    };
  });

  return result.sort((a, b) => a.nim.localeCompare(b.nim));
}
export async function getKelasList() {
  return await db.kelas.findMany({
    include: {
      mataKuliah: true,
      dosen: true,
      _count: {
        select: { enrollments: true }
      }
    },
    orderBy: { namaKelas: 'asc' }
  });
}

export async function updateKuotaKelas(kelasId: string, kuotaReguler: number) {
  try {
    await db.kelas.update({
      where: { id: kelasId },
      data: { kuotaReguler }
    });
    revalidatePath('/kaprodi/kelas');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating kuota:', error);
    return { success: false, error: 'Gagal mengupdate kuota kelas.' };
  }
}
