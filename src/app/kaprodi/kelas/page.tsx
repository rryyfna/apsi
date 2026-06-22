'use client';

import { useState, useEffect } from 'react';
import { getKelasList, updateKuotaKelas } from '@/app/actions/kaprodi';
import { Loader2, Edit2, X, Check } from 'lucide-react';

interface KelasData {
  id: string;
  namaKelas: string;
  kuotaReguler: number;
  mataKuliah: { namaMk: string; kodeMk: string };
  dosen: { name: string };
  _count: { enrollments: number };
}

export default function ManajemenKelasPage() {
  const [kelasList, setKelasList] = useState<KelasData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await getKelasList();
        setKelasList(data as KelasData[]);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleEdit = (k: KelasData) => {
    setEditingId(k.id);
    setEditValue(k.kuotaReguler || 0);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleSave = async (id: string) => {
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await updateKuotaKelas(id, editValue);
      if (res.success) {
        setMessage({ type: 'success', text: 'Kuota berhasil diperbarui.' });
        setKelasList(kelasList.map(k => k.id === id ? { ...k, kuotaReguler: editValue } : k));
        setEditingId(null);
      } else {
        setMessage({ type: 'error', text: res.error || 'Gagal menyimpan.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Gagal menghubungi server.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Kuota Kelas</h1>
        <p className="text-gray-500 mt-1">Daftar kelas dan pengaturan kapasitas (kuota) maksimum per kelas.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center border ${message.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mata Kuliah</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosen</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Terisi</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-blue-600 uppercase tracking-wider">Kuota Maks</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {kelasList.map(k => (
                  <tr key={k.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{k.mataKuliah.namaMk}</div>
                      <div className="text-xs text-gray-500">{k.mataKuliah.kodeMk}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-700">
                      {k.namaKelas}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {k.dosen.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${k._count.enrollments >= k.kuotaReguler && k.kuotaReguler > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {k._count.enrollments}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {editingId === k.id ? (
                        <div className="flex items-center justify-center space-x-2">
                          <input 
                            type="number" 
                            min="0"
                            value={editValue}
                            onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 text-center border rounded border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-blue-600">{k.kuotaReguler}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      {editingId === k.id ? (
                        <div className="flex items-center justify-center space-x-2">
                          <button onClick={() => handleSave(k.id)} disabled={isSaving} className="text-green-600 hover:text-green-900">
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                          </button>
                          <button onClick={handleCancel} disabled={isSaving} className="text-gray-500 hover:text-gray-700">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => handleEdit(k)} className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-full transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
