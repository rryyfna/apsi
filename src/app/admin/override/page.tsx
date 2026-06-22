'use client';

import { useState } from 'react';
import { searchEnrollments, overrideNilai } from '@/app/actions/override';
import { Search, Save, AlertCircle } from 'lucide-react';

export default function OverridePage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<any | null>(null);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string}|null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data = await searchEnrollments(query);
    setResults(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    formData.append('enrollmentId', selectedEnrollment.id);
    
    const res = await overrideNilai(formData);
    if (res.success) {
      setMessage({ type: 'success', text: 'Nilai berhasil dioverride!' });
      setSelectedEnrollment(null);
      // Refresh search results
      const data = await searchEnrollments(query);
      setResults(data);
    } else {
      setMessage({ type: 'error', text: res.error || 'Terjadi kesalahan' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800">Admin Override Nilai</h1>
        <p className="text-gray-600 mt-1">Cari Mahasiswa atau Kelas untuk mengubah komponen nilai secara paksa (override).</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg shadow-sm border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <form onSubmit={handleSearch} className="flex space-x-2 mb-6">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari NIM, Nama Mahasiswa, atau Mata Kuliah..." 
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
            />
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Search className="w-5 h-5" />
            </button>
          </form>

          {loading ? (
            <p className="text-gray-500 text-center">Mencari...</p>
          ) : (
            <div className="space-y-3">
              {results.length === 0 && query && !loading && (
                <p className="text-gray-500 text-center">Tidak ditemukan hasil.</p>
              )}
              {results.map((enr) => (
                <div 
                  key={enr.id} 
                  onClick={() => setSelectedEnrollment(enr)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedEnrollment?.id === enr.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
                >
                  <div className="font-semibold text-gray-800">{enr.mahasiswa.name} ({enr.mahasiswa.nim})</div>
                  <div className="text-sm text-gray-600">{enr.kelas.mataKuliah.namaMk} - Kelas {enr.kelas.namaKelas}</div>
                  <div className="text-xs text-gray-500 mt-2 font-mono">
                    Total: {enr.nilaiAkhir || '-'} | Huruf: {enr.huruf || '-'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          {selectedEnrollment ? (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 relative">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Edit Nilai: {selectedEnrollment.mahasiswa.name}</h2>
              
              <form onSubmit={handleSave} className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tugas ({selectedEnrollment.kelas.bobotTugas}%)</label>
                    <input type="number" step="0.01" name="nilaiTugas" defaultValue={selectedEnrollment.nilaiTugas || ''} className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">UTS ({selectedEnrollment.kelas.bobotUts}%)</label>
                    <input type="number" step="0.01" name="nilaiUts" defaultValue={selectedEnrollment.nilaiUts || ''} className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">UAS ({selectedEnrollment.kelas.bobotUas}%)</label>
                    <input type="number" step="0.01" name="nilaiUas" defaultValue={selectedEnrollment.nilaiUas || ''} className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Partisipasi ({selectedEnrollment.kelas.bobotPartisipasi}%)</label>
                    <input type="number" step="0.01" name="nilaiPartisipasi" defaultValue={selectedEnrollment.nilaiPartisipasi || ''} className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Proyek ({selectedEnrollment.kelas.bobotProyek}%)</label>
                    <input type="number" step="0.01" name="nilaiProyek" defaultValue={selectedEnrollment.nilaiProyek || ''} className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" />
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center text-orange-600 text-sm font-medium">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Perubahan disimpan sebagai Override
                  </div>
                  <button type="submit" className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Save className="w-4 h-4 mr-2" />
                    Simpan Override
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-gray-50 p-10 rounded-xl border border-dashed border-gray-300 text-center text-gray-500 h-full flex items-center justify-center">
              Pilih data KRS di sebelah kiri untuk mengedit nilainya.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
