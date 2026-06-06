'use client';

import { useState } from 'react';
import { Target, AlertCircle, CheckCircle, Search } from 'lucide-react';
import PrintPDFButton from '@/app/components/PrintPDFButton';

export default function CPLMonitoringPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Dummy data representing CPL passed based on UK threshold logic
  const cplData = [
    { nim: 'I0323089', nama: 'MUHAMMAD THORIQ ALFARIZI', cpl1: true, cpl2: true, cpl3: false },
    { nim: 'I0323092', nama: 'NAJWA PERMATA HADI', cpl1: true, cpl2: true, cpl3: true },
    { nim: 'I0323098', nama: 'NICHOLAS RYAN PRADIPTA', cpl1: true, cpl2: false, cpl3: true },
    { nim: 'I0323099', nama: 'NISRINA HAMIDAH', cpl1: false, cpl2: true, cpl3: true },
  ];

  const filtered = cplData.filter(d => 
    d.nim.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Monitoring Capaian Pembelajaran Lulusan (CPL)</h1>
          <p className="text-gray-500 text-sm mt-1">Status CPL berdasarkan ambang batas (threshold) Nilai Unsur Kompetensi (UK)</p>
        </div>
        <PrintPDFButton targetId="cpl-report" fileName="Laporan_CPL_Mahasiswa" />
      </div>

      <div id="cpl-report" className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center text-gray-700 font-semibold">
            <Target className="w-5 h-5 mr-2 text-blue-600" /> Matriks CPL Mahasiswa Aktif
          </div>
          <div className="relative w-64 print:hidden">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari NIM atau Nama..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIM</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Mahasiswa</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">CPL-1 (Sikap)</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">CPL-2 (Pengetahuan)</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">CPL-3 (Keterampilan)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((m) => (
                <tr key={m.nim} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{m.nim}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.nama}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {m.cpl1 ? <CheckCircle className="w-5 h-5 text-green-500 mx-auto" /> : <AlertCircle className="w-5 h-5 text-red-500 mx-auto" />}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {m.cpl2 ? <CheckCircle className="w-5 h-5 text-green-500 mx-auto" /> : <AlertCircle className="w-5 h-5 text-red-500 mx-auto" />}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {m.cpl3 ? <CheckCircle className="w-5 h-5 text-green-500 mx-auto" /> : <AlertCircle className="w-5 h-5 text-red-500 mx-auto" />}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Tidak ada data ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
