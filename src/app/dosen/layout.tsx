import { headers } from 'next/headers';
import Sidebar from '@/app/components/Sidebar';
import Topbar from '@/app/components/Topbar';
import { Home, Users, FileEdit, Calendar } from 'lucide-react';
import { db } from '@/lib/db';

export default async function DosenLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const userId = headersList.get('x-user-id') || '';
  
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { dosen: true }
  });

  const navItems = [
    { label: 'Beranda', href: '/dosen', icon: <Home className="w-5 h-5" /> },
    { label: 'Input Nilai', href: '/dosen/nilai', icon: <FileEdit className="w-5 h-5" /> },
    { label: 'Kelas Saya', href: '/dosen/kelas', icon: <Users className="w-5 h-5" /> },
    { label: 'Jadwal Mengajar', href: '/dosen/jadwal', icon: <Calendar className="w-5 h-5" /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        navItems={navItems} 
        roleTitle="Dosen" 
        userName={user?.dosen?.name || user?.name || 'Dosen'} 
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
