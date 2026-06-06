import { getMahasiswaDashboardData } from '@/app/actions/mahasiswa';
import { FileText, Printer } from 'lucide-react';
import { db } from '@/lib/db';
import { headers } from 'next/headers';

export default async function KHSPage() {
  const headersList = await headers();
  const userId = headersList.get('x-user-id') || '';

  const mahasiswa = await db.mahasiswa.findUnique({
    where: { userId },
    include: {
      enrollments: {
        include: {
          kelas: {
            include: { mataKuliah: true, dosen: true }
          }
        }
      }
    }
  });

  if (!mahasiswa) return <div>Data tidak ditemukan</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Kartu Hasil Studi (KHS)</h1>
        <button className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-semibold flex items-center shadow-sm transition-colors">
          <Printer className="w-4 h-4 mr-2" />
          Cetak KHS
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-blue-600 text-white flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold">Transkrip Nilai Sementara</h3>
            <p className="text-blue-100 text-sm">{mahasiswa.name} ({mahasiswa.nim})</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-blue-100 text-sm">Program Studi</p>
            <p className="font-semibold">{mahasiswa.programStudi}</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mata Kuliah</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">SKS</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tugas</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">UTS</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">UAS</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Partisipasi</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Proyek</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-blue-600 uppercase tracking-wider">Huruf</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mahasiswa.enrollments.map((en: any, idx: number) => (
                <tr key={en.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{idx + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{en.kelas.mataKuliah.namaMk}</div>
                    <div className="text-xs text-gray-500">{en.kelas.mataKuliah.kodeMk} • {en.kelas.dosen.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">{en.kelas.mataKuliah.sks}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">{en.nilaiTugas ?? '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">{en.nilaiUts ?? '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">{en.nilaiUas ?? '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">{en.nilaiPartisipasi ?? '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">{en.nilaiProyek ?? '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-700">{en.nilaiAkhir ?? '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-extrabold text-blue-600">{en.huruf ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
