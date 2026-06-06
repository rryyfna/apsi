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
  const allMahasiswa = await db.mahasiswa.findMany({ select: { nim: true } });
  const angkatanCount: Record<string, number> = {};
  allMahasiswa.forEach(m => {
    let angkatan = "Lainnya";
    if (m.nim && m.nim.length >= 5) {
      angkatan = "20" + m.nim.substring(3, 5);
    }
    angkatanCount[angkatan] = (angkatanCount[angkatan] || 0) + 1;
  });
  const angkatanDistribution = Object.keys(angkatanCount).map(k => ({ angkatan: k, count: angkatanCount[k] })).sort((a, b) => a.angkatan.localeCompare(b.angkatan));

  const allClasses = await db.kelas.findMany({
    include: {
      mataKuliah: true,
      _count: { select: { enrollments: true } }
    }
  });

  const courseCount: Record<string, number> = {};
  allClasses.forEach(c => {
    const name = c.mataKuliah.namaMk;
    courseCount[name] = (courseCount[name] || 0) + c._count.enrollments;
  });
  const courseEnrollments = Object.keys(courseCount)
    .map(k => ({ course: k, students: courseCount[k] }))
    .sort((a, b) => b.students - a.students)
    .slice(0, 10);

  return {
    totalMahasiswa,
    totalDosen,
    totalMataKuliah,
    totalKelas,
    angkatanDistribution,
    courseEnrollments
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
