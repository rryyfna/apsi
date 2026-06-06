'use server';

import { db } from '@/lib/db';
import { headers } from 'next/headers';

async function isAdmin() {
  const headersList = await headers();
  const role = headersList.get('x-user-role');
  return role === 'ADMIN';
}

export async function getAdminDashboardData() {
  if (!(await isAdmin())) throw new Error('Unauthorized');

  const totalMahasiswa = await db.mahasiswa.count();
  const totalDosen = await db.dosen.count();
  const totalMataKuliah = await db.mataKuliah.count();
  const totalKelas = await db.kelas.count();

  return {
    totalMahasiswa,
    totalDosen,
    totalMataKuliah,
    totalKelas
  };
}

export async function getMasterData() {
  if (!(await isAdmin())) throw new Error('Unauthorized');

  const [mahasiswa, dosen, mataKuliah, kelas] = await Promise.all([
    db.mahasiswa.findMany({ take: 20 }), // Batasi 20 untuk preview
    db.dosen.findMany({ take: 20 }),
    db.mataKuliah.findMany({ take: 20 }),
    db.kelas.findMany({ 
      take: 20,
      include: {
        mataKuliah: true,
        dosen: true,
        _count: {
          select: { enrollments: true }
        }
      }
    }),
  ]);

  return { mahasiswa, dosen, mataKuliah, kelas };
}
