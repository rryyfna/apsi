import { getMahasiswaDashboardData } from '@/app/actions/mahasiswa';
import { BookOpen, GraduationCap, TrendingUp, Award, PieChart as PieChartIcon } from 'lucide-react';
import GradeDistributionChart from '@/app/components/mahasiswa/GradeDistributionChart';

export default async function MahasiswaDashboard() {
  const data = await getMahasiswaDashboardData();
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard Mahasiswa</h1>
      
      {/* Profil Singkat */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{data.profile.name}</h2>
          <p className="text-gray-500 font-medium">{data.profile.nim} • {data.profile.programStudi}</p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-sm text-gray-500">Status Akademik</p>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mt-1">
            Aktif
          </span>
        </div>
      </div>

      {/* Statistik Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Indeks Prestasi Kumulatif</p>
            <p className="text-2xl font-bold text-gray-800">{data.stats.ipk}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
            <GraduationCap className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total SKS Ditempuh</p>
            <p className="text-2xl font-bold text-gray-800">{data.stats.totalSks}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
            <BookOpen className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">SKS Aktif Semester Ini</p>
            <p className="text-2xl font-bold text-gray-800">
              {data.activeClasses.reduce((acc, curr) => acc + curr.sks, 0)}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
            <Award className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Semester</p>
            <p className="text-2xl font-bold text-gray-800">Ganjil 2024</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribusi Nilai (Pie Chart) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1">
          <div className="flex items-center mb-4">
            <PieChartIcon className="w-5 h-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-bold text-gray-800">Distribusi Nilai</h3>
          </div>
          <GradeDistributionChart data={data.gradeDistribution} />
        </div>

        {/* Mata Kuliah Aktif */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Mata Kuliah Semester Ini</h3>
        </div>
        {data.activeClasses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode MK</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mata Kuliah</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKS</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.activeClasses.map((mk, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{mk.kodeMk}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mk.namaMk}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mk.sks}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mk.kelas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>Belum ada mata kuliah aktif. Silakan isi KRS.</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
