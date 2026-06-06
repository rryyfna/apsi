import { getAdminDashboardData } from '@/app/actions/admin';
import { Users, GraduationCap, BookOpen, Layers } from 'lucide-react';

export default async function AdminDashboard() {
  const data = await getAdminDashboardData();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Administrator</h1>
        <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-4 py-2 rounded-lg">
          Periode: Ganjil 2024/2025
        </span>
      </div>

      {/* Statistik Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mr-4">
            <GraduationCap className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Mahasiswa</p>
            <p className="text-3xl font-bold text-gray-800">{data.totalMahasiswa}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mr-4">
            <Users className="w-7 h-7 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Dosen</p>
            <p className="text-3xl font-bold text-gray-800">{data.totalDosen}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mr-4">
            <BookOpen className="w-7 h-7 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Mata Kuliah</p>
            <p className="text-3xl font-bold text-gray-800">{data.totalMataKuliah}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mr-4">
            <Layers className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Kelas Dibuka</p>
            <p className="text-3xl font-bold text-gray-800">{data.totalKelas}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Pusat Kendali SIAKAD</h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Selamat datang di panel admin. Anda dapat mengelola seluruh data master seperti Dosen, Mahasiswa, Mata Kuliah, dan Kelas pada menu Master Data di sebelah kiri.
        </p>
      </div>
    </div>
  );
}
