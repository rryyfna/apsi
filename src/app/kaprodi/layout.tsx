import { headers } from 'next/headers';
import Sidebar from '@/app/components/Sidebar';
import Topbar from '@/app/components/Topbar';
import { Home, Target, Settings, Map, Users } from 'lucide-react';
import { db } from '@/lib/db';

export default async function KaprodiLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const userId = headersList.get('x-user-id') || '';
  
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  const navItems = [
    { label: 'Beranda', href: '/kaprodi', icon: <Home className="w-5 h-5" /> },
    { label: 'Peta Kurikulum', href: '/kaprodi/pemetaan', icon: <Map className="w-5 h-5" /> },
    { label: 'Pengaturan CPMK', href: '/kaprodi/cpmk', icon: <Settings className="w-5 h-5" /> },
    { label: 'Monitoring CPL', href: '/kaprodi/monitoring', icon: <Target className="w-5 h-5" /> },
    { label: 'Manajemen Kuota', href: '/kaprodi/kelas', icon: <Users className="w-5 h-5" /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        navItems={navItems} 
        roleTitle="Ketua Program Studi" 
        userName={user?.name || 'Kaprodi'} 
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
