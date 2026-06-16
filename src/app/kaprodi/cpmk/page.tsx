'use client';

import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { getMataKuliahWithCpmk, saveCpmkSetting } from '@/app/actions/kaprodi';

export default function PengaturanCpmkPage() {
  const [mataKuliah, setMataKuliah] = useState<any[]>([]);
  const [selectedMk, setSelectedMk] = useState<string>('');
  const [cpmks, setCpmks] = useState<{ id: string, kode: string, deskripsi: string, deskripsiEn?: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const data = await getMataKuliahWithCpmk();
      setMataKuliah(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  // Effect to populate CPMK when MK changes
  useEffect(() => {
    if (selectedMk) {
      const mk = mataKuliah.find(m => m.id === selectedMk);
      if (mk && mk.cpmk) {
        setCpmks(mk.cpmk.map((c: any) => ({
          id: c.id || Math.random().toString(),
          kode: c.kode,
          deskripsi: c.deskripsi,
          deskripsiEn: c.deskripsiEn || ''
        })));
      } else {
        setCpmks([]);
      }
    }
  }, [selectedMk, mataKuliah]);

  const handleAddCpmk = () => {
    let maxNum = 0;
    cpmks.forEach(c => {
      const match = c.kode.match(/CPMK-(\d+)/i);
      if (match && parseInt(match[1]) > maxNum) {
        maxNum = parseInt(match[1]);
      }
    });
    
    setCpmks([...cpmks, { 
      id: Date.now().toString(), 
      kode: `CPMK-${maxNum + 1}`, 
      deskripsi: '', 
      deskripsiEn: '' 
    }]);
  };

  const handleRemoveCpmk = (id: string) => {
    setCpmks(cpmks.filter(c => c.id !== id));
  };

  const handleChange = (id: string, field: 'kode' | 'deskripsi' | 'deskripsiEn', value: string) => {
    setCpmks(cpmks.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleSave = async () => {
    if (!selectedMk) return;
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await saveCpmkSetting(selectedMk, cpmks);
      if (res.success) {
        setMessage({ type: 'success', text: 'Pengaturan CPMK berhasil disimpan!' });
        await loadData(); // reload
      } else {
        setMessage({ type: 'error', text: res.error || 'Terjadi kesalahan' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Gagal menghubungi server' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Pengaturan CPMK</h1>
      <p className="text-gray-500">Atur Capaian Pembelajaran Mata Kuliah (CPMK) untuk masing-masing Mata Kuliah.</p>

      {message && (
        <div className={`p-4 rounded-lg flex items-center border ${message.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
          <AlertCircle className="w-5 h-5 mr-3" />
          {message.text}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Pilih Mata Kuliah</label>
        {isLoading ? (
          <div className="flex items-center text-sm text-gray-500">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memuat daftar mata kuliah...
          </div>
        ) : (
          <select 
            className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            value={selectedMk}
            onChange={(e) => {
              setSelectedMk(e.target.value);
              setMessage(null);
            }}
          >
            <option value="" disabled>-- Pilih Mata Kuliah --</option>
            {mataKuliah.map(mk => (
              <option key={mk.id} value={mk.id}>{mk.kodeMk} - {mk.namaMk}</option>
            ))}
          </select>
        )}
      </div>

      {selectedMk && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Daftar CPMK</h3>
            <button 
              onClick={handleAddCpmk}
              className="flex items-center text-sm bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded text-gray-700 font-medium transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" /> Tambah CPMK
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            {cpmks.map((cpmk, index) => (
              <div key={cpmk.id} className="flex space-x-4 items-start bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="w-32">
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Kode</label>
                  <input 
                    type="text" 
                    value={cpmk.kode}
                    onChange={(e) => handleChange(cpmk.id, 'kode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Deskripsi CPMK (ID)</label>
                  <textarea 
                    value={cpmk.deskripsi}
                    onChange={(e) => handleChange(cpmk.id, 'deskripsi', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[80px]"
                    placeholder="Masukkan deskripsi..."
                  />
                  <label className="block text-xs font-semibold text-gray-500 uppercase mt-3 mb-1">Deskripsi CPMK (EN)</label>
                  <textarea 
                    value={cpmk.deskripsiEn || ''}
                    onChange={(e) => handleChange(cpmk.id, 'deskripsiEn', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[80px]"
                    placeholder="Enter english description..."
                  />
                </div>
                <div className="pt-6">
                  <button 
                    onClick={() => handleRemoveCpmk(cpmk.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    title="Hapus CPMK"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            
            {cpmks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Belum ada CPMK untuk Mata Kuliah ini.
              </div>
            )}
            
            <div className="pt-4 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center shadow-sm transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
