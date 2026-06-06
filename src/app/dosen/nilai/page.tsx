'use client';

import { useState, useEffect } from 'react';
import { getDosenDashboardData, getKelasWithEnrollments, updateNilai } from '@/app/actions/dosen';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';
import PrintPDFButton from '@/app/components/PrintPDFButton';

export default function InputNilaiPage() {
  const [kelas, setKelas] = useState<any[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'error'|'success', text: string} | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setIsLoading(true);
    try {
      const data = await getDosenDashboardData();
      setKelas(data.kelas);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSelectKelas(kelasId: string) {
    setIsLoading(true);
    setMessage(null);
    try {
      const detail = await getKelasWithEnrollments(kelasId);
      setSelectedKelas(detail);
      setEnrollments(detail.enrollments);
    } catch (e) {
      setMessage({ type: 'error', text: 'Gagal memuat detail kelas.' });
    } finally {
      setIsLoading(false);
    }
  }

  const handleInputChange = (id: string, field: string, value: string) => {
    setEnrollments(prev => prev.map(en => 
      en.id === id ? { ...en, [field]: value } : en
    ));
  };

  async function handleSaveNilai(enrollmentId: string) {
    setIsSaving(true);
    setMessage(null);
    try {
      const en = enrollments.find(e => e.id === enrollmentId);
      const res = await updateNilai(enrollmentId, {
        nilaiTugas: en.nilaiTugas,
        nilaiUts: en.nilaiUts,
        nilaiUas: en.nilaiUas,
        nilaiPartisipasi: en.nilaiPartisipasi,
        nilaiProyek: en.nilaiProyek
      });

      if (res.error) {
        setMessage({ type: 'error', text: res.error });
      } else {
        setMessage({ type: 'success', text: 'Nilai berhasil disimpan!' });
        // Reload detail
        handleSelectKelas(selectedKelas.id);
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan sistem.' });
    } finally {
      setIsSaving(false);
    }
  }

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
          defaultValue=""
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
              <p className="text-blue-100 text-sm">Bobot: Tugas 20%, UTS 30%, UAS 30%, Partisipasi 10%, Proyek 10%</p>
            </div>
            <div className="flex-shrink-0">
               <PrintPDFButton targetId="class-report" fileName={`Nilai_${selectedKelas.mataKuliah.kodeMk}_Kls_${selectedKelas.namaKelas}`} />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIM</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Mahasiswa</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Tugas</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">UTS</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">UAS</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Partisipasi</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Proyek</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Akhir</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-blue-600 uppercase tracking-wider">Huruf</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enrollments.map((en) => (
                  <tr key={en.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{en.mahasiswa.nim}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{en.mahasiswa.name}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input type="number" min="0" max="100" value={en.nilaiTugas || ''} onChange={(e) => handleInputChange(en.id, 'nilaiTugas', e.target.value)} className="w-16 px-2 py-1 border rounded text-center text-sm" />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input type="number" min="0" max="100" value={en.nilaiUts || ''} onChange={(e) => handleInputChange(en.id, 'nilaiUts', e.target.value)} className="w-16 px-2 py-1 border rounded text-center text-sm" />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input type="number" min="0" max="100" value={en.nilaiUas || ''} onChange={(e) => handleInputChange(en.id, 'nilaiUas', e.target.value)} className="w-16 px-2 py-1 border rounded text-center text-sm" />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input type="number" min="0" max="100" value={en.nilaiPartisipasi || ''} onChange={(e) => handleInputChange(en.id, 'nilaiPartisipasi', e.target.value)} className="w-16 px-2 py-1 border rounded text-center text-sm" />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input type="number" min="0" max="100" value={en.nilaiProyek || ''} onChange={(e) => handleInputChange(en.id, 'nilaiProyek', e.target.value)} className="w-16 px-2 py-1 border rounded text-center text-sm" />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-700">{en.nilaiAkhir ?? '-'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-extrabold text-blue-600">{en.huruf ?? '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => handleSaveNilai(en.id)}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center disabled:opacity-50"
                      >
                        <Save className="w-4 h-4 mr-1" /> Simpan
                      </button>
                    </td>
                  </tr>
                ))}
                {enrollments.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-6 py-8 text-center text-gray-500">Belum ada mahasiswa terdaftar.</td>
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
