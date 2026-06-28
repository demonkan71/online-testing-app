'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, FileQuestion, LogOut, Users, Menu, X, Settings } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuth, setIsAuth] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar with Two-tone Pink Gradient */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-pink-50 to-pink-100/50 border-r border-pink-200/50 flex flex-col shadow-lg md:shadow-sm transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-pink-200/50 bg-white/40 backdrop-blur-sm">
          <h1 className="text-2xl font-black bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent drop-shadow-sm">Admin Panel</h1>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-pink-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto">
          <Link 
            href="/dashboard"
            onClick={() => setIsMobileMenuOpen(false)}
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
            href="/dashboard/users"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              pathname === '/dashboard/users' 
                ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-md shadow-pink-200 font-bold scale-105' 
                : 'text-gray-600 hover:bg-white/60 hover:text-pink-600 hover:shadow-sm font-medium'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>จัดการข้อมูลผู้ใช้</span>
          </Link>
          
          <Link 
            href="/dashboard/questions"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              pathname === '/dashboard/questions' 
                ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-md shadow-pink-200 font-bold scale-105' 
                : 'text-gray-600 hover:bg-white/60 hover:text-pink-600 hover:shadow-sm font-medium'
            }`}
          >
            <FileQuestion className="w-5 h-5" />
            <span>จัดการข้อสอบ</span>
          </Link>

          <Link 
            href="/dashboard/settings"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              pathname === '/dashboard/settings' 
                ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-md shadow-pink-200 font-bold scale-105' 
                : 'text-gray-600 hover:bg-white/60 hover:text-pink-600 hover:shadow-sm font-medium'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>ตั้งค่าระบบ</span>
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
        {/* Mobile Header */}
        <header className="md:hidden flex items-center h-16 px-4 bg-white border-b border-gray-200 shrink-0">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 mr-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">Admin Panel</h1>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
