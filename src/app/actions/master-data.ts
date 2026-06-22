'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';

async function isAdmin() {
  const headersList = await headers();
  const role = headersList.get('x-user-role');
  return role === 'ADMIN';
}

export async function addMahasiswaManual(formData: FormData) {
  if (!(await isAdmin())) return { error: 'Unauthorized' };

  const nim = formData.get('nim') as string;
  const name = formData.get('name') as string;
  const fakultas = formData.get('fakultas') as string;
  const programStudi = formData.get('programStudi') as string;
  
  if (!nim || !name) return { error: 'NIM dan Nama wajib diisi' };

  try {
    let angkatanStr = null;
    if (nim.length >= 5) {
      const match = nim.match(/^[A-Za-z0-9]{3}(\d{2})\d+$/);
      if (match && match[1]) {
        angkatanStr = "20" + match[1];
      }
    }

    const hashedPassword = await bcrypt.hash(nim, 10);

    await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: nim,
          password: hashedPassword,
          name,
          role: 'MAHASISWA',
          isApproved: true,
        }
      });
      
      await tx.mahasiswa.create({
        data: {
          userId: user.id,
          nim,
          name,
          fakultas,
          programStudi,
          angkatan: angkatanStr
        }
      });
    });
    
    revalidatePath('/admin/master');
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: 'Gagal menambah data Mahasiswa. Mungkin NIM sudah terdaftar.' };
  }
}

export async function addDosenManual(formData: FormData) {
  if (!(await isAdmin())) return { error: 'Unauthorized' };

  const nidn = formData.get('nidn') as string;
  const name = formData.get('name') as string;
  
  if (!nidn || !name) return { error: 'NIDN dan Nama wajib diisi' };

  try {
    const hashedPassword = await bcrypt.hash(nidn, 10);

    await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: nidn,
          password: hashedPassword,
          name,
          role: 'DOSEN',
          isApproved: true,
        }
      });
      
      await tx.dosen.create({
        data: {
          userId: user.id,
          nidn,
          name,
        }
      });
    });
    
    revalidatePath('/admin/master');
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: 'Gagal menambah data Dosen. Mungkin NIDN sudah terdaftar.' };
  }
}

export async function addMataKuliahManual(formData: FormData) {
  if (!(await isAdmin())) return { error: 'Unauthorized' };

  const kodeMk = formData.get('kodeMk') as string;
  const namaMk = formData.get('namaMk') as string;
  const sks = parseInt(formData.get('sks') as string);
  const semester = parseInt(formData.get('semester') as string);
  
  if (!kodeMk || !namaMk || isNaN(sks)) return { error: 'Kode, Nama, dan SKS wajib diisi' };

  try {
    await db.mataKuliah.create({
      data: {
        kodeMk,
        namaMk,
        sks,
        semester: isNaN(semester) ? null : semester,
      }
    });
    
    revalidatePath('/admin/master');
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: 'Gagal menambah Mata Kuliah. Mungkin Kode MK sudah terdaftar.' };
  }
}
