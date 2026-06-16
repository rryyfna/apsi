'use client';

import { useState, useEffect } from 'react';
import { getDosenDashboardData, getKelasWithEnrollments, updateNilai, saveBobotKelas } from '@/app/actions/dosen';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';
import PrintPDFButton from '@/app/components/PrintPDFButton';
import ImportExcelButton from '@/app/components/ImportExcelButton';

export default function InputNilaiPage() {
  const [kelas, setKelas] = useState<any[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'error'|'success', text: string} | null>(null);

  const [isBobotModalOpen, setIsBobotModalOpen] = useState(false);
  const [bobotData, setBobotData] = useState({ bobotTugas: 20, bobotUts: 30, bobotUas: 30, bobotPartisipasi: 10, bobotProyek: 10 });

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
      setBobotData({
        bobotTugas: detail.bobotTugas ?? 20,
        bobotUts: detail.bobotUts ?? 30,
        bobotUas: detail.bobotUas ?? 30,
        bobotPartisipasi: detail.bobotPartisipasi ?? 10,
        bobotProyek: detail.bobotProyek ?? 10
      });
    } catch (e) {
      setMessage({ type: 'error', text: 'Gagal memuat detail kelas.' });
    } finally {
      setIsLoading(false);
    }
  }

  const handleInputChange = (id: string, field: string, value: string) => {
    setEnrollments(prev => prev.map(en => {
      if (en.id === id) {
        const updated = { ...en, [field]: value };
        // Hitung ulang total & huruf secara dinamis
        if (selectedKelas) {
          const wTugas = (selectedKelas.bobotTugas ?? 20) / 100;
          const wUts = (selectedKelas.bobotUts ?? 30) / 100;
          const wUas = (selectedKelas.bobotUas ?? 30) / 100;
          const wPartisipasi = (selectedKelas.bobotPartisipasi ?? 10) / 100;
          const wProyek = (selectedKelas.bobotProyek ?? 10) / 100;

          let total = 0;
          const t = parseFloat(updated.nilaiTugas || '0'); if (!isNaN(t)) total += (t * wTugas);
          const uts = parseFloat(updated.nilaiUts || '0'); if (!isNaN(uts)) total += (uts * wUts);
          const uas = parseFloat(updated.nilaiUas || '0'); if (!isNaN(uas)) total += (uas * wUas);
          const p = parseFloat(updated.nilaiPartisipasi || '0'); if (!isNaN(p)) total += (p * wPartisipasi);
          const pr = parseFloat(updated.nilaiProyek || '0'); if (!isNaN(pr)) total += (pr * wProyek);

          let huruf = 'E';
          let skala4 = 0.0;
          if (total >= 85) { huruf = 'A'; skala4 = 4.0; }
          else if (total >= 80) { huruf = 'A-'; skala4 = 3.7; }
          else if (total >= 75) { huruf = 'B+'; skala4 = 3.3; }
          else if (total >= 70) { huruf = 'B'; skala4 = 3.0; }
          else if (total >= 65) { huruf = 'C+'; skala4 = 2.7; }
          else if (total >= 60) { huruf = 'C'; skala4 = 2.0; }
          else if (total >= 50) { huruf = 'D'; skala4 = 1.0; }

          updated.nilaiTotal = Math.round(total * 100) / 100; // 2 decimal places
          updated.nilaiAkhir = skala4;
          updated.huruf = huruf;
        }
        return updated;
      }
      return en;
    }));
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

  async function handleSaveBobot() {
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await saveBobotKelas(selectedKelas.id, bobotData);
      if (res.error) {
        setMessage({ type: 'error', text: res.error });
      } else {
        setMessage({ type: 'success', text: 'Bobot berhasil diperbarui!' });
        setIsBobotModalOpen(false);
        handleSelectKelas(selectedKelas.id); // Reload
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat menyimpan bobot.' });
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
              <p className="text-blue-100 text-sm">
                Bobot: Tugas {selectedKelas.bobotTugas ?? 20}%, UTS {selectedKelas.bobotUts ?? 30}%, UAS {selectedKelas.bobotUas ?? 30}%, Partisipasi {selectedKelas.bobotPartisipasi ?? 10}%, Proyek {selectedKelas.bobotProyek ?? 10}%
              </p>
            </div>
            <div className="flex-shrink-0 flex space-x-2">
               <ImportExcelButton kelasId={selectedKelas.id} onSuccess={() => handleSelectKelas(selectedKelas.id)} />
               <button onClick={() => setIsBobotModalOpen(true)} className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-md font-semibold text-sm hover:bg-yellow-500 transition-colors">
                 Atur Bobot
               </button>
               <a href={`/dosen/nilai/cpmk/${selectedKelas.id}`} className="bg-white text-blue-600 px-4 py-2 rounded-md font-semibold text-sm hover:bg-gray-100 transition-colors">
                 Plotting CPMK
               </a>
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
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-700">{en.nilaiTotal ?? '-'}</td>
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

      {/* Modal Atur Bobot */}
      {isBobotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Atur Bobot Penilaian</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Bobot Tugas (%)</label>
                <input type="number" min="0" max="100" value={bobotData.bobotTugas} onChange={e => setBobotData({...bobotData, bobotTugas: parseInt(e.target.value) || 0})} className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bobot UTS (%)</label>
                <input type="number" min="0" max="100" value={bobotData.bobotUts} onChange={e => setBobotData({...bobotData, bobotUts: parseInt(e.target.value) || 0})} className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bobot UAS (%)</label>
                <input type="number" min="0" max="100" value={bobotData.bobotUas} onChange={e => setBobotData({...bobotData, bobotUas: parseInt(e.target.value) || 0})} className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bobot Partisipasi (%)</label>
                <input type="number" min="0" max="100" value={bobotData.bobotPartisipasi} onChange={e => setBobotData({...bobotData, bobotPartisipasi: parseInt(e.target.value) || 0})} className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bobot Proyek (%)</label>
                <input type="number" min="0" max="100" value={bobotData.bobotProyek} onChange={e => setBobotData({...bobotData, bobotProyek: parseInt(e.target.value) || 0})} className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 text-sm font-semibold flex justify-between">
              <span>Total Bobot:</span>
              <span className={(bobotData.bobotTugas + bobotData.bobotUts + bobotData.bobotUas + bobotData.bobotPartisipasi + bobotData.bobotProyek) === 100 ? 'text-green-600' : 'text-red-600'}>
                {bobotData.bobotTugas + bobotData.bobotUts + bobotData.bobotUas + bobotData.bobotPartisipasi + bobotData.bobotProyek}%
              </span>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setIsBobotModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">Batal</button>
              <button onClick={handleSaveBobot} disabled={isSaving || (bobotData.bobotTugas + bobotData.bobotUts + bobotData.bobotUas + bobotData.bobotPartisipasi + bobotData.bobotProyek !== 100)} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium disabled:opacity-50">
                {isSaving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
