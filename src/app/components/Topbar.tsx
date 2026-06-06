'use client';

import { Bell, Menu, Search, User } from 'lucide-react';

export default function Topbar() {
  return (
    <header className="h-16 bg-white border-b border-gray-100 shadow-sm flex items-center justify-between px-6 sticky top-0 z-10 w-full">
      <div className="flex items-center">
        <button className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none">
          <Menu className="w-6 h-6" />
        </button>
        
        {/* Optional Search Bar */}
        <div className="hidden md:flex items-center ml-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari..." 
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all w-64"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="text-gray-400 hover:text-blue-600 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>
        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 cursor-pointer hover:bg-blue-200 transition-colors">
          <User className="w-4 h-4 text-blue-700" />
        </div>
      </div>
    </header>
  );
}
