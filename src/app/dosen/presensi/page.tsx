import { getDosenDashboardData } from '@/app/actions/dosen';
import SemesterFilter from '@/app/components/SemesterFilter';
import { CalendarCheck, Users } from 'lucide-react';
import Link from 'next/link';

export default async function DosenPresensiPage({ searchParams }: { searchParams: Promise<{ semester?: string }> }) {
  const resolvedParams = await searchParams;
  const semesterFilter = resolvedParams?.semester ? parseInt(resolvedParams.semester) : undefined;
  const data = await getDosenDashboardData();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Rekap Presensi Mahasiswa</h1>
          <p className="text-gray-500 mt-1">Pilih kelas untuk melihat atau mencetak presensi.</p>
        </div>
        <div className="flex items-center space-x-3">
          <SemesterFilter />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {data.kelas.map((k: { id: string; namaKelas: string; kodeMk: string; mataKuliah: string; jumlahMahasiswa: number }) => (
          <div key={k.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">Kelas {k.namaKelas}</span>
                <span className="text-sm text-gray-500 font-mono">{k.kodeMk}</span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-800 line-clamp-2">{k.mataKuliah}</h3>
              
              <div className="mt-4 flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                {k.jumlahMahasiswa} Mahasiswa terdaftar
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100">
              <Link href={`/dosen/presensi/${k.id}`} className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg flex items-center justify-center font-medium transition-colors">
                <CalendarCheck className="w-4 h-4 mr-2" />
                Lihat Presensi
              </Link>
            </div>
          </div>
        ))}
        {data.kelas.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            Tidak ada kelas yang sesuai dengan filter.
          </div>
        )}
      </div>
    </div>
  );
}
