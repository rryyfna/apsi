import { getDosenDashboardData } from '@/app/actions/dosen';
import { Users, BookOpen, PieChart as PieChartIcon } from 'lucide-react';
import GradeDistributionChart from '@/app/components/mahasiswa/GradeDistributionChart';

export default async function DosenDashboard() {
  const data = await getDosenDashboardData();
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard Dosen</h1>
      
      {/* Profil Singkat */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{data.profile.name}</h2>
          <p className="text-gray-500 font-medium">NIDN: {data.profile.nidn}</p>
        </div>
        <div className="hidden md:block text-right">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mt-1">
            Dosen Tetap
          </span>
        </div>
      </div>

      {/* Statistik Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Kelas Diampu</p>
            <p className="text-2xl font-bold text-gray-800">{data.stats.totalKelas}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Mahasiswa Ajar</p>
            <p className="text-2xl font-bold text-gray-800">{data.stats.totalMahasiswaDiajar}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribusi Nilai (Pie Chart) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1">
          <div className="flex items-center mb-4">
            <PieChartIcon className="w-5 h-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-bold text-gray-800">Sebaran Nilai</h3>
          </div>
          <GradeDistributionChart data={data.gradeDistribution} />
        </div>

        {/* Daftar Kelas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Daftar Kelas Semester Ini</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode MK</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mata Kuliah</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Jml Mahasiswa</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.kelas.map((k: any) => (
                <tr key={k.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{k.kodeMk}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{k.mataKuliah}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-700 bg-gray-50">{k.namaKelas}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {k.jumlahMahasiswa}
                    </span>
                  </td>
                </tr>
              ))}
              {data.kelas.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Belum ada kelas yang diampu.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </div>
  );
}
