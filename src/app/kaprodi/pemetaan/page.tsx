'use client';

import { useState, useEffect } from 'react';
import { getPemetaanCpmkCpl } from '@/app/actions/pemetaan';
import PrintPDFButton from '@/app/components/PrintPDFButton';
import { Loader2, Check } from 'lucide-react';

interface CplData {
  id: string;
  kode: string;
  deskripsi: string;
}

interface MatrixData {
  mkId: string;
  namaMk: string;
  kodeMk: string;
  semester: number | null;
  cpmks: string[];
  cplScores: Record<string, boolean>;
}

export default function PemetaanDashboard() {
  const [matrix, setMatrix] = useState<MatrixData[]>([]);
  const [allCpls, setAllCpls] = useState<CplData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getPemetaanCpmkCpl();
        setMatrix(data.matrix);
        setAllCpls(data.allCpls);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Peta Kurikulum</h1>
          <p className="text-gray-500">Pemetaan Mata Kuliah terhadap Capaian Pembelajaran Lulusan (CPL).</p>
        </div>
        <PrintPDFButton targetId="pemetaan-matrix" fileName="Peta_Kurikulum" />
      </div>

      <div id="pemetaan-matrix" className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 border-r border-gray-200">
                    Mata Kuliah
                  </th>
                  {allCpls.map(cpl => (
                    <th key={cpl.id} className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider" title={cpl.deskripsi}>
                      {cpl.kode}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {matrix.map(mk => (
                  <tr key={mk.mkId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 sticky left-0 bg-white group-hover:bg-gray-50 z-10 border-r border-gray-200">
                      <div>{mk.namaMk}</div>
                      <div className="text-xs font-normal text-gray-500">{mk.kodeMk} - SMT {mk.semester || '-'}</div>
                    </td>
                    {allCpls.map(cpl => (
                      <td key={`${mk.mkId}-${cpl.id}`} className="px-4 py-4 whitespace-nowrap text-center">
                        {mk.cplScores[cpl.kode] ? (
                          <div className="flex justify-center">
                            <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-blue-700" />
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                {matrix.length === 0 && (
                  <tr>
                    <td colSpan={allCpls.length + 1} className="px-6 py-8 text-center text-gray-500">
                      Tidak ada data pemetaan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
