'use server';

import { db } from '@/lib/db';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

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

  if (!user || user.password !== password) {
    return { error: 'Username atau Password salah!' };
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
  }

  return { success: true, redirectUrl };
}

import { redirect } from 'next/navigation';

export async function logout() {
  (await cookies()).delete('siakad_session');
  redirect('/');
}
