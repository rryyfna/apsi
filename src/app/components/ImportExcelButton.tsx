'use client';

import { useState, useRef } from 'react';
import * as xlsx from 'xlsx';
import { Upload, X, Check, AlertCircle } from 'lucide-react';
import { ImportedStudent, importGradesFromExcel } from '@/app/actions/import';

interface ImportExcelButtonProps {
  kelasId: string;
  onSuccess?: () => void;
}

export default function ImportExcelButton({ kelasId, onSuccess }: ImportExcelButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ImportedStudent[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      parseFile(e.target.files[0]);
    }
  };

  const parseFile = (uploadFile: File) => {
    setIsParsing(true);
    setError(null);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = xlsx.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1 });

        let headerRowIdx = -1;
        for (let i = 0; i < jsonData.length; i++) {
          if (jsonData[i] && jsonData[i][0] === 'No' && jsonData[i][1] === 'Nim') {
            headerRowIdx = i;
            break;
          }
        }

        if (headerRowIdx === -1) {
          throw new Error('Format tabel tidak ditemukan. Pastikan ada baris dengan kolom No dan Nim.');
        }

        const students: ImportedStudent[] = [];
        for (let i = headerRowIdx + 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || !row[0]) continue; 
          if (row[0] === 'No') continue;
          if (!row[1]) continue;

          students.push({
            nim: String(row[1]).trim(),
            nama: String(row[2]).trim(),
            nilai: {
              tugas: Number(row[3]) || 0,
              uts: Number(row[4]) || 0,
              uas: Number(row[5]) || 0,
              partisipasi: Number(row[6]) || 0,
              proyek: Number(row[7]) || 0,
            }
          });
        }

        setParsedData(students);
      } catch (err: any) {
        setError(err.message || 'Gagal membaca file Excel.');
      } finally {
        setIsParsing(false);
      }
    };

    reader.onerror = () => {
      setError('Gagal membaca file.');
      setIsParsing(false);
    };

    reader.readAsBinaryString(uploadFile);
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;
    
    setIsImporting(true);
    try {
      const result = await importGradesFromExcel(kelasId, { students: parsedData });
      if (result.success) {
        setIsOpen(false);
        if (onSuccess) onSuccess();
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError('Terjadi kesalahan koneksi server.');
    } finally {
      setIsImporting(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setParsedData([]);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm transition-colors text-sm"
      >
        <Upload className="w-4 h-4 mr-2" /> Import Excel
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-green-600" />
                Import Nilai via Excel
              </h2>
              <button 
                onClick={() => { setIsOpen(false); resetState(); }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {/* File Input Area */}
              {!parsedData.length && !error && (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    accept=".xlsx, .xls, .csv"
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Pilih atau Tarik File Excel</h3>
                  <p className="text-sm text-gray-500 mb-4">Format: .xlsx, .xls, atau .csv (Sesuai Template SIAKAD)</p>
                  <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-50">
                    Cari File
                  </button>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start">
                  <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold">Error</p>
                    <p className="text-sm mt-1">{error}</p>
                    <button 
                      onClick={resetState}
                      className="mt-3 text-sm bg-white text-red-600 border border-red-200 px-3 py-1 rounded hover:bg-red-50 font-medium"
                    >
                      Coba Lagi
                    </button>
                  </div>
                </div>
              )}

              {/* Preview Area */}
              {parsedData.length > 0 && !error && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div>
                      <p className="text-sm text-blue-800 font-semibold">File terbaca: <span className="font-normal">{file?.name}</span></p>
                      <p className="text-sm text-blue-600 mt-1">Ditemukan <strong>{parsedData.length}</strong> baris data mahasiswa siap diimpor.</p>
                    </div>
                    <button 
                      onClick={resetState}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
                    >
                      Ganti File
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto max-h-[40vh]">
                      <table className="min-w-full divide-y divide-gray-200 relative">
                        <thead className="bg-gray-100 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">NIM</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Mahasiswa</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Tugas</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">UTS</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">UAS</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Partisipasi</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Proyek</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {parsedData.slice(0, 100).map((row, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm text-gray-800">{row.nim}</td>
                              <td className="px-4 py-2 text-sm text-gray-800">{row.nama}</td>
                              <td className="px-4 py-2 text-sm text-center font-medium">{row.nilai.tugas}</td>
                              <td className="px-4 py-2 text-sm text-center font-medium">{row.nilai.uts}</td>
                              <td className="px-4 py-2 text-sm text-center font-medium">{row.nilai.uas}</td>
                              <td className="px-4 py-2 text-sm text-center font-medium">{row.nilai.partisipasi}</td>
                              <td className="px-4 py-2 text-sm text-center font-medium">{row.nilai.proyek}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 text-center">Menampilkan maksimal 100 data untuk pratinjau. Semua data ({parsedData.length}) akan diimpor.</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleImport}
                disabled={isImporting || parsedData.length === 0}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
              >
                {isImporting ? 'Menyimpan...' : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Simpan ke Database
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
