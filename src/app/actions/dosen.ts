'use server';

import { db } from '@/lib/db';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

async function getUserId() {
  const headersList = await headers();
  return headersList.get('x-user-id');
}

export async function getDosenDashboardData() {
  const userId = await getUserId();
  if (!userId) redirect('/');

  const dosen = await db.dosen.findUnique({
    where: { userId },
    include: {
      kelas: {
        include: {
          mataKuliah: true,
          _count: {
            select: { enrollments: true }
          },
          enrollments: {
            select: { huruf: true }
          }
        }
      }
    }
  });
  if (!dosen) redirect('/');

  const totalKelas = dosen.kelas.length;
  const totalMahasiswaDiajar = dosen.kelas.reduce((acc: number, curr: any) => acc + curr._count.enrollments, 0);

  const gradeCount: Record<string, number> = {};
  
  dosen.kelas.forEach((k: any) => {
    k.enrollments.forEach((en: any) => {
      if (en.huruf) {
        gradeCount[en.huruf] = (gradeCount[en.huruf] || 0) + 1;
      }
    });
  });

  const gradeDistribution = Object.keys(gradeCount).map(grade => ({
    grade,
    count: gradeCount[grade]
  })).sort((a, b) => a.grade.localeCompare(b.grade));

  const mkMap = new Map<string, { id: string, namaMk: string, gradeCount: Record<string, number> }>();
  dosen.kelas.forEach((k: any) => {
    const mk = k.mataKuliah;
    if (!mkMap.has(mk.kodeMk)) {
      mkMap.set(mk.kodeMk, { id: mk.kodeMk, namaMk: mk.namaMk, gradeCount: {} });
    }
    const mkData = mkMap.get(mk.kodeMk)!;

    k.enrollments.forEach((en: any) => {
      if (en.huruf) {
        mkData.gradeCount[en.huruf] = (mkData.gradeCount[en.huruf] || 0) + 1;
      }
    });
  });

  const gradeDistributionByMk = Array.from(mkMap.values()).map(mk => ({
    kodeMk: mk.id,
    namaMk: mk.namaMk,
    distribution: Object.keys(mk.gradeCount).map(grade => ({
      grade,
      count: mk.gradeCount[grade]
    })).sort((a, b) => a.grade.localeCompare(b.grade))
  }));

  return {
    profile: {
      nidn: dosen.nidn,
      name: dosen.name,
    },
    stats: {
      totalKelas,
      totalMahasiswaDiajar
    },
    gradeDistribution,
    gradeDistributionByMk,
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
  if (!userId) redirect('/');

  const dosen = await db.dosen.findUnique({ where: { userId } });
  if (!dosen) redirect('/');

  const kelas = await db.kelas.findUnique({
    where: { id: kelasId },
    include: {
      cpmkKolomNilai: { include: { cpmk: true } },
      mataKuliah: {
        include: { cpmk: true }
      },
      enrollments: {
        include: {
          mahasiswa: true,
          kolomNilaiScores: true
        }
      }
    }
  });

  // Pastikan dosen ini yang mengajar
  if (kelas?.dosenId !== dosen.id) redirect('/');

  return kelas;
}

export async function updateNilai(enrollmentId: string, data: any) {
  const userId = await getUserId();
  if (!userId) return { error: 'Unauthorized' };

  // data = { [kolomId]: nilai, ... }
  // Namun, nilaiTotal, nilaiAkhir, huruf harus dihitung.
  
  const enrollment = await db.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { 
      kelas: {
        include: { cpmkKolomNilai: true }
      } 
    }
  });

  if (!enrollment) return { error: 'Data tidak ditemukan' };

  const cpmkKolomNilai = enrollment.kelas.cpmkKolomNilai;
  let total = 0;

  // Hapus semua score lama untuk enrollment ini
  await db.kelasCpmkKolomNilaiScore.deleteMany({
    where: { enrollmentId }
  });

  const newScores = [];

  for (const k of cpmkKolomNilai) {
    const rawVal = data[k.id];
    const numVal = parseFloat(rawVal);
    if (!isNaN(numVal)) {
      const w = k.bobot / 100;
      total += (numVal * w);
      newScores.push({
        enrollmentId,
        kelasCpmkKolomNilaiId: k.id,
        nilai: numVal
      });
    }
  }

  let huruf = 'E';
  let skala4 = 0.0;
  if (total >= 85) { huruf = 'A'; skala4 = 4.0; }
  else if (total >= 80) { huruf = 'A-'; skala4 = 3.7; }
  else if (total >= 75) { huruf = 'B+'; skala4 = 3.3; }
  else if (total >= 70) { huruf = 'B'; skala4 = 3.0; }
  else if (total >= 65) { huruf = 'C+'; skala4 = 2.7; }
  else if (total >= 60) { huruf = 'C'; skala4 = 2.0; }
  else if (total >= 50) { huruf = 'D'; skala4 = 1.0; }

  await db.$transaction([
    db.kelasCpmkKolomNilaiScore.createMany({ data: newScores }),
    db.enrollment.update({
      where: { id: enrollmentId },
      data: {
        nilaiTotal: total,
        nilaiAkhir: skala4,
        huruf: huruf
      }
    })
  ]);

  return { success: true };
}

