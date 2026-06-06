import { getMasterData } from '@/app/actions/admin';
import { Database } from 'lucide-react';

export default async function MasterDataPage() {
  const data = await getMasterData();
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Database className="w-6 h-6 mr-3 text-blue-600" />
          Master Data
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Tabel Mahasiswa */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Data Mahasiswa (Preview)</h3>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIM</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prodi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.mahasiswa.map((m: any) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{m.nim}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{m.name}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{m.programStudi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabel Dosen */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Data Dosen (Preview)</h3>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIDN</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Dosen</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.dosen.map((d: any) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{d.nidn}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{d.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabel Mata Kuliah */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Mata Kuliah (Preview)</h3>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mata Kuliah</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">SKS</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.mataKuliah.map((mk: any) => (
                  <tr key={mk.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{mk.kodeMk}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{mk.namaMk}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-center text-sm text-gray-500">{mk.sks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabel Kelas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Daftar Kelas (Preview)</h3>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MK & Kelas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosen</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Peserta</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.kelas.map((k: any) => (
                  <tr key={k.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{k.mataKuliah.kodeMk} - {k.namaKelas}</div>
                      <div className="text-xs text-gray-500">{k.mataKuliah.namaMk}</div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{k.dosen.name}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-center text-sm font-bold text-blue-600">
                      {k._count.enrollments}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
