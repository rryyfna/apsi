'use client';

import { useState, useEffect } from 'react';
import { getAvailableClasses, enrollClass, getMahasiswaDashboardData } from '@/app/actions/mahasiswa';
import { BookOpen, CheckCircle, AlertCircle } from 'lucide-react';

export default function KRSPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [activeClasses, setActiveClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [available, dashboard] = await Promise.all([
        getAvailableClasses(),
        getMahasiswaDashboardData()
      ]);
      setClasses(available);
      setActiveClasses(dashboard.activeClasses);
    } catch (e: any) {
      setError(e.message || 'Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEnroll(kelasId: string) {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const res = await enrollClass(kelasId);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess('Berhasil mendaftar kelas!');
        await loadData(); // Reload data
      }
    } catch (e: any) {
      setError('Terjadi kesalahan sistem');
    } finally {
      setIsLoading(false);
    }
  }

  const isEnrolled = (kodeMk: string, namaKelas: string) => {
    return activeClasses.some(c => c.kodeMk === kodeMk && c.kelas === namaKelas);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Kartu Rencana Studi (KRS)</h1>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center">
          <BookOpen className="w-4 h-4 mr-2" />
          SKS Diambil: {activeClasses.reduce((acc, curr) => acc + curr.sks, 0)} SKS
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center border border-red-200">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center border border-green-200">
          <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          {success}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-800">Daftar Kelas Tersedia</h3>
          <p className="text-sm text-gray-500">Pilih kelas yang ingin Anda ambil untuk semester ini.</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode MK</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mata Kuliah</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosen</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Kuota</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && classes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Memuat data kelas...</td>
                </tr>
              ) : classes.map((k) => {
                const enrolled = isEnrolled(k.mataKuliah.kodeMk, k.namaKelas);
                const isFull = k.jumlahAmbilReguler >= k.kuotaReguler;

                return (
                  <tr key={k.id} className={`hover:bg-gray-50 transition-colors ${enrolled ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{k.mataKuliah.kodeMk}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">{k.mataKuliah.namaMk}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{k.mataKuliah.sks}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold">{k.namaKelas}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{k.dosen.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      <span className={`${isFull ? 'text-red-600 font-bold' : ''}`}>
                        {k.jumlahAmbilReguler} / {k.kuotaReguler}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      {enrolled ? (
                        <span className="inline-flex items-center text-green-600 bg-green-50 px-3 py-1.5 rounded-lg text-xs font-semibold">
                          <CheckCircle className="w-4 h-4 mr-1.5" /> Diambil
                        </span>
                      ) : isFull ? (
                        <span className="inline-flex items-center text-red-600 bg-red-50 px-3 py-1.5 rounded-lg text-xs font-semibold">
                          Penuh
                        </span>
                      ) : (
                        <button
                          onClick={() => handleEnroll(k.id)}
                          disabled={isLoading}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          Ambil
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
