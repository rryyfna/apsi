'use server';

import { db } from '@/lib/db';
import { headers } from 'next/headers';

async function getUserId() {
  const headersList = await headers();
  return headersList.get('x-user-id');
}

export async function getMahasiswaDashboardData() {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const mahasiswa = await db.mahasiswa.findUnique({
    where: { userId },
    include: {
      enrollments: {
        include: {
          kelas: {
            include: { mataKuliah: true }
          }
        }
      }
    }
  });

  if (!mahasiswa) throw new Error('Mahasiswa not found');

  let totalSks = 0;
  let totalBobot = 0;

  const letterToGrade = (letter: string) => {
    switch(letter) {
      case 'A': return 4.0;
      case 'A-': return 3.7;
      case 'B+': return 3.3;
      case 'B': return 3.0;
      case 'C+': return 2.7;
      case 'C': return 2.0;
      case 'D': return 1.0;
      case 'E': return 0.0;
      default: return 0.0;
    }
  };

  const activeClasses = [];
  const gradeCount: Record<string, number> = {};

  for (const enrollment of mahasiswa.enrollments) {
    const sks = enrollment.kelas.mataKuliah.sks;
    if (enrollment.huruf) {
      totalSks += sks;
      totalBobot += (sks * letterToGrade(enrollment.huruf));
      
      gradeCount[enrollment.huruf] = (gradeCount[enrollment.huruf] || 0) + 1;
    } else {
      // Jika belum ada nilai (active class)
      activeClasses.push({
        kodeMk: enrollment.kelas.mataKuliah.kodeMk,
        namaMk: enrollment.kelas.mataKuliah.namaMk,
        sks: sks,
        kelas: enrollment.kelas.namaKelas,
      });
    }
  }

  const gradeDistribution = Object.keys(gradeCount).map(grade => ({
    grade,
    count: gradeCount[grade]
  })).sort((a, b) => a.grade.localeCompare(b.grade));

  const ipk = totalSks > 0 ? (totalBobot / totalSks).toFixed(2) : '0.00';

  return {
    profile: {
      nim: mahasiswa.nim,
      name: mahasiswa.name,
      fakultas: mahasiswa.fakultas,
      programStudi: mahasiswa.programStudi,
    },
    stats: {
      ipk,
      totalSks,
    },
    activeClasses,
    gradeDistribution
  };
}

// Function untuk KRS
export async function getAvailableClasses() {
  const kelas = await db.kelas.findMany({
    include: {
      mataKuliah: true,
      dosen: true,
      _count: {
        select: { enrollments: true }
      }
    }
  });

  return kelas;
}

export async function enrollClass(kelasId: string) {
  const userId = await getUserId();
  if (!userId) return { error: 'Unauthorized' };

  const mahasiswa = await db.mahasiswa.findUnique({ where: { userId } });
  if (!mahasiswa) return { error: 'Mahasiswa not found' };

  // Cek apakah sudah terdaftar
  const existing = await db.enrollment.findUnique({
    where: {
      mahasiswaId_kelasId: {
        mahasiswaId: mahasiswa.id,
        kelasId: kelasId
      }
    }
  });

  if (existing) return { error: 'Anda sudah terdaftar di kelas ini' };

  await db.enrollment.create({
    data: {
      mahasiswaId: mahasiswa.id,
      kelasId: kelasId
    }
  });

  // Increment jumlahAmbilReguler
  await db.kelas.update({
    where: { id: kelasId },
    data: {
      jumlahAmbilReguler: {
        increment: 1
      }
    }
  });

  return { success: true };
}
