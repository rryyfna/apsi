'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import * as XLSX from 'xlsx';
import { headers } from 'next/headers';

async function isAdminOrKaprodi() {
  const headersList = await headers();
  const role = headersList.get('x-user-role');
  return role === 'ADMIN' || role === 'KAPRODI';
}

export async function importCpmkCplExcel(formData: FormData) {
  if (!(await isAdminOrKaprodi())) return { error: 'Unauthorized' };

  const file = formData.get('file') as File;
  if (!file) {
    return { error: 'File tidak ditemukan' };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    // Assuming the Excel has a sheet named 'CPMK' and 'CPL'
    // Format CPMK: Kode MK, Kode CPMK, Deskripsi (ID), Deskripsi (EN)
    // Format CPL: Kode CPL, Deskripsi (ID), Deskripsi (EN)
    
    let cpmkCount = 0;
    let cplCount = 0;

    const cpmkSheet = workbook.Sheets['CPMK'];
    if (cpmkSheet) {
      const cpmkData: any[] = XLSX.utils.sheet_to_json(cpmkSheet);
      for (const row of cpmkData) {
        const kodeMk = row['Kode MK'] || row['KODE_MK'] || row['Kode Mata Kuliah'];
        const kodeCpmk = row['Kode CPMK'] || row['KODE_CPMK'] || row['CPMK'];
        const deskripsiId = row['Deskripsi (ID)'] || row['Deskripsi'] || row['DESKRIPSI'];
        const deskripsiEn = row['Deskripsi (EN)'] || row['Deskripsi EN'] || row['DESKRIPSI_EN'];

        if (kodeMk && kodeCpmk && deskripsiId) {
          const mk = await db.mataKuliah.findUnique({ where: { kodeMk: kodeMk.toString() } });
          if (mk) {
            await db.cPMK.upsert({
              where: {
                mataKuliahId_kode: {
                  mataKuliahId: mk.id,
                  kode: kodeCpmk.toString()
                }
              },
              update: {
                deskripsi: deskripsiId.toString(),
                deskripsiEn: deskripsiEn ? deskripsiEn.toString() : null
              },
              create: {
                mataKuliahId: mk.id,
                kode: kodeCpmk.toString(),
                deskripsi: deskripsiId.toString(),
                deskripsiEn: deskripsiEn ? deskripsiEn.toString() : null
              }
            });
            cpmkCount++;
          }
        }
      }
    }

    const cplSheet = workbook.Sheets['CPL'];
    if (cplSheet) {
      const cplData: any[] = XLSX.utils.sheet_to_json(cplSheet);
      for (const row of cplData) {
        const kodeCpl = row['Kode CPL'] || row['KODE_CPL'] || row['CPL'];
        const deskripsiId = row['Deskripsi (ID)'] || row['Deskripsi'] || row['DESKRIPSI'];
        const deskripsiEn = row['Deskripsi (EN)'] || row['Deskripsi EN'] || row['DESKRIPSI_EN'];

        if (kodeCpl && deskripsiId) {
          await db.cPL.upsert({
            where: { kode: kodeCpl.toString() },
            update: {
              deskripsi: deskripsiId.toString(),
              deskripsiEn: deskripsiEn ? deskripsiEn.toString() : null
            },
            create: {
              kode: kodeCpl.toString(),
              deskripsi: deskripsiId.toString(),
              deskripsiEn: deskripsiEn ? deskripsiEn.toString() : null
            }
          });
          cplCount++;
        }
      }
    }

    revalidatePath('/admin/cpl');
    revalidatePath('/kaprodi/cpmk');
    return { success: true, message: `Berhasil mengimpor ${cpmkCount} CPMK dan ${cplCount} CPL.` };
  } catch (error: any) {
    console.error('Import Error:', error);
    return { error: 'Gagal membaca atau memproses file Excel.' };
  }
}