export async function getPlottingCpmk(kelasId: string) {
  const userId = await getUserId();
  if (!userId) redirect('/');

  const kelas = await db.kelas.findUnique({
    where: { id: kelasId },
    include: {
      cpmkKolomNilai: true,
      mataKuliah: {
        include: {
          cpmk: true
        }
      }
    }
  });

  if (!kelas) return null;
  return kelas;
}

export async function savePlottingCpmk(kelasId: string, mapping: { namaKolom: string, cpmkKode: string, bobot: number }[]) {
  const userId = await getUserId();
  if (!userId) return { error: 'Unauthorized' };

  try {
    const kelas = await db.kelas.findUnique({
      where: { id: kelasId },
      include: { mataKuliah: { include: { cpmk: true } } }
    });
    
    if (!kelas) return { error: 'Kelas tidak ditemukan' };
    
    // Hapus kolomNilai lama untuk kelas ini
    await db.kelasCpmkKolomNilai.deleteMany({
      where: { kelasId }
    });

    const newData: { kelasId: string, cpmkId: string, namaKolom: string, bobot: number }[] = [];
    
    for (const item of mapping) {
      if (item.namaKolom && item.bobot > 0 && item.cpmkKode) {
        const kode = item.cpmkKode.trim();
        let cpmk = await db.cPMK.findFirst({
          where: {
            mataKuliahId: kelas.mataKuliahId,
            kode: kode
          }
        });

        if (!cpmk) {
          cpmk = await db.cPMK.create({
            data: {
              mataKuliahId: kelas.mataKuliahId,
              kode: kode,
              deskripsi: '-',
              deskripsiEn: '-'
            }
          });
        }

        newData.push({
          kelasId: kelasId,
          cpmkId: cpmk.id,
          namaKolom: item.namaKolom.trim(),
          bobot: item.bobot
        });
      }
    }

    if (newData.length > 0) {
      await db.kelasCpmkKolomNilai.createMany({ data: newData });
    }

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Gagal menyimpan plotting CPMK' };
  }
}

export async function saveBobotKelas(kelasId: string, bobotData: { bobotTugas: number, bobotUts: number, bobotUas: number, bobotPartisipasi: number, bobotProyek: number }) {
  const userId = await getUserId();
  if (!userId) return { error: 'Unauthorized' };

  try {
    const total = bobotData.bobotTugas + bobotData.bobotUts + bobotData.bobotUas + bobotData.bobotPartisipasi + bobotData.bobotProyek;
    if (Math.round(total) !== 100) {
      return { error: 'Total bobot harus 100%' };
    }

    await db.kelas.update({
      where: { id: kelasId },
      data: {
        bobotTugas: bobotData.bobotTugas,
        bobotUts: bobotData.bobotUts,
        bobotUas: bobotData.bobotUas,
        bobotPartisipasi: bobotData.bobotPartisipasi,
        bobotProyek: bobotData.bobotProyek
      }
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Gagal menyimpan bobot kelas' };
  }
}
