'use server';

import { db } from '@/lib/db';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

async function getUserId() {
  const headersList = await headers();
  return headersList.get('x-user-id');
}

export async function getPresensiData(kelasId: string) {
  const userId = await getUserId();
  if (!userId) return null;

  const kelas = await db.kelas.findUnique({
    where: { id: kelasId },
    include: {
      mataKuliah: true,
      enrollments: {
        include: {
          mahasiswa: true
        }
      },
      presensi: {
        include: {
          records: true
        },
        orderBy: {
          pertemuanKe: 'asc'
        }
      }
    }
  });

  return kelas;
}

export async function savePresensi(kelasId: string, pertemuanKe: number, tanggal: Date, records: { mahasiswaId: string, status: any }[]) {
  const userId = await getUserId();
  if (!userId) return { error: 'Unauthorized' };

  try {
    await db.$transaction(async (tx) => {
      // Upsert Presensi
      const presensi = await tx.presensi.upsert({
        where: {
          kelasId_pertemuanKe: {
            kelasId,
            pertemuanKe
          }
        },
        update: {
          tanggal
        },
        create: {
          kelasId,
          pertemuanKe,
          tanggal
        }
      });

      // Upsert Records
      for (const record of records) {
        await tx.presensiRecord.upsert({
          where: {
            presensiId_mahasiswaId: {
              presensiId: presensi.id,
              mahasiswaId: record.mahasiswaId
            }
          },
          update: {
            status: record.status
          },
          create: {
            presensiId: presensi.id,
            mahasiswaId: record.mahasiswaId,
            status: record.status
          }
        });
      }
    });

    revalidatePath(`/dosen/presensi/${kelasId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Save Presensi Error", error);
    return { error: 'Gagal menyimpan presensi.' };
  }
}
