'use server';

import { db } from '@/lib/db';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function getMataKuliahWithCpmk() {
  const mk = await db.mataKuliah.findMany({
    include: {
      cpmk: true
    },
    orderBy: { kodeMk: 'asc' }
  });
  return mk;
}

export async function saveCpmkSetting(mataKuliahId: string, cpmks: { id?: string, kode: string, deskripsi: string, deskripsiEn?: string }[]) {
  try {
    const existingCpmks = await db.cPMK.findMany({ where: { mataKuliahId } });
    const existingIds = existingCpmks.map(c => c.id);
    const incomingIds = cpmks.map(c => c.id).filter(id => id && id.startsWith('c'));

    // Delete those that are removed
    const idsToDelete = existingIds.filter(id => !incomingIds.includes(id));
    if (idsToDelete.length > 0) {
      await db.cPMK.deleteMany({
        where: { id: { in: idsToDelete } }
      });
    }

    // Upsert the rest
    for (const item of cpmks) {
      if (item.id && item.id.startsWith('c')) {
        await db.cPMK.update({
          where: { id: item.id },
          data: {
            kode: item.kode,
            deskripsi: item.deskripsi || '',
            deskripsiEn: item.deskripsiEn || null
          }
        });
      } else {
        await db.cPMK.create({
          data: {
            kode: item.kode,
            deskripsi: item.deskripsi || '',
            deskripsiEn: item.deskripsiEn || null,
            mataKuliahId
          }
        });
      }
    }

    revalidatePath('/kaprodi/cpmk');
    return { success: true };
  } catch (error: any) {
    console.error('Error saving CPMK:', error);
    return { success: false, error: error.message || 'Gagal menyimpan pengaturan CPMK' };
  }
}

export async function getMonitoringCpl() {
  const enrollments = await db.enrollment.findMany({
    include: {
      mahasiswa: true,
      kelas: {
        include: {
          cpmkKolomNilai: true,
          mataKuliah: {
            include: {
              cpmk: {
                include: {
                  cplMappings: {
                    include: {
                      cpl: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  const studentMap = new Map<string, any>();

  for (const en of enrollments) {
    const nim = en.mahasiswa.nim;
    if (!studentMap.has(nim)) {
      studentMap.set(nim, {
        id: en.mahasiswa.id,
        nim: nim,
        name: en.mahasiswa.name,
        cplScores: {}
      });
    }

    const mhs = studentMap.get(nim);

    // Hitung skor masing-masing CPMK berdasarkan plotting kelas
    const cpmkScores = new Map<string, number>();

    en.kelas.mataKuliah.cpmk.forEach(cpmk => {
      let score = 0;
      const mappings = en.kelas.cpmkKolomNilai.filter(m => m.cpmkId === cpmk.id);
      
      mappings.forEach(m => {
        const percentage = m.bobot / 100;
        let colScore = 0;
        if (m.namaKolom.toLowerCase() === 'tugas') colScore = en.nilaiTugas || 0;
        else if (m.namaKolom.toLowerCase() === 'uts') colScore = en.nilaiUts || 0;
        else if (m.namaKolom.toLowerCase() === 'uas') colScore = en.nilaiUas || 0;
        else if (m.namaKolom.toLowerCase() === 'partisipasi') colScore = en.nilaiPartisipasi || 0;
        else if (m.namaKolom.toLowerCase() === 'proyek') colScore = en.nilaiProyek || 0;
        
        score += colScore * percentage;
      });
      cpmkScores.set(cpmk.id, score);
    });

    // Petakan skor CPMK ke CPL
    // Karena "a" dianggap sama semua, IK = Average(CPMK), CPL = Average(IK).
    // Secara matematis jika bobot sama, skor CPL kelas ini adalah rata-rata skor CPMK yang terkait.
    const classCplScores = new Map<string, { total: number, count: number }>();
    
    en.kelas.mataKuliah.cpmk.forEach(cpmk => {
      const cpmkScore = cpmkScores.get(cpmk.id) || 0;
      cpmk.cplMappings.forEach(mapping => {
        const cplKode = mapping.cpl.kode;
        if (!classCplScores.has(cplKode)) {
          classCplScores.set(cplKode, { total: 0, count: 0 });
        }
        const data = classCplScores.get(cplKode)!;
        data.total += cpmkScore;
        data.count += 1;
      });
    });

    // Tambahkan rata-rata CPL kelas ini ke skor agregat mahasiswa
    for (const [cplKode, data] of classCplScores.entries()) {
      if (!mhs.cplScores[cplKode]) {
        mhs.cplScores[cplKode] = { total: 0, count: 0 };
      }
      const cplScoreForClass = data.total / data.count; // Average of mapped CPMKs
      mhs.cplScores[cplKode].total += cplScoreForClass;
      mhs.cplScores[cplKode].count += 1;
    }
  }

  const result = Array.from(studentMap.values()).map(mhs => {
    const finalScores: Record<string, number> = {};
    for (const [cplKode, data] of Object.entries(mhs.cplScores) as any) {
      finalScores[cplKode] = Math.round(data.total / data.count);
    }
    return {
      id: mhs.id,
      nim: mhs.nim,
      name: mhs.name,
      cplScores: finalScores
    };
  });

  return result.sort((a, b) => a.nim.localeCompare(b.nim));
}
