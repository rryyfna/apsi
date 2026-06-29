'use client';

import { useState, useEffect } from 'react';
import { Target, Search, Loader2, X, AlertCircle } from 'lucide-react';
import PrintPDFButton from '@/app/components/PrintPDFButton';
import { getMonitoringCpl } from '@/app/actions/kaprodi';

interface UnfulfilledCpmk {
  cpmkKode: string;
  cpmkNama: string;
  matkul: string;
  score: number;
}

interface StudentData {
  id: string;
  nim: string;
  name: string;
  cplScores: Record<string, number>;
  unfulfilledCpmk?: UnfulfilledCpmk[];
}

export default function CPLMonitoringPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAngkatan, setFilterAngkatan] = useState('all');
  const [students, setStudents] = useState<StudentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);

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
                        s.nim.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterAngkatan === 'all') return matchSearch;
    
    // Asumsi NIM format: I0321 -> angkatan 2021
    const angkatan = "20" + s.nim.substring(3, 5);
    return matchSearch && angkatan === filterAngkatan;
  });

  const getStatusColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const cplColumns = new Set<string>();
  students.forEach(s => Object.keys(s.cplScores).forEach(c => cplColumns.add(c)));
  
  // Sort numerically
  const sortedCplColumns = Array.from(cplColumns).sort((a, b) => 
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
  );

  return (
    <div className="space-y-6 w-full mx-auto relative">
      
      {/* Modal Detail CPMK */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-xl shrink-0">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Detail CPMK Belum Terpenuhi</h3>
                <p className="text-gray-500 text-sm mt-1">{selectedStudent.name} - {selectedStudent.nim}</p>
              </div>
              <button 
                onClick={() => setSelectedStudent(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
              {selectedStudent.unfulfilledCpmk && selectedStudent.unfulfilledCpmk.length > 0 ? (
                <div className="space-y-4">
                  {selectedStudent.unfulfilledCpmk.map((cpmk, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg border border-red-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <h4 className="font-bold text-gray-800">{cpmk.cpmkKode}</h4>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{cpmk.cpmkNama}</p>
                        <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          Mata Kuliah: {cpmk.matkul}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Skor Saat Ini</p>
                        <span className="text-xl font-black text-red-600">{cpmk.score}</span>
                        <span className="text-sm font-medium text-gray-400">/100</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Target className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2">Semua CPMK Terpenuhi!</h4>
                  <p className="text-gray-500 max-w-sm">
                    Mahasiswa ini tidak memiliki CPMK dengan skor di bawah ambang batas (60). 
                    Seluruh pencapaiannya sudah memenuhi standar kelulusan.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Monitoring Capaian Pembelajaran Lulusan (CPL)</h1>
          <p className="text-gray-500 text-sm mt-1">Status pencapaian CPL mahasiswa aktif (dalam persen).</p>
        </div>
        <PrintPDFButton targetId="cpl-report" fileName="Laporan_CPL_Mahasiswa" />
      </div>

      <div id="cpl-report" className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-t-lg">
          <div className="flex items-center text-gray-700 font-semibold">
            <Target className="w-5 h-5 mr-2 text-blue-600" /> Matriks CPL Mahasiswa Aktif
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto print:hidden">
            <select
              value={filterAngkatan}
              onChange={(e) => setFilterAngkatan(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
            >
              <option value="all">Semua Angkatan</option>
              <option value="2025">Angkatan 2025</option>
              <option value="2024">Angkatan 2024</option>
              <option value="2023">Angkatan 2023</option>
              <option value="2022">Angkatan 2022</option>
              <option value="2021">Angkatan 2021</option>
            </select>
            <div className="relative w-full sm:w-64">
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
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIM</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Mahasiswa</th>
                  {sortedCplColumns.map(cpl => (
                    <th key={`th-${cpl}`} className="px-2 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                      {cpl}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{m.nim}</td>
                    <td 
                      className="px-4 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800 font-semibold cursor-pointer transition-colors"
                      onClick={() => setSelectedStudent(m)}
                      title="Klik untuk melihat detail CPMK yang belum terpenuhi"
                    >
                      {m.name}
                    </td>
                    
                    {sortedCplColumns.map(cpl => {
                      const score = m.cplScores[cpl] || 0;
                      return (
                        <td key={`td-${m.id}-${cpl}`} className="px-2 py-4 whitespace-nowrap text-center">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getStatusColor(score)}`}>
                            {score}%
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={2 + sortedCplColumns.length} className="px-6 py-8 text-center text-gray-500">Tidak ada data ditemukan.</td>
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
