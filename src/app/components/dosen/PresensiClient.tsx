'use client';

import { useState } from 'react';
import { savePresensi } from '@/app/actions/presensi';
import { Save, ChevronLeft, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function PresensiClient({ data }: { data: any }) {
  const [pertemuanKe, setPertemuanKe] = useState(1);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Initialize status records
  const [records, setRecords] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    data.enrollments.forEach((e: any) => {
      init[e.mahasiswaId] = 'HADIR';
    });
    return init;
  });

  const handleStatusChange = (mahasiswaId: string, status: string) => {
    setRecords(prev => ({ ...prev, [mahasiswaId]: status }));
  };

  // When pertemuan changes, attempt to load past data
  const handlePertemuanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const p = parseInt(e.target.value);
    setPertemuanKe(p);
    
    const pastPresensi = data.presensi.find((pr: any) => pr.pertemuanKe === p);
    if (pastPresensi) {
      setTanggal(new Date(pastPresensi.tanggal).toISOString().split('T')[0]);
      const newRecords: Record<string, string> = {};
      pastPresensi.records.forEach((r: any) => {
        newRecords[r.mahasiswaId] = r.status;
      });
      // Fill missing
      data.enrollments.forEach((en: any) => {
        if (!newRecords[en.mahasiswaId]) newRecords[en.mahasiswaId] = 'HADIR';
      });
      setRecords(newRecords);
    } else {
      setTanggal(new Date().toISOString().split('T')[0]);
      // Reset to default
      const init: Record<string, string> = {};
      data.enrollments.forEach((e: any) => {
        init[e.mahasiswaId] = 'HADIR';
      });
      setRecords(init);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const recordArray = Object.keys(records).map(mId => ({
      mahasiswaId: mId,
      status: records[mId]
    }));

    const res = await savePresensi(data.id, pertemuanKe, new Date(tanggal), recordArray);
    
    if (res.success) {
      setMessage({ type: 'success', text: 'Data presensi berhasil disimpan!' });
    } else {
      setMessage({ type: 'error', text: res.error || 'Terjadi kesalahan' });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dosen/presensi" className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Presensi Kelas {data.namaKelas}</h1>
          <p className="text-gray-500">{data.mataKuliah.namaMk} ({data.mataKuliah.kodeMk})</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-start md:items-end">
        <div className="flex gap-4 w-full md:w-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pertemuan Ke</label>
            <select value={pertemuanKe} onChange={handlePertemuanChange} className="w-32 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none bg-white">
              {[...Array(16)].map((_, i) => (
                <option key={i+1} value={i+1}>{i+1}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
            <div className="relative">
              <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="w-48 pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none" />
              <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>
        </div>
        
        <button onClick={handleSubmit} disabled={loading} className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center font-medium disabled:opacity-50">
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Menyimpan...' : 'Simpan Presensi'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIM</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Mahasiswa</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status Kehadiran</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.enrollments.map((en: any, idx: number) => (
                <tr key={en.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{idx + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{en.mahasiswa.nim}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{en.mahasiswa.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap flex justify-center space-x-2">
                    {['HADIR', 'SAKIT', 'IZIN', 'ALPA'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(en.mahasiswaId, status)}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                          records[en.mahasiswaId] === status 
                            ? (status === 'HADIR' ? 'bg-green-100 text-green-800 ring-1 ring-green-400' :
                               status === 'ALPA' ? 'bg-red-100 text-red-800 ring-1 ring-red-400' :
                               'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-400')
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </td>
                </tr>
              ))}
              {data.enrollments.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Belum ada mahasiswa yang mengambil kelas ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
