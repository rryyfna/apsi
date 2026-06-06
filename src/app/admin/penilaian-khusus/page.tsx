'use client';

import { useState } from 'react';
import { Plus, Trash, Save, AlertCircle } from 'lucide-react';

interface Criteria {
  id: string;
  name: string;
  weight: number;
}

export default function PenilaianKhususPage() {
  const [criteria, setCriteria] = useState<Criteria[]>([
    { id: '1', name: 'Nilai Pembimbing', weight: 60 },
    { id: '2', name: 'Nilai Penguji', weight: 40 }
  ]);
  const [studentNim, setStudentNim] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [message, setMessage] = useState<{type: 'error'|'success', text: string} | null>(null);

  const totalWeight = criteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);

  const addCriteria = () => {
    setCriteria([...criteria, { id: Math.random().toString(), name: '', weight: 0 }]);
  };

  const removeCriteria = (id: string) => {
    setCriteria(criteria.filter(c => c.id !== id));
  };

  const updateCriteria = (id: string, field: keyof Criteria, value: string | number) => {
    setCriteria(criteria.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalWeight !== 100) {
      setMessage({ type: 'error', text: 'Total bobot harus tepat 100%!' });
      return;
    }
    
    if (!studentNim || !courseCode) {
      setMessage({ type: 'error', text: 'NIM dan Kode MK wajib diisi.' });
      return;
    }

    setMessage({ type: 'success', text: 'Template dan nilai berhasil disimpan!' });
    // TODO: Connect to Server Action
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800">Input Nilai Non-Pengajaran (KP, Skripsi, MBKM)</h1>
      <p className="text-gray-500">Buat template kriteria penilaian dan input nilai secara fleksibel. Sistem memastikan total persentase bobot adalah 100%.</p>

      {message && (
        <div className={`p-4 rounded-lg flex items-center border ${message.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
          <AlertCircle className="w-5 h-5 mr-3" />
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">NIM Mahasiswa</label>
            <input type="text" value={studentNim} onChange={(e) => setStudentNim(e.target.value)} placeholder="Contoh: I0323089" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Kode MK Non-Pengajaran</label>
            <input type="text" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} placeholder="Contoh: SKRIPSI-01" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Kriteria & Bobot Penilaian</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${totalWeight === 100 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              Total Bobot: {totalWeight}%
            </span>
          </div>

          <div className="space-y-3">
            {criteria.map((c, idx) => (
              <div key={c.id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <span className="text-gray-500 font-medium w-6">{idx + 1}.</span>
                <input 
                  type="text" 
                  value={c.name} 
                  onChange={(e) => updateCriteria(c.id, 'name', e.target.value)} 
                  placeholder="Nama Kriteria (misal: Nilai Sidang)" 
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded" 
                  required
                />
                <div className="flex items-center space-x-2 w-32">
                  <input 
                    type="number" 
                    value={c.weight || ''} 
                    onChange={(e) => updateCriteria(c.id, 'weight', parseInt(e.target.value) || 0)} 
                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-center" 
                    min="1" max="100"
                    required
                  />
                  <span className="text-gray-500">%</span>
                </div>
                <button type="button" onClick={() => removeCriteria(c.id)} className="text-red-500 hover:text-red-700 p-2">
                  <Trash className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          <button type="button" onClick={addCriteria} className="mt-4 text-blue-600 font-medium flex items-center hover:text-blue-800 text-sm">
            <Plus className="w-4 h-4 mr-1" /> Tambah Kriteria
          </button>
        </div>

        <div className="border-t border-gray-100 pt-6 flex justify-end">
          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center transition-colors disabled:opacity-50"
            disabled={totalWeight !== 100}
          >
            <Save className="w-5 h-5 mr-2" /> Simpan Nilai
          </button>
        </div>
      </form>
    </div>
  );
}
