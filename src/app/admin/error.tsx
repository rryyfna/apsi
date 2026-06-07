'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Layar error tertangkap:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
      <div className="bg-red-50 p-6 rounded-2xl max-w-md w-full border border-red-100">
        <h2 className="text-xl font-bold text-red-800 mb-2">Terjadi Kesalahan Sistem</h2>
        <p className="text-sm text-red-600 mb-6">
          Koneksi ke database terputus atau sesi Anda telah habis.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Coba Lagi
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    </div>
  );
}
