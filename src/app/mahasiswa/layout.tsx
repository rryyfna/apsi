import { headers } from 'next/headers';
import Sidebar from '@/app/components/Sidebar';
import Topbar from '@/app/components/Topbar';
import { Home, BookOpen, GraduationCap, Calendar } from 'lucide-react';
import { db } from '@/lib/db';

export default async function MahasiswaLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const userId = headersList.get('x-user-id') || '';
  
  // Ambil data mahasiswa dari DB
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  const navItems = [
    { label: 'Beranda', href: '/mahasiswa', icon: <Home className="w-5 h-5" /> },
    { label: 'KRS (Rencana Studi)', href: '/mahasiswa/krs', icon: <BookOpen className="w-5 h-5" /> },
    { label: 'KHS (Hasil Studi)', href: '/mahasiswa/khs', icon: <GraduationCap className="w-5 h-5" /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        navItems={navItems} 
        roleTitle="Mahasiswa" 
        userName={user?.name || 'Mahasiswa'} 
      />
      <div className="flex-1 flex flex-col ml-64 min-h-screen">
        <Topbar />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
