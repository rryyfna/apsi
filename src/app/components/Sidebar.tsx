'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { logout } from '@/app/actions/auth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  navItems: NavItem[];
  roleTitle: string;
  userName: string;
}

export default function Sidebar({ navItems, roleTitle, userName }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen fixed top-0 left-0 shadow-sm z-20">
      {/* Brand area */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3 shadow-md">
          <span className="text-white font-bold text-xs">UNS</span>
        </div>
        <span className="font-extrabold text-gray-800 text-lg tracking-tight">SIAKAD</span>
      </div>

      {/* User Profile Snippet */}
      <div className="p-6 pb-2">
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">{roleTitle}</p>
        <p className="text-sm font-bold text-gray-800 truncate">{userName}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href) && item.href !== `/${roleTitle.toLowerCase()}`);
          
          // Special case for exact match on base path
          const isExactMatch = pathname === item.href;
          const showActive = item.href.split('/').length <= 2 ? isExactMatch : isActive;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                showActive
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className={`mr-3 ${showActive ? 'text-blue-600' : 'text-gray-400'}`}>
                {item.icon}
              </div>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout / Bottom Area */}
      <div className="p-4 border-t border-gray-100">
        <form action={logout}>
          <button type="submit" className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5 mr-3 text-red-500" />
            Keluar
          </button>
        </form>
      </div>
    </aside>
  );
}
