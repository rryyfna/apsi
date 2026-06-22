'use server';

import { db } from '@/lib/db';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'supersecret_siakad_key');

export async function login(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const targetRole = formData.get('targetRole') as string;

  if (!username || !password) {
    return { error: 'Username dan Password wajib diisi!' };
  }

  // Cari user berdasarkan username (NIM/NIDN/NIP)
  const user = await db.user.findUnique({
    where: { username },
  });

  if (!user) {
    return { error: 'Username atau Password salah!' };
  }

  // Check if account is approved
  if (!user.isApproved) {
    return { error: 'Akun Anda sedang menunggu persetujuan (Pending Approval) dari Administrator.' };
  }

  // Fallback check for plaintext passwords from old seeder data
  const isPlaintext = !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$');
  const isValidPassword = isPlaintext 
    ? user.password === password 
    : await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    return { error: 'Username atau Password salah!' };
  }

  // Optional: Update plaintext password to bcrypt hash on successful login
  if (isPlaintext) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });
  }

  if (targetRole && user.role !== targetRole) {
    return { error: `Akses ditolak! Kredensial valid tetapi Anda bukan ${targetRole}. Silakan login di portal yang sesuai.` };
  }

  // Buat JWT Token
  const token = await new SignJWT({ id: user.id, username: user.username, role: user.role, name: user.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(JWT_SECRET);

  // Simpan ke Cookies
  (await cookies()).set('siakad_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  });

  // Tentukan rute redirect berdasarkan Role
  let redirectUrl = '/';
  if (user.role === 'MAHASISWA') {
    redirectUrl = '/mahasiswa';
  } else if (user.role === 'DOSEN') {
    redirectUrl = '/dosen';
  } else if (user.role === 'ADMIN') {
    redirectUrl = '/admin';
  } else if (user.role === 'KAPRODI') {
    redirectUrl = '/kaprodi';
  } else if (user.role === 'MUTU') {
    redirectUrl = '/mutu';
  }

  return { success: true, redirectUrl };
}

export async function register(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  const role = formData.get('role') as 'DOSEN' | 'MAHASISWA';
  const fakultas = formData.get('fakultas') as string;
  const programStudi = formData.get('programStudi') as string;

  if (!username || !password || !name || !role) {
    return { error: 'Semua field wajib diisi!' };
  }

  if (role !== 'DOSEN' && role !== 'MAHASISWA') {
    return { error: 'Role pendaftaran tidak valid. Hanya untuk Dosen atau Mahasiswa.' };
  }

  try {
    const existingUser = await db.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return { error: 'Username (NIM/NIDN) sudah terdaftar!' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Extract angkatan for mahasiswa if nim length is typical (e.g. I0321002)
    let angkatanStr = null;
    if (role === 'MAHASISWA' && username.length >= 5) {
      const match = username.match(/^[A-Za-z0-9]{3}(\d{2})\d+$/);
      if (match && match[1]) {
        angkatanStr = "20" + match[1];
      }
    }

    await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          username,
          password: hashedPassword,
          name,
          role,
          isApproved: false // Require admin approval
        }
      });

      if (role === 'MAHASISWA') {
        await tx.mahasiswa.create({
          data: {
            userId: newUser.id,
            nim: username,
            name,
            fakultas,
            programStudi,
            angkatan: angkatanStr
          }
        });
      } else if (role === 'DOSEN') {
        await tx.dosen.create({
          data: {
            userId: newUser.id,
            nidn: username,
            name
          }
        });
      }
    });

    return { success: true, message: 'Registrasi berhasil! Silakan tunggu persetujuan dari Administrator sebelum bisa login.' };
  } catch (error: any) {
    console.error("Register Error: ", error);
    return { error: 'Terjadi kesalahan pada server saat registrasi.' };
  }
}

export async function logout() {
  (await cookies()).delete('siakad_session');
  redirect('/');
}
