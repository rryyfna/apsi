'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getPendingUsers() {
  try {
    const users = await db.user.findMany({
      where: {
        isApproved: false,
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    return users;
  } catch (error) {
    console.error("Error fetching pending users:", error);
    return [];
  }
}

export async function approveUser(userId: string) {
  try {
    await db.user.update({
      where: { id: userId },
      data: { isApproved: true },
    });
    revalidatePath('/admin/approval');
    return { success: true };
  } catch (error) {
    console.error("Error approving user:", error);
    return { error: 'Gagal menyetujui pengguna' };
  }
}

export async function rejectUser(userId: string) {
  try {
    // Delete user and associated profile (mahasiswa/dosen) via cascading if setup, 
    // or manually delete them to be safe.
    await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) return;
      
      if (user.role === 'MAHASISWA') {
        await tx.mahasiswa.deleteMany({ where: { userId: user.id } });
      } else if (user.role === 'DOSEN') {
        await tx.dosen.deleteMany({ where: { userId: user.id } });
      }
      
      await tx.user.delete({ where: { id: userId } });
    });
    
    revalidatePath('/admin/approval');
    return { success: true };
  } catch (error) {
    console.error("Error rejecting user:", error);
    return { error: 'Gagal menolak pengguna' };
  }
}
