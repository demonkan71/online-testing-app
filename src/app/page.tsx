'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Settings, ArrowRight, Lock } from 'lucide-react';

export default function RoleSelectionPage() {
  const router = useRouter();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleParticipantClick = () => {
    const userId = document.cookie.split('; ').find(row => row.startsWith('userId='))?.split('=')[1];
    if (userId) {
      router.push('/user/dashboard');
    } else {
      router.push('/register');
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin@456789') {
      sessionStorage.setItem('isAdmin', 'true');
      router.push('/dashboard');
    } else {
      setError('รหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Fixed Full Screen Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-20"
        style={{ backgroundImage: "url('/BG.jpg')" }}
      />
      <div className="fixed inset-0 bg-emerald-900/40 backdrop-blur-sm -z-10" />
      
      <div className="relative z-10 max-w-4xl w-full flex-grow flex flex-col justify-center">
        <div className="text-center mb-10 flex flex-col items-center">
          <img src="/mss.png" alt="Logo" className="h-32 md:h-48 lg:h-56 object-contain mb-6 drop-shadow-xl animate-in fade-in zoom-in duration-500" />
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-md">ระบบประเมินความรู้ออนไลน์ (Evaluation system)</h1>
          <p className="text-emerald-50 text-lg md:text-xl drop-shadow-md font-medium">โครงการประชุมแลกเปลี่ยนเรียนรู้การดูแลผู้ป่วยโรคไต จังหวัดกาญจนบุรี</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card: Participant */}
          <div 
            onClick={handleParticipantClick}
            className="cursor-pointer group bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 rounded-2xl p-8 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-500/80 rounded-full flex items-center justify-center text-white shadow-inner mb-2 group-hover:bg-emerald-500 transition-colors">
                <User size={40} />
              </div>
              <h2 className="text-2xl font-bold text-white">ผู้เข้าร่วมการประเมิน</h2>
              <p className="text-emerald-50 text-sm">เข้าสู่ระบบเพื่อทำแบบประเมิน</p>
              <div className="mt-4 inline-flex items-center text-emerald-200 group-hover:text-white font-medium transition-colors">
                เข้าสู่ระบบ <ArrowRight size={16} className="ml-2" />
              </div>
            </div>
          </div>

          {/* Card: Admin */}
          <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-8 shadow-xl relative overflow-hidden transition-all duration-300">
            {!showAdminLogin ? (
              <div 
                onClick={() => setShowAdminLogin(true)}
                className="cursor-pointer group flex flex-col items-center text-center space-y-4 h-full justify-center"
              >
                <div className="w-20 h-20 bg-gray-800/60 rounded-full flex items-center justify-center text-white shadow-inner mb-2 group-hover:bg-gray-800 transition-colors">
                  <Settings size={40} />
                </div>
                <h2 className="text-2xl font-bold text-white">คณะผู้จัด</h2>
                <p className="text-gray-100 text-sm">สำหรับผู้ดูแลระบบ เพื่อดูผลสรุปและจัดการแบบทดสอบ</p>
                <div className="mt-4 inline-flex items-center text-gray-200 group-hover:text-white font-medium transition-colors">
                  จัดการระบบ <Lock size={16} className="ml-2" />
                </div>
              </div>
            ) : (
              <form onSubmit={handleAdminLogin} className="flex flex-col h-full justify-center animate-in fade-in zoom-in duration-200">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Lock size={20} className="mr-2" /> ยืนยันตัวตน (คณะผู้จัด)
                </h2>
                
                <div className="space-y-4 flex-grow">
                  <div>
                    <label className="block text-sm font-medium text-emerald-50 mb-1">รหัสผ่าน</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/50 border border-white/50 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder-gray-500"
                      placeholder="กรอกรหัสผ่าน"
                      autoFocus
                    />
                  </div>
                  {error && <p className="text-red-200 text-sm font-medium bg-red-900/50 p-2 rounded">{error}</p>}
                </div>

                <div className="mt-6 flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAdminLogin(false)}
                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium shadow-md transition-colors"
                  >
                    เข้าสู่ระบบ
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-12 mb-4 text-center">
        <p className="text-emerald-50/80 text-sm font-medium drop-shadow-md">
          จัดทำโดยสมาคมแม่บ้านสาธารณสุข สาขาจังหวัดกาญจนบุรี
        </p>
      </div>
    </div>
  );
}
