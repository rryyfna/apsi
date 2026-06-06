import { getAdminDashboardData } from '@/app/actions/admin';
import { Users, GraduationCap, BookOpen, Layers, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import AngkatanDistributionChart from '@/app/components/admin/AngkatanDistributionChart';
import CourseEnrollmentChart from '@/app/components/admin/CourseEnrollmentChart';
import PrintPDFButton from '@/app/components/PrintPDFButton';

export default async function AdminDashboard() {
  const data = await getAdminDashboardData();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Monitoring & Laporan Admin</h1>
        <div className="flex items-center space-x-3">
          <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-4 py-2 rounded-lg">
            Periode: Ganjil 2024/2025
          </span>
          <PrintPDFButton targetId="admin-dashboard-report" fileName="Laporan_Monitoring_Admin" />
        </div>
      </div>

      <div id="admin-dashboard-report" className="space-y-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribusi Angkatan (Pie Chart) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1">
          <div className="flex items-center mb-4">
            <PieChartIcon className="w-5 h-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-bold text-gray-800">Sebaran Mahasiswa Aktif</h3>
          </div>
          <AngkatanDistributionChart data={data.angkatanDistribution} />
        </div>

        {/* Course Enrollments (Bar Chart) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-5 h-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-bold text-gray-800">Top Peminat Mata Kuliah</h3>
          </div>
          <CourseEnrollmentChart data={data.courseEnrollments} />
        </div>
      </div>
      </div>
    </div>
  );
}
