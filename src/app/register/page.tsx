'use client';

import { useState, useActionState } from 'react';
import { register } from '@/app/actions/auth';
import Link from 'next/link';
import { Building2, UserCircle2, GraduationCap, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [role, setRole] = useState<'MAHASISWA' | 'DOSEN'>('MAHASISWA');
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Wrap the server action to handle success state properly
  const handleRegister = async (prevState: unknown, formData: FormData) => {
    const result = await register(formData);
    if (result && result.success) {
      setIsSuccess(true);
      return { success: true, message: result.message };
    }
    return result;
  };

  const [state, formAction, isPending] = useActionState(handleRegister, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500 rounded-full opacity-50 blur-xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-blue-700 rounded-full opacity-50 blur-xl"></div>
          
          <Building2 className="w-12 h-12 mx-auto mb-3 relative z-10" />
          <h1 className="text-2xl font-bold relative z-10">SIAKAD</h1>
          <p className="text-blue-100 mt-1 relative z-10">Pendaftaran Pengguna Baru</p>
        </div>

        <div className="p-8">
          {isSuccess ? (
            <div className="text-center py-6">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Registrasi Berhasil!</h2>
              <p className="text-gray-600 mb-6">{state?.message}</p>
              <Link href="/" className="inline-flex items-center justify-center w-full py-3 px-4 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-medium transition-colors">
                Kembali ke Login
              </Link>
            </div>
          ) : (
            <form action={formAction} className="space-y-5">
              {state?.error && (
                <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-start">
                  <ShieldCheck className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <p>{state.error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setRole('MAHASISWA')}
                  className={`py-3 flex flex-col items-center justify-center rounded-xl border-2 transition-all ${role === 'MAHASISWA' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-blue-300'}`}
                >
                  <GraduationCap className="w-6 h-6 mb-1" />
                  <span className="font-semibold text-sm">Mahasiswa</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('DOSEN')}
                  className={`py-3 flex flex-col items-center justify-center rounded-xl border-2 transition-all ${role === 'DOSEN' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-blue-300'}`}
                >
                  <UserCircle2 className="w-6 h-6 mb-1" />
                  <span className="font-semibold text-sm">Dosen</span>
                </button>
              </div>

              <input type="hidden" name="role" value={role} />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {role === 'MAHASISWA' ? 'NIM' : 'NIDN'}
                </label>
                <input
                  type="text"
                  name="username"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                  placeholder={`Masukkan ${role === 'MAHASISWA' ? 'NIM' : 'NIDN'}`}
                />
              </div>

              {role === 'MAHASISWA' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fakultas (Opsional)
                    </label>
                    <input
                      type="text"
                      name="fakultas"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                      placeholder="Contoh: Teknik"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Program Studi (Opsional)
                    </label>
                    <input
                      type="text"
                      name="programStudi"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                      placeholder="Contoh: Teknik Industri"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                  placeholder="Buat password yang kuat"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full mt-6 bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isPending ? 'Memproses...' : 'Daftar Sekarang'}
                {!isPending && <ArrowRight className="w-5 h-5 ml-2" />}
              </button>

              <p className="text-center text-sm text-gray-600 mt-6">
                Sudah punya akun?{' '}
                <Link href="/" className="text-blue-600 hover:underline font-medium">
                  Login di sini
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
