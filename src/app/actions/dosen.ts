'use server';

import { db } from '@/lib/db';
import { headers } from 'next/headers';

async function getUserId() {
  const headersList = await headers();
  return headersList.get('x-user-id');
}

export async function getDosenDashboardData() {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const dosen = await db.dosen.findUnique({
    where: { userId },
    include: {
      kelas: {
        include: {
          mataKuliah: true,
          _count: {
            select: { enrollments: true }
          }
        }
      }
    }
  });

  if (!dosen) throw new Error('Dosen not found');

  const totalKelas = dosen.kelas.length;
  const totalMahasiswaDiajar = dosen.kelas.reduce((acc: number, curr: any) => acc + curr._count.enrollments, 0);

  return {
    profile: {
      nidn: dosen.nidn,
      name: dosen.name,
    },
    stats: {
      totalKelas,
      totalMahasiswaDiajar
    },
    kelas: dosen.kelas.map((k: any) => ({
      id: k.id,
      mataKuliah: k.mataKuliah.namaMk,
      kodeMk: k.mataKuliah.kodeMk,
      namaKelas: k.namaKelas,
      jumlahMahasiswa: k._count.enrollments
    }))
  };
}

export async function getKelasWithEnrollments(kelasId: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const dosen = await db.dosen.findUnique({ where: { userId } });
  if (!dosen) throw new Error('Dosen not found');

  const kelas = await db.kelas.findUnique({
    where: { id: kelasId },
    include: {
      mataKuliah: true,
      enrollments: {
        include: {
          mahasiswa: true
        }
      }
    }
  });

  // Pastikan dosen ini yang mengajar
  if (kelas?.dosenId !== dosen.id) throw new Error('Unauthorized access to class');

  return kelas;
}

export async function updateNilai(enrollmentId: string, data: any) {
  const userId = await getUserId();
  if (!userId) return { error: 'Unauthorized' };

  // Hitung nilai akhir & huruf
  const { nilaiTugas, nilaiUts, nilaiUas, nilaiPartisipasi, nilaiProyek } = data;
  
  // Bobot default jika tidak ada (sesuaikan dengan aturan akademik)
  // Misal: Tugas 20%, UTS 30%, UAS 30%, Partisipasi 10%, Proyek 10%
  let total = 0;
  if (nilaiTugas) total += (nilaiTugas * 0.2);
  if (nilaiUts) total += (nilaiUts * 0.3);
  if (nilaiUas) total += (nilaiUas * 0.3);
  if (nilaiPartisipasi) total += (nilaiPartisipasi * 0.1);
  if (nilaiProyek) total += (nilaiProyek * 0.1);

  let huruf = 'E';
  if (total >= 85) huruf = 'A';
  else if (total >= 80) huruf = 'A-';
  else if (total >= 75) huruf = 'B+';
  else if (total >= 70) huruf = 'B';
  else if (total >= 65) huruf = 'C+';
  else if (total >= 60) huruf = 'C';
  else if (total >= 50) huruf = 'D';

  await db.enrollment.update({
    where: { id: enrollmentId },
    data: {
      nilaiTugas: parseFloat(nilaiTugas) || null,
      nilaiUts: parseFloat(nilaiUts) || null,
      nilaiUas: parseFloat(nilaiUas) || null,
      nilaiPartisipasi: parseFloat(nilaiPartisipasi) || null,
      nilaiProyek: parseFloat(nilaiProyek) || null,
      nilaiAkhir: total > 0 ? parseFloat(total.toFixed(2)) : null,
      huruf: total > 0 ? huruf : null
    }
  });

  return { success: true };
}
