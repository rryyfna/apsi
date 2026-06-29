'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, ArrowLeft, Info, Loader2, AlertCircle, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { getPlottingCpmk, savePlottingCpmk } from '@/app/actions/dosen';

interface DynamicComponent {
  id: string; // client-only unique id
  namaKolom: string;
  cpmkKode: string;
  bobot: number;
}

export default function PlottingCpmkPage() {
  const params = useParams();
  const router = useRouter();
  const kelasId = params.kelasId as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [mataKuliah, setMataKuliah] = useState<any>(null);
  
  const [cpmks, setCpmks] = useState<{id: string, kode: string}[]>([]);
  const [components, setComponents] = useState<DynamicComponent[]>([]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const kelas = await getPlottingCpmk(kelasId);
        if (kelas && kelas.mataKuliah) {
          setMataKuliah(kelas.mataKuliah);
          setCpmks(kelas.mataKuliah.cpmk || []);

          if (kelas.cpmkKolomNilai && kelas.cpmkKolomNilai.length > 0) {
            setComponents(
              kelas.cpmkKolomNilai.map((k: any) => ({
                id: Math.random().toString(36).substr(2, 9),
                namaKolom: k.namaKolom,
                cpmkKode: k.cpmk.kode,
                bobot: k.bobot
              }))
            );
          } else {
            // Default 1 row
            setComponents([
              { id: Math.random().toString(36).substr(2, 9), namaKolom: '', cpmkKode: '', bobot: 0 }
            ]);
          }
        }
      } catch {
        setMessage({ type: 'error', text: 'Gagal memuat data CPMK' });
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalBobot = components.reduce((acc, comp) => acc + (comp.bobot || 0), 0);

  const addComponent = () => {
    if (components.length >= 10) {
      setMessage({ type: 'error', text: 'Maksimal 10 komponen penilaian' });
      return;
    }
    setComponents([...components, { id: Math.random().toString(36).substr(2, 9), namaKolom: '', cpmkKode: '', bobot: 0 }]);
  };

  const removeComponent = (id: string) => {
    setComponents(components.filter(c => c.id !== id));
  };

  const updateComponent = (id: string, field: keyof DynamicComponent, value: any) => {
    setComponents(components.map(c => {
      if (c.id === id) {
        return { ...c, [field]: value };
      }
      return c;
    }));
  };

  const handleSave = async () => {
    if (components.length === 0) {
      setMessage({ type: 'error', text: 'Harus ada minimal 1 komponen penilaian' });
      return;
    }
    if (totalBobot !== 100) {
      setMessage({ type: 'error', text: 'Total bobot keseluruhan harus 100%' });
      return;
    }

    const hasEmptyFields = components.some(c => !c.namaKolom.trim() || !c.cpmkKode.trim() || c.bobot <= 0);
    if (hasEmptyFields) {
      setMessage({ type: 'error', text: 'Pastikan semua kolom (Nama Komponen, CPMK, Bobot) terisi dengan benar.' });
      return;
    }

    const uniqueNames = new Set(components.map(c => c.namaKolom.trim().toLowerCase()));
    if (uniqueNames.size !== components.length) {
      setMessage({ type: 'error', text: 'Terdapat nama komponen penilaian yang ganda/sama.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);
    try {
      if (!mataKuliah) throw new Error('Data Mata Kuliah tidak ditemukan');
      
      const mapping = components.map(c => ({
        namaKolom: c.namaKolom.trim(),
        cpmkKode: c.cpmkKode.trim(),
        bobot: c.bobot
      }));
      
      const res = await savePlottingCpmk(kelasId, mapping);
      if (res.error) {
        setMessage({ type: 'error', text: res.error });
      } else {
        setMessage({ type: 'success', text: 'Plotting CPMK berhasil disimpan!' });
        setTimeout(() => {
          router.push('/dosen/nilai');
        }, 1500);
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan sistem' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dosen/nilai" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Plotting CPMK Kelas: {mataKuliah?.namaMk}</h1>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center border ${message.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
          {message.type === 'error' ? <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" /> : <Save className="w-5 h-5 mr-3 flex-shrink-0" />}
          {message.text}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl flex items-start">
        <Info className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-bold mb-1">Panduan Plotting Dinamis</p>
          <p>Anda dapat menentukan sendiri daftar komponen penilaian (misal: "Kuis 1", "Tugas Harian", dll) beserta bobotnya. Tentukan satu CPMK untuk tiap komponen. Anda dapat memilih CPMK yang sudah ada atau mengetikkan kode CPMK baru (misal: "CPMK-1"). Total bobot keseluruhan harus 100%.</p>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2">
        <h2 className="text-lg font-bold text-gray-800">Tabel Plotting</h2>
        <button
          onClick={addComponent}
          className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-1" /> Tambah Komponen
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <datalist id="cpmk-options">
          {cpmks.map(c => (
            <option key={c.id} value={c.kode} />
          ))}
        </datalist>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-r border-gray-200 w-1/3">Nama Komponen (cth: Tugas, UTS)</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-r border-gray-200 w-1/3">Pilih CPMK</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 w-1/4">Bobot (%)</th>
                <th className="px-4 py-4 text-center text-sm font-bold text-gray-700 w-12">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {components.map((c, index) => (
                <tr key={c.id} className="hover:bg-gray-50 group">
                  <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                    <input
                      type="text"
                      value={c.namaKolom}
                      onChange={(e) => updateComponent(c.id, 'namaKolom', e.target.value)}
                      placeholder="e.g. UTS, Kuis 1..."
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 font-semibold"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                    <input
                      list="cpmk-options"
                      value={c.cpmkKode}
                      onChange={(e) => updateComponent(c.id, 'cpmkKode', e.target.value)}
                      placeholder="Ketik kode CPMK..."
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center border-r border-gray-200">
                    <div className="flex items-center justify-center">
                      <input 
                        type="number" 
                        min="0" max="100" 
                        value={c.bobot || ''}
                        onChange={(e) => {
                          let val = parseInt(e.target.value);
                          if (isNaN(val)) val = 0;
                          if (val > 100) val = 100;
                          updateComponent(c.id, 'bobot', val);
                        }}
                        className="w-20 px-2 py-1.5 border border-gray-300 rounded text-center text-sm focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-500 font-medium">%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => removeComponent(c.id)}
                      className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                      title="Hapus Komponen"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {components.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Belum ada komponen penilaian. Klik <strong>Tambah Komponen</strong> untuk memulai.
                  </td>
                </tr>
              )}
              <tr className="bg-blue-50 border-t-2 border-blue-200">
                <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 border-r border-blue-200 text-right">
                  Total Bobot Keseluruhan
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center border-r border-blue-200">
                  <span className={`font-bold ${totalBobot === 100 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalBobot}%
                  </span>
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-5 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving || totalBobot !== 100 || components.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-sm flex items-center disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
            {isSaving ? 'Menyimpan...' : 'Simpan Plotting'}
          </button>
        </div>
      </div>
    </div>
  );
}
