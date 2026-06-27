'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, FileQuestion, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const adminAuth = sessionStorage.getItem('isAdmin');
    if (!adminAuth) {
      router.push('/');
    } else {
      setIsAuth(true);
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('isAdmin');
    router.push('/');
  };

  if (!isAuth) return <div className="min-h-screen bg-gray-50"></div>;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar with Two-tone Pink Gradient */}
      <div className="w-64 bg-gradient-to-b from-pink-50 to-pink-100/50 border-r border-pink-200/50 flex flex-col hidden md:flex shadow-sm">
        <div className="h-20 flex items-center px-6 border-b border-pink-200/50 bg-white/40 backdrop-blur-sm">
          <h1 className="text-2xl font-black bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent drop-shadow-sm">Admin Panel</h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto">
          <Link 
            href="/dashboard"
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              pathname === '/dashboard' 
                ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-md shadow-pink-200 font-bold scale-105' 
                : 'text-gray-600 hover:bg-white/60 hover:text-pink-600 hover:shadow-sm font-medium'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>สถิติภาพรวม</span>
          </Link>
          
          <Link 
            href="/dashboard/questions"
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              pathname === '/dashboard/questions' 
                ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-md shadow-pink-200 font-bold scale-105' 
                : 'text-gray-600 hover:bg-white/60 hover:text-pink-600 hover:shadow-sm font-medium'
            }`}
          >
            <FileQuestion className="w-5 h-5" />
            <span>จัดการข้อสอบ</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-pink-200/50 bg-white/30 backdrop-blur-sm">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 font-bold transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header (optional, skip for simplicity as it's an admin panel) */}
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
