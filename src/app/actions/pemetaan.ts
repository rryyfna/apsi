'use server';

import { db } from '@/lib/db';

export async function getPemetaanCpmkCpl() {
  const mataKuliahs = await db.mataKuliah.findMany({
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
    },
    orderBy: { semester: 'asc' }
  });

  const allCpls = await db.cPL.findMany({
    orderBy: { kode: 'asc' }
  });

  const matrix = mataKuliahs.map(mk => {
    const cplScores: Record<string, boolean> = {};
    
    // Check if mk has CPMK that maps to specific CPL
    mk.cpmk.forEach(c => {
      c.cplMappings.forEach(mapping => {
        cplScores[mapping.cpl.kode] = true;
      });
    });

    return {
      mkId: mk.id,
      kodeMk: mk.kodeMk,
      namaMk: mk.namaMk,
      semester: mk.semester,
      cpmks: mk.cpmk.map(c => c.kode),
      cplScores
    };
  });

  return { matrix, allCpls };
}
