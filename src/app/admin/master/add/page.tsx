'use client';

import { useState } from 'react';
import { addMahasiswaManual, addDosenManual, addMataKuliahManual } from '@/app/actions/master-data';
import { UserPlus, BookOpen, UserCircle2 } from 'lucide-react';

export default function MasterDataAddPage() {
  const [activeTab, setActiveTab] = useState<'MAHASISWA' | 'DOSEN' | 'MK'>('MAHASISWA');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    const formData = new FormData(e.currentTarget);
    let res;

    if (activeTab === 'MAHASISWA') {
      res = await addMahasiswaManual(formData);
    } else if (activeTab === 'DOSEN') {
      res = await addDosenManual(formData);
    } else {
      res = await addMataKuliahManual(formData);
    }

    if (res?.success) {
      setMessage({ type: 'success', text: 'Data berhasil ditambahkan!' });
      (e.target as HTMLFormElement).reset();
    } else {
      setMessage({ type: 'error', text: res?.error || 'Terjadi kesalahan' });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800">Tambah Data Master (Manual)</h1>
        <p className="text-gray-600 mt-1">Gunakan fitur ini untuk memasukkan data yang tertinggal atau baru tanpa perlu mengunggah ulang file Excel secara keseluruhan.</p>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-sm flex items-start">
          <UserCircle2 className="w-5 h-5 mr-2 shrink-0" />
          <p><strong>Informasi Login:</strong> Akun yang ditambahkan manual akan langsung otomatis berstatus <em>Approved</em>. <strong>Password default-nya adalah sama dengan NIM/NIDN pengguna tersebut.</strong></p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => { setActiveTab('MAHASISWA'); setMessage(null); }}
            className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'MAHASISWA' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            <UserCircle2 className="w-5 h-5 mx-auto mb-1 inline-block mr-2" />
            Mahasiswa
          </button>
          <button
            onClick={() => { setActiveTab('DOSEN'); setMessage(null); }}
            className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'DOSEN' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            <UserPlus className="w-5 h-5 mx-auto mb-1 inline-block mr-2" />
            Dosen
          </button>
          <button
            onClick={() => { setActiveTab('MK'); setMessage(null); }}
            className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'MK' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            <BookOpen className="w-5 h-5 mx-auto mb-1 inline-block mr-2" />
            Mata Kuliah
          </button>
        </div>

        <div className="p-8 max-w-2xl mx-auto">
          {message && (
            <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {activeTab === 'MAHASISWA' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIM</label>
                  <input type="text" name="nim" required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <input type="text" name="name" required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fakultas</label>
                  <input type="text" name="fakultas" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Program Studi</label>
                  <input type="text" name="programStudi" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none" />
                </div>
              </>
            )}

            {activeTab === 'DOSEN' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIDN</label>
                  <input type="text" name="nidn" required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <input type="text" name="name" required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none" />
                </div>
              </>
            )}

            {activeTab === 'MK' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kode MK</label>
                  <input type="text" name="kodeMk" required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama MK</label>
                  <input type="text" name="namaMk" required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SKS</label>
                    <input type="number" name="sks" required min="1" max="10" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester (Opsional)</label>
                    <input type="number" name="semester" min="1" max="14" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none" />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan Data'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
