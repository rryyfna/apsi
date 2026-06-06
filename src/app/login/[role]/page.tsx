import LoginForm from '@/app/components/LoginForm';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function LoginPage({ params }: { params: { role: string } }) {
  const { role } = await params;
  
  if (!['mahasiswa', 'dosen', 'admin'].includes(role)) {
    notFound();
  }

  const roleTitleMap: Record<string, string> = {
    mahasiswa: 'SSO Mahasiswa',
    dosen: 'Dosen',
    admin: 'Operator (Non SSO)',
  };

  const dbRoleMap: Record<string, string> = {
    mahasiswa: 'MAHASISWA',
    dosen: 'DOSEN',
    admin: 'ADMIN',
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left side - Branding mimicking Login Portal split */}
      <div className="hidden md:flex md:w-1/2 bg-blue-700 flex-col justify-center items-center p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full fill-current">
            <polygon points="0,0 100,0 100,100" />
          </svg>
        </div>
        
        <div className="z-10 text-center max-w-lg">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-gray-100">
            <span className="text-blue-700 font-bold text-3xl tracking-tight">UNS</span>
          </div>
          <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Portal Login {roleTitleMap[role]}</h1>
          <p className="text-lg text-blue-100 mb-8 leading-relaxed">
            Sistem Informasi Akademik Universitas Sebelas Maret
          </p>
          <Link href="/" className="inline-flex items-center text-sm font-medium text-blue-200 hover:text-white transition-colors">
            &larr; Kembali ke Beranda
          </Link>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <LoginForm targetRole={dbRoleMap[role]} roleTitle={roleTitleMap[role]} />
      </div>
    </div>
  );
}
