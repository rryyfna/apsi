'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

async function isAdmin() {
  const headersList = await headers();
  const role = headersList.get('x-user-role');
  return role === 'ADMIN';
}

export async function searchEnrollments(query: string) {
  if (!(await isAdmin())) return [];
  if (!query) return [];
  try {
    const enrollments = await db.enrollment.findMany({
      where: {
        OR: [
          { mahasiswa: { nim: { contains: query, mode: 'insensitive' } } },
          { mahasiswa: { name: { contains: query, mode: 'insensitive' } } },
          { kelas: { mataKuliah: { namaMk: { contains: query, mode: 'insensitive' } } } },
        ]
      },
      include: {
        mahasiswa: true,
        kelas: {
          include: {
            mataKuliah: true
          }
        }
      },
      take: 20
    });
    return enrollments;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function overrideNilai(formData: FormData) {
  if (!(await isAdmin())) return { error: 'Unauthorized' };

  const enrollmentId = formData.get('enrollmentId') as string;
  const nilaiTugas = parseFloat(formData.get('nilaiTugas') as string);
  const nilaiUts = parseFloat(formData.get('nilaiUts') as string);
  const nilaiUas = parseFloat(formData.get('nilaiUas') as string);
  const nilaiPartisipasi = parseFloat(formData.get('nilaiPartisipasi') as string);
  const nilaiProyek = parseFloat(formData.get('nilaiProyek') as string);

  try {
    const enrollment = await db.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { kelas: true }
    });

    if (!enrollment) return { error: 'Data KRS tidak ditemukan' };

    // Calculate final score
    const bobot = {
      tugas: enrollment.kelas.bobotTugas || 0,
      uts: enrollment.kelas.bobotUts || 0,
      uas: enrollment.kelas.bobotUas || 0,
      partisipasi: enrollment.kelas.bobotPartisipasi || 0,
      proyek: enrollment.kelas.bobotProyek || 0,
    };

    let nilaiTotal = 0;
    if (!isNaN(nilaiTugas)) nilaiTotal += nilaiTugas * (bobot.tugas / 100);
    if (!isNaN(nilaiUts)) nilaiTotal += nilaiUts * (bobot.uts / 100);
    if (!isNaN(nilaiUas)) nilaiTotal += nilaiUas * (bobot.uas / 100);
    if (!isNaN(nilaiPartisipasi)) nilaiTotal += nilaiPartisipasi * (bobot.partisipasi / 100);
    if (!isNaN(nilaiProyek)) nilaiTotal += nilaiProyek * (bobot.proyek / 100);

    let huruf = 'E';
    if (nilaiTotal >= 85) huruf = 'A';
    else if (nilaiTotal >= 80) huruf = 'A-';
    else if (nilaiTotal >= 75) huruf = 'B+';
    else if (nilaiTotal >= 70) huruf = 'B';
    else if (nilaiTotal >= 65) huruf = 'C+';
    else if (nilaiTotal >= 60) huruf = 'C';
    else if (nilaiTotal >= 55) huruf = 'D';

    await db.enrollment.update({
      where: { id: enrollmentId },
      data: {
        nilaiTugas: isNaN(nilaiTugas) ? null : nilaiTugas,
        nilaiUts: isNaN(nilaiUts) ? null : nilaiUts,
        nilaiUas: isNaN(nilaiUas) ? null : nilaiUas,
        nilaiPartisipasi: isNaN(nilaiPartisipasi) ? null : nilaiPartisipasi,
        nilaiProyek: isNaN(nilaiProyek) ? null : nilaiProyek,
        nilaiTotal,
        nilaiAkhir: nilaiTotal,
        huruf,
        updatedBy: 'ADMIN_OVERRIDE'
      }
    });

    revalidatePath('/admin/override');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Gagal melakukan override nilai' };
  }
}
