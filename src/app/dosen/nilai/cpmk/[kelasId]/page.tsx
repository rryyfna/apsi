'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, ArrowLeft, Info, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { getPlottingCpmk, savePlottingCpmk } from '@/app/actions/dosen';

export default function PlottingCpmkPage() {
  const params = useParams();
  const router = useRouter();
  const kelasId = params.kelasId as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [mataKuliah, setMataKuliah] = useState<any>(null);
  
  const columns = ['Tugas', 'UTS', 'UAS', 'Partisipasi', 'Proyek'];
  const [cpmks, setCpmks] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, Record<string, number>>>({});

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const kelas = await getPlottingCpmk(kelasId);
      if (kelas && kelas.mataKuliah) {
        setMataKuliah(kelas.mataKuliah);
        const cpmkList = kelas.mataKuliah.cpmk.map((c: any) => c.kode).sort();
        setCpmks(cpmkList);

        const initialMapping: Record<string, Record<string, number>> = {};
        columns.forEach(col => {
          initialMapping[col] = {};
          cpmkList.forEach((cpmkKode: string) => {
            // Cari data di kelas.cpmkKolomNilai
            const cpmkData = kelas.mataKuliah.cpmk.find((c: any) => c.kode === cpmkKode);
            if (cpmkData) {
              const kolomData = kelas.cpmkKolomNilai?.find(
                (k: any) => k.cpmkId === cpmkData.id && k.namaKolom.toLowerCase() === col.toLowerCase()
              );
              initialMapping[col][cpmkKode] = kolomData ? kolomData.bobot : 0;
            } else {
              initialMapping[col][cpmkKode] = 0;
            }
          });
        });
        setMapping(initialMapping);
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Gagal memuat data CPMK' });
    } finally {
      setIsLoading(false);
    }
  }

  const handlePercentageChange = (col: string, cpmk: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setMapping(prev => ({
      ...prev,
      [col]: {
        ...prev[col],
        [cpmk]: numValue
      }
    }));
  };

  const calculateColumnTotal = (cpmk: string) => {
    let total = 0;
    columns.forEach(col => {
      total += mapping[col]?.[cpmk] || 0;
    });
    return total;
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      if (!mataKuliah) throw new Error('Data Mata Kuliah tidak ditemukan');
      
      const res = await savePlottingCpmk(kelasId, mapping);
      if (res.error) {
        setMessage({ type: 'error', text: res.error });
      } else {
        setMessage({ type: 'success', text: 'Plotting CPMK berhasil disimpan!' });
        setTimeout(() => {
          router.push('/dosen/nilai');
        }, 1500);
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan sistem' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dosen/nilai" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Plotting CPMK Kelas: {mataKuliah?.namaMk}</h1>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center border ${message.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
          {message.type === 'error' ? <AlertCircle className="w-5 h-5 mr-3" /> : <Save className="w-5 h-5 mr-3" />}
          {message.text}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl flex items-start">
        <Info className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-bold mb-1">Panduan Plotting</p>
          <p>Distribusikan bobot persentase dari masing-masing komponen penilaian. Total bobot penilaian untuk <strong>satu CPMK</strong> (kolom ke bawah) harus persis 100% atau 0% (jika tidak dievaluasi).</p>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2">
        <h2 className="text-lg font-bold text-gray-800">Tabel Plotting</h2>
      </div>

      {cpmks.length === 0 ? (
        <div className="bg-yellow-50 text-yellow-800 p-6 rounded-xl border border-yellow-200 text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
          <p className="font-semibold">Mata kuliah ini belum memiliki CPMK.</p>
          <p className="text-sm mt-1">Harap hubungi Kaprodi untuk mendaftarkan CPMK terlebih dahulu.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-r border-gray-200 w-1/4">Komponen / CPMK</th>
                  {cpmks.map(cpmk => (
                    <th key={cpmk} className="px-4 py-4 text-center text-sm font-bold text-gray-700">{cpmk}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {columns.map(col => {
                  return (
                    <tr key={col} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800 border-r border-gray-200 bg-gray-50">
                        {col}
                      </td>
                      {cpmks.map(cpmk => (
                        <td key={cpmk} className="px-4 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center">
                            <input 
                              type="number" 
                              min="0" max="100" 
                              value={mapping[col]?.[cpmk] || ''}
                              onChange={(e) => handlePercentageChange(col, cpmk, e.target.value)}
                              className="w-16 px-2 py-1.5 border border-gray-300 rounded text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                            <span className="ml-1 text-gray-500">%</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                  );
                })}
                <tr className="bg-blue-50 border-t-2 border-blue-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 border-r border-blue-200 text-right">
                    Total
                  </td>
                  {cpmks.map(cpmk => {
                    const total = calculateColumnTotal(cpmk);
                    const isError = total !== 100 && total !== 0;
                    return (
                      <td key={`total-${cpmk}`} className="px-4 py-4 whitespace-nowrap text-center">
                        <span className={`font-bold ${isError ? 'text-red-600' : (total === 100 ? 'text-green-600' : 'text-gray-500')}`}>
                          {total}%
                        </span>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-5 border-t border-gray-100 bg-gray-50 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-sm flex items-center disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
              {isSaving ? 'Menyimpan...' : 'Simpan Plotting'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
