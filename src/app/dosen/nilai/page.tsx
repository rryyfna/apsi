'use client';

import { useState, useEffect } from 'react';
import { getDosenDashboardData, getKelasWithEnrollments, updateNilai } from '@/app/actions/dosen';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';
import PrintPDFButton from '@/app/components/PrintPDFButton';
import ImportExcelButton from '@/app/components/ImportExcelButton';
import Link from 'next/link';

interface KelasData {
  id: string;
  kodeMk: string;
  mataKuliah: string;
  namaKelas: string;
}

interface DynamicScore {
  kelasCpmkKolomNilaiId: string;
  nilai: number;
}

interface EnrollmentData {
  id: string;
  mahasiswa: { nim: string; name: string };
  kolomNilaiScores?: DynamicScore[];
  nilaiTotal?: number | null;
  nilaiAkhir?: number | null;
  huruf?: string | null;
  [key: string]: any; // for dynamic bindings
}

interface DetailKelas {
  id: string;
  namaKelas: string;
  cpmkKolomNilai: {
    id: string;
    namaKolom: string;
    bobot: number;
    cpmk: { kode: string };
  }[];
  mataKuliah: { 
    kodeMk: string; 
    namaMk: string; 
  };
}

export default function InputNilaiPage() {
  const [kelas, setKelas] = useState<KelasData[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<DetailKelas | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'error'|'success', text: string} | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      try {
        const data = await getDosenDashboardData();
        setKelas(data.kelas);
        if (data.kelas && data.kelas.length > 0) {
          const detail = await getKelasWithEnrollments(data.kelas[0].id);
          setSelectedKelas(detail);
          mapEnrollments(detail.enrollments || []);
        }
      } catch {
        console.error("Gagal memuat dashboard");
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  async function handleSelectKelas(kelasId: string) {
    setIsLoading(true);
    setMessage(null);
    try {
      const detail = await getKelasWithEnrollments(kelasId);
      setSelectedKelas(detail);
      mapEnrollments(detail.enrollments || []);
    } catch {
      setMessage({ type: 'error', text: 'Gagal memuat detail kelas.' });
    } finally {
      setIsLoading(false);
    }
  }

  const mapEnrollments = (rawEnrollments: any[]) => {
    // Map the dynamic scores into flattened properties for easy binding
    const mapped = rawEnrollments.map(en => {
      const newEn: any = { ...en };
      if (en.kolomNilaiScores) {
        en.kolomNilaiScores.forEach((score: DynamicScore) => {
          newEn[score.kelasCpmkKolomNilaiId] = score.nilai;
        });
      }
      return newEn;
    });
    setEnrollments(mapped);
  };

  const handleInputChange = (id: string, field: string, value: string) => {
    setEnrollments(prev => prev.map(en => {
      if (en.id === id) {
        const numValue = parseFloat(value);
        return { ...en, [field]: isNaN(numValue) ? null : numValue };
      }
      return en;
    }));
  };

  async function handleSaveNilai(enrollmentId: string, en: EnrollmentData) {
    setIsSaving(true);
    setMessage(null);
    try {
      // Build the data payload extracting only the dynamic column IDs
      const payload: any = {};
      selectedKelas?.cpmkKolomNilai?.forEach(k => {
        if (en[k.id] !== undefined && en[k.id] !== null) {
          payload[k.id] = en[k.id];
        }
      });

      const res = await updateNilai(enrollmentId, payload);
      if (res.error) {
        setMessage({ type: 'error', text: res.error });
      } else {
        setMessage({ type: 'success', text: 'Nilai berhasil disimpan!' });
        if (selectedKelas) handleSelectKelas(selectedKelas.id);
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan sistem.' });
    } finally {
      setIsSaving(false);
    }
  }

  const activeColumns = selectedKelas?.cpmkKolomNilai || [];
  const totalBobot = activeColumns.reduce((acc, c) => acc + c.bobot, 0);
  const isBobotValid = totalBobot === 100 && activeColumns.length > 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Manajemen Nilai</h1>

      {message && (
        <div className={`p-4 rounded-lg flex items-center border ${message.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
          {message.type === 'error' ? <AlertCircle className="w-5 h-5 mr-3" /> : <CheckCircle className="w-5 h-5 mr-3" />}
          {message.text}
        </div>
      )}

      {/* Pilih Kelas */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Pilih Kelas</label>
        <select 
          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          onChange={(e) => {
            if (e.target.value) handleSelectKelas(e.target.value);
            else { setSelectedKelas(null); setEnrollments([]); }
          }}
          value={selectedKelas?.id || ""}
        >
          <option value="" disabled>-- Pilih Kelas --</option>
          {kelas.map(k => (
            <option key={k.id} value={k.id}>{k.kodeMk} - {k.mataKuliah} (Kelas {k.namaKelas})</option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-gray-500">Memuat data...</p>}

      {/* Tabel Nilai */}
      {!isLoading && selectedKelas && (
        <div id="class-report" className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-blue-600 text-white flex justify-between items-center rounded-t-lg">
            <div>
              <h3 className="text-lg font-bold">Input Nilai: {selectedKelas.mataKuliah.namaMk} (Kelas {selectedKelas.namaKelas})</h3>
              {!isBobotValid && (
                <p className="text-yellow-300 text-sm font-semibold mt-1">
                  ⚠️ Peringatan: {activeColumns.length === 0 ? "Komponen penilaian belum diatur." : `Total bobot saat ini ${totalBobot}%.`} Harap atur di menu Plotting CPMK.
                </p>
              )}
            </div>
            <div className="flex-shrink-0 flex space-x-2">
               <ImportExcelButton kelasId={selectedKelas.id} onSuccess={() => handleSelectKelas(selectedKelas.id)} />
               <Link href={`/dosen/nilai/cpmk/${selectedKelas.id}`} className="bg-white text-blue-600 px-4 py-2 rounded-md font-semibold text-sm hover:bg-gray-100 transition-colors inline-block">
                 Plotting CPMK
               </Link>
               <PrintPDFButton targetId="class-report" fileName={`Nilai_${selectedKelas.mataKuliah.kodeMk}_Kls_${selectedKelas.namaKelas}`} />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIM</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Mahasiswa</th>
                  {activeColumns.map(c => (
                    <th key={c.id} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      {c.namaKolom} <br/>
                      <span className="text-[10px] text-blue-600 font-bold">{c.cpmk.kode}</span><br/>
                      <span className="text-[10px]">({c.bobot}%)</span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Skala 4</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-blue-600 uppercase tracking-wider">Huruf</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enrollments.map((en) => (
                  <tr key={en.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{en.mahasiswa.nim}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{en.mahasiswa.name}</td>
                    {activeColumns.map(c => (
                      <td key={c.id} className="px-4 py-4 whitespace-nowrap">
                        <input 
                          type="number" min="0" max="100" 
                          value={en[c.id] as number ?? ''} 
                          onChange={(e) => handleInputChange(en.id, c.id, e.target.value)} 
                          className="w-16 px-2 py-1 border rounded text-center text-sm" 
                        />
                      </td>
                    ))}
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-700">{en.nilaiTotal ?? '0'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-700">{en.nilaiAkhir ?? '0.0'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-extrabold text-blue-600">{en.huruf ?? 'E'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => handleSaveNilai(en.id, en)}
                        disabled={isSaving || !isBobotValid}
                        title={!isBobotValid ? "Total bobot harus 100% untuk menyimpan nilai" : ""}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center disabled:opacity-50"
                      >
                        <Save className="w-4 h-4 mr-1" /> Simpan
                      </button>
                    </td>
                  </tr>
                ))}
                {enrollments.length === 0 && (
                  <tr>
                    <td colSpan={6 + activeColumns.length} className="px-6 py-8 text-center text-gray-500">Belum ada mahasiswa terdaftar.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
