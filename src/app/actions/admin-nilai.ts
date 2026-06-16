'use server';

import { db } from '@/lib/db';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';

async function isAdmin() {
  const headersList = await headers();
  const role = headersList.get('x-user-role');
  return role === 'ADMIN';
}

export async function getAllKelas() {
  if (!(await isAdmin())) redirect('/');
  const kelas = await db.kelas.findMany({
    include: {
      mataKuliah: true,
      dosen: true,
      _count: { select: { enrollments: true } }
    }
  });
  return kelas;
}

export async function getKelasWithEnrollmentsAdmin(kelasId: string) {
  if (!(await isAdmin())) redirect('/');

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
  return kelas;
}

export async function updateNilaiAdmin(
  enrollmentId: string, 
  data: { 
    nilaiTugas?: string | number | null, 
    nilaiUts?: string | number | null, 
    nilaiUas?: string | number | null, 
    nilaiPartisipasi?: string | number | null, 
    nilaiProyek?: string | number | null 
  }
) {
  if (!(await isAdmin())) return { error: 'Unauthorized' };

  const { nilaiTugas, nilaiUts, nilaiUas, nilaiPartisipasi, nilaiProyek } = data;

  // Dapatkan bobot dari Kelas
  const enrollment = await db.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { kelas: true }
  });

  if (!enrollment) return { error: 'Data tidak ditemukan' };

  const wTugas = (enrollment.kelas.bobotTugas ?? 20) / 100;
  const wUts = (enrollment.kelas.bobotUts ?? 30) / 100;
  const wUas = (enrollment.kelas.bobotUas ?? 30) / 100;
  const wPartisipasi = (enrollment.kelas.bobotPartisipasi ?? 10) / 100;
  const wProyek = (enrollment.kelas.bobotProyek ?? 10) / 100;

  let total = 0;
  const t = parseFloat(String(nilaiTugas)); if (!isNaN(t)) total += (t * wTugas);
  const uts = parseFloat(String(nilaiUts)); if (!isNaN(uts)) total += (uts * wUts);
  const uas = parseFloat(String(nilaiUas)); if (!isNaN(uas)) total += (uas * wUas);
  const p = parseFloat(String(nilaiPartisipasi)); if (!isNaN(p)) total += (p * wPartisipasi);
  const pr = parseFloat(String(nilaiProyek)); if (!isNaN(pr)) total += (pr * wProyek);

  let huruf = 'E';
  let skala4 = 0.0;
  if (total >= 85) { huruf = 'A'; skala4 = 4.0; }
  else if (total >= 80) { huruf = 'A-'; skala4 = 3.7; }
  else if (total >= 75) { huruf = 'B+'; skala4 = 3.3; }
  else if (total >= 70) { huruf = 'B'; skala4 = 3.0; }
  else if (total >= 65) { huruf = 'C+'; skala4 = 2.7; }
  else if (total >= 60) { huruf = 'C'; skala4 = 2.0; }
  else if (total >= 50) { huruf = 'D'; skala4 = 1.0; }

  await db.enrollment.update({
    where: { id: enrollmentId },
    data: {
      nilaiTugas: !isNaN(parseFloat(String(nilaiTugas))) ? parseFloat(String(nilaiTugas)) : null,
      nilaiUts: !isNaN(parseFloat(String(nilaiUts))) ? parseFloat(String(nilaiUts)) : null,
      nilaiUas: !isNaN(parseFloat(String(nilaiUas))) ? parseFloat(String(nilaiUas)) : null,
      nilaiPartisipasi: !isNaN(parseFloat(String(nilaiPartisipasi))) ? parseFloat(String(nilaiPartisipasi)) : null,
      nilaiProyek: !isNaN(parseFloat(String(nilaiProyek))) ? parseFloat(String(nilaiProyek)) : null,
      nilaiTotal: total,
      nilaiAkhir: skala4,
      huruf: huruf
    }
  });

  return { success: true };
}
