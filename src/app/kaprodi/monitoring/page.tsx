'use client';
// Force Turbopack recompile

import { useState, useEffect } from 'react';
import { Search, ArrowUpRight, ArrowDownRight, Loader2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import PrintPDFButton from '@/app/components/PrintPDFButton';
import { getMonitoringCpl } from '@/app/actions/kaprodi';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

interface StudentData {
  id: string;
  nim: string;
  name: string;
  cplScores: Record<string, number>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658', '#42c2f5', '#e942f5', '#ff4d4f', '#73d13d', '#9254de', '#fadb14'];

export default function MonitoringCplPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAngkatan, setFilterAngkatan] = useState('2023'); // Default 2023
  const [students, setStudents] = useState<StudentData[]>([]);
  const [summaryPage, setSummaryPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const filters: Record<string, string | number> = {};
        if (filterAngkatan) filters.angkatan = filterAngkatan;
        
        const data = await getMonitoringCpl(filters);
        setStudents(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [filterAngkatan]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.nim.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
  const finalCplColumns = Array.from(cplColumns).sort((a, b) => 
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
  );

  const pieDataFinal = finalCplColumns.sort((a, b) => {
    const matchA = a.match(/\d+/);
    const matchB = b.match(/\d+/);
    return (matchA ? parseInt(matchA[0], 10) : 0) - (matchB ? parseInt(matchB[0], 10) : 0);
  }).map((cpl, index) => ({
    name: cpl,
    value: parseFloat(calculateProdiAverage(cpl)),
    fill: COLORS[index % COLORS.length]
  }));

  return (
    <div className="space-y-6 relative">
      {/* Modal Popup untuk Mahasiswa */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Detail Capaian Mahasiswa</h3>
                <p className="text-gray-500 text-sm mt-1">{selectedStudent.name} - {selectedStudent.nim}</p>
              </div>
              <button 
                onClick={() => setSelectedStudent(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Bar Chart Student */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="text-center font-semibold text-gray-700 mb-4">Grafik Batang Capaian CPL</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={finalCplColumns.map(cpl => ({ name: cpl, value: selectedStudent.cplScores[cpl] || 0 }))}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart Student */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="text-center font-semibold text-gray-700 mb-4">Distribusi Rata-Rata Capaian</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart key={`modal-pie-${finalCplColumns.join('-')}`}>
                      <Pie
                        data={finalCplColumns.map(cpl => ({ name: cpl, value: selectedStudent.cplScores[cpl] || 0 })).sort((a, b) => {
                          const numA = Number(a.name.split('-')[1]) || 0;
                          const numB = Number(b.name.split('-')[1]) || 0;
                          return numA - numB;
                        })}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {finalCplColumns.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [value, 'Skor']} />
                      <Legend 
                        wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }}
                        {...({
                          payload: pieDataFinal.map((item) => ({
                            id: item.name,
                            type: 'square',
                            value: item.name,
                            color: item.fill
                          }))
                        } as any)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setSelectedStudent(null)}
                className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Monitoring CPL</h1>
          <p className="text-gray-500">Pantau pencapaian CPL mahasiswa secara keseluruhan.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <PrintPDFButton targetId="cpl-monitoring" fileName="Monitoring_CPL_Kaprodi" />
        </div>
      </div>
      
      {/* Search and Filters moved to top before everything */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md flex gap-2">
          <div className="relative flex-1">
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
        <div className="flex gap-3">
          <select 
            value={filterAngkatan}
            onChange={(e) => setFilterAngkatan(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-blue-700 bg-blue-50"
          >
            <option value="2020">Angkatan 2020</option>
            <option value="2021">Angkatan 2021</option>
            <option value="2022">Angkatan 2022</option>
            <option value="2023">Angkatan 2023</option>
            <option value="2024">Angkatan 2024</option>
          </select>
        </div>
      </div>

      {finalCplColumns.length > 0 && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 flex-1">
              {finalCplColumns.slice(summaryPage * 6, (summaryPage + 1) * 6).map((cpl) => {
                const avg = parseFloat(calculateProdiAverage(cpl));
                return (
                  <div key={`summary-${cpl}`} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
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
            {finalCplColumns.length > 6 && (
              <div className="flex justify-center items-center mt-4 gap-4">
                <button 
                  onClick={() => setSummaryPage(p => Math.max(0, p - 1))}
                  disabled={summaryPage === 0}
                  className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <span className="text-sm font-medium text-gray-600">
                  Halaman {summaryPage + 1} dari {Math.ceil(finalCplColumns.length / 6)}
                </span>
                <button 
                  onClick={() => setSummaryPage(p => Math.min(Math.ceil(finalCplColumns.length / 6) - 1, p + 1))}
                  disabled={summaryPage >= Math.ceil(finalCplColumns.length / 6) - 1}
                  className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            )}
          </div>
          
          {/* Pie Chart untuk Angkatan */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 min-h-[350px] flex flex-col">
            <h3 className="text-sm font-semibold text-gray-700 text-center mb-2">Perbandingan Capaian Angkatan {filterAngkatan}</h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart key={`pie-${finalCplColumns.join('-')}`}>
                  <Pie
                    data={pieDataFinal}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieDataFinal.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value.toFixed(1)}`, 'Rata-rata']} />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }}
                    {...({
                      payload: pieDataFinal.map((item) => ({
                        id: item.name,
                        type: 'square',
                        value: item.name,
                        color: item.fill
                      }))
                    } as any)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div id="cpl-monitoring" className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
        {isLoading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">NIM</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nama Mahasiswa</th>
                  {finalCplColumns.map(cpl => (
                    <th key={`th-${cpl}`} className="px-2 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">{cpl}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{student.nim}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <button 
                        onClick={() => setSelectedStudent(student)}
                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline focus:outline-none text-left"
                      >
                        {student.name}
                      </button>
                    </td>
                    
                    {finalCplColumns.map(cpl => {
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
                    <td colSpan={2 + finalCplColumns.length} className="px-6 py-8 text-center text-gray-500">
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
