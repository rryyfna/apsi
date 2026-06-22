import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Navbar mimicking SIAKAD UNS */}
      <div className="w-full bg-[#f9fafb] border-b border-gray-200">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl flex justify-end h-10 items-center space-x-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
          <Link href="/login/mahasiswa" className="px-3 hover:text-blue-600 hover:bg-gray-100 h-full flex items-center transition-colors">SSO (Mahasiswa)</Link>
          <Link href="/login/dosen" className="px-3 hover:text-blue-600 hover:bg-gray-100 h-full flex items-center transition-colors">Dosen</Link>
          <Link href="/login/kaprodi" className="px-3 hover:text-blue-600 hover:bg-gray-100 h-full flex items-center transition-colors">Kaprodi</Link>
          <Link href="/login/admin" className="px-3 hover:text-blue-600 hover:bg-gray-100 h-full flex items-center transition-colors">Operator (Non SSO)</Link>
        </div>
      </div>

      {/* Main Header */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-50 transition-all">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl flex items-center justify-between h-20">
          <Link href="/">
            <Image src="/siakad-logo.png" alt="SIAKAD Logo" width={200} height={56} className="h-14 w-auto object-contain" />
          </Link>
          <div className="hidden md:flex space-x-4">
            <Link href="/" className="text-gray-700 font-semibold text-sm hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50/50 transition-colors">Beranda</Link>
            <Link href="#" className="text-gray-700 font-semibold text-sm hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50/50 transition-colors">Tentang</Link>
            <Link href="#" className="text-gray-700 font-semibold text-sm hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50/50 transition-colors">Panduan</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center p-6 lg:p-12">
        <div className="text-center max-w-3xl">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-gray-100">
            <span className="text-blue-700 font-bold text-3xl tracking-tight">UNS</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-6 tracking-tight">Selamat Datang di SIAKAD</h1>
          <p className="text-lg text-gray-600 mb-10 leading-relaxed">
            Sistem Informasi Akademik Universitas Sebelas Maret. Silakan login melalui menu di pojok kanan atas sesuai dengan peran Anda (SSO, Dosen, atau Operator).
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link href="/login/mahasiswa" className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-all">
              Login Mahasiswa (SSO)
            </Link>
            <Link href="/login/dosen" className="px-8 py-3 bg-white text-blue-700 border border-blue-600 font-semibold rounded-lg shadow-sm hover:bg-blue-50 transition-all">
              Login Dosen
            </Link>
          </div>
          <div className="mt-6">
            <p className="text-gray-500 text-sm">
              Pengguna baru? <Link href="/register" className="text-blue-600 hover:underline font-semibold">Daftar Akun</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
