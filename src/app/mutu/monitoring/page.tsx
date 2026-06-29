'use client';

import { useState, useEffect } from 'react';
import { Search, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import PrintPDFButton from '@/app/components/PrintPDFButton';
import { getMonitoringCpl } from '@/app/actions/kaprodi';

interface StudentData {
  id: string;
  nim: string;
  name: string;
  cplScores: Record<string, number>;
}

export default function MutuMonitoringPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAngkatan, setFilterAngkatan] = useState('all');
  const [students, setStudents] = useState<StudentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await getMonitoringCpl();
        setStudents(data as StudentData[]);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  let filteredStudents = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        s.nim.includes(searchTerm);
    if (filterAngkatan === 'all') return matchSearch;
    
    // Asumsi NIM format: I0321 -> angkatan 2021
    const angkatan = "20" + s.nim.substring(3, 5);
    return matchSearch && angkatan === filterAngkatan;
  });

  const calculateProdiAverage = (cpl: string) => {
    if (students.length === 0) return "0";
    const total = students.reduce((sum, s) => sum + (s.cplScores[cpl] || 0), 0);
    return (total / students.length).toFixed(1);
  };

  const getStatusColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const cplColumns = new Set<string>();
  students.forEach(s => Object.keys(s.cplScores).forEach(c => cplColumns.add(c)));
  const sortedCplColumns = Array.from(cplColumns).sort();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Monitoring CPL - Mutu</h1>
          <p className="text-gray-500">Pantau evaluasi Capaian Pembelajaran Lulusan (CPL) untuk akreditasi dan penjaminan mutu.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <PrintPDFButton targetId="cpl-monitoring-mutu" fileName="Monitoring_CPL_Mutu" />
        </div>
      </div>

      {sortedCplColumns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {sortedCplColumns.map((cpl) => {
            const avg = parseFloat(calculateProdiAverage(cpl));
            return (
              <div key={`summary-${cpl}`} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{cpl}</p>
                <div className="mt-2 flex items-baseline">
                  <span className="text-3xl font-extrabold text-gray-800">{avg}</span>
                  <span className="ml-1 text-sm text-gray-500">/ 100</span>
                </div>
                <div className="mt-3 text-xs flex items-center">
                  {avg >= 70 ? (
                    <span className="text-green-600 flex items-center"><ArrowUpRight className="w-3 h-3 mr-1"/> Sesuai Target</span>
                  ) : (
                    <span className="text-red-600 flex items-center"><ArrowDownRight className="w-3 h-3 mr-1"/> Perlu Perhatian</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div id="cpl-monitoring-mutu" className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row w-full gap-4">
            <select
              value={filterAngkatan}
              onChange={(e) => setFilterAngkatan(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 w-full sm:w-auto"
            >
              <option value="all">Semua Angkatan</option>
              <option value="2025">Angkatan 2025</option>
              <option value="2024">Angkatan 2024</option>
              <option value="2023">Angkatan 2023</option>
              <option value="2022">Angkatan 2022</option>
              <option value="2021">Angkatan 2021</option>
            </select>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Cari NIM atau Nama..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">NIM</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nama Mahasiswa</th>
                  {sortedCplColumns.map(cpl => (
                    <th key={`th-${cpl}`} className="px-2 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">{cpl}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{student.nim}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{student.name}</td>
                    
                    {sortedCplColumns.map(cpl => {
                      const score = student.cplScores[cpl] || 0;
                      return (
                        <td key={`td-${student.id}-${cpl}`} className="px-2 py-4 whitespace-nowrap text-center">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getStatusColor(score)}`}>
                            {score}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={2 + sortedCplColumns.length} className="px-6 py-8 text-center text-gray-500">
                      Tidak ada data mahasiswa ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
