'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, CheckCircle, XCircle, FileText, ArrowRight, BookOpen, LogOut, Trophy, Home } from 'lucide-react';
import Link from 'next/link';

export default function UserDashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/user/status');
        if (res.ok) {
          setData(await res.json());
        } else {
          router.push('/');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">กำลังโหลด...</div>;
  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden relative">
          <div className="absolute top-4 right-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Link 
              href="/"
              className="flex items-center space-x-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>กลับหน้าแรก</span>
            </Link>
            <button 
              onClick={() => {
                document.cookie = 'userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                router.push('/');
              }}
              className="flex items-center space-x-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>เปลี่ยนผู้ใช้งาน</span>
            </button>
          </div>
          <div className="bg-emerald-700 px-6 py-8 text-white flex items-center space-x-4">
            <div className="bg-white/20 p-4 rounded-full">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{data.user.name}</h1>
              <p className="text-emerald-100">{data.user.hospital}</p>
            </div>
          </div>
          <div className="p-6 bg-emerald-50 border-t border-emerald-100">
            <h2 className="text-lg font-semibold text-emerald-900 mb-2">ยินดีต้อนรับสู่แดชบอร์ดส่วนตัว</h2>
            <p className="text-emerald-800 text-sm">
              ที่นี่คุณสามารถติดตามผลการทดสอบก่อนเรียน (Pretest) และเข้าทำแบบทดสอบหลังเรียน (Posttest) ได้ตลอดเวลา
            </p>
          </div>
        </div>

        {/* Exams Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Pretest Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Pretest</h3>
                {data.pretest ? (
                  <CheckCircle className="text-green-500 w-6 h-6" />
                ) : (
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                )}
              </div>
              <p className="text-gray-500 text-sm mb-6">แบบทดสอบก่อนเรียนเพื่อประเมินความรู้พื้นฐาน</p>
            </div>
            
            {data.pretest ? (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 text-center">
                <p className="text-sm text-gray-500 font-medium mb-1">คะแนนของคุณ</p>
                <p className="text-3xl font-black text-emerald-700">{Number(data.pretest.score).toFixed(0)}%</p>
                {data.pretest.rank && (
                  <div className="mt-3 inline-flex items-center text-xs font-medium bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                    <Trophy className="w-3 h-3 mr-1" /> อันดับที่ {data.pretest.rank} จาก {data.pretest.total} คน
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => router.push('/exam/pretest')}
                className="w-full flex items-center justify-center px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                เริ่มทำ Pretest <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            )}
          </div>

          {/* Posttest Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between opacity-100">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Posttest</h3>
                {data.posttest ? (
                  data.posttest.isPassed ? <CheckCircle className="text-green-500 w-6 h-6" /> : <XCircle className="text-red-500 w-6 h-6" />
                ) : (
                  <BookOpen className="text-emerald-500 w-6 h-6" />
                )}
              </div>
              <p className="text-gray-500 text-sm mb-6">แบบทดสอบหลังเรียน (เกณฑ์ผ่าน 60%)</p>
            </div>
            
            {data.posttest ? (
              <div className={`rounded-lg p-4 border text-center ${data.posttest.isPassed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <p className={`text-sm font-medium mb-1 ${data.posttest.isPassed ? 'text-green-700' : 'text-red-700'}`}>
                  {data.posttest.isPassed ? 'คุณสอบผ่าน' : 'คุณสอบไม่ผ่าน'}
                </p>
                <p className={`text-3xl font-black ${data.posttest.isPassed ? 'text-green-700' : 'text-red-700'}`}>
                  {Number(data.posttest.score).toFixed(0)}%
                </p>
                {data.posttest.rank && (
                  <div className={`mt-3 inline-flex items-center text-xs font-medium px-3 py-1 rounded-full ${data.posttest.isPassed ? 'bg-green-200 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <Trophy className="w-3 h-3 mr-1" /> อันดับที่ {data.posttest.rank} จาก {data.posttest.total} คน
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => router.push('/exam/posttest')}
                disabled={!data.pretest}
                className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
                  !data.pretest 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                เริ่มทำ Posttest <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            )}
          </div>

        </div>

        {/* Certificate Section */}
        {data.certificateUrl && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-md p-8 text-center text-white">
            <FileText className="w-16 h-16 mx-auto mb-4 text-emerald-200" />
            <h2 className="text-2xl font-bold mb-2">ยินดีด้วย! คุณได้รับเกียรติบัตร</h2>
            <p className="text-emerald-100 mb-6">จัดทำโดย : สมาคมแม่บ้านสาธารณสุข สาขาจังหวัดกาญจนบุรี</p>
            <a 
              href={data.certificateUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-emerald-700 font-bold rounded-full hover:bg-gray-50 transition-transform hover:scale-105"
            >
              ดาวน์โหลดเกียรติบัตร (PDF)
            </a>
          </div>
        )}

      </div>
    </div>
  );
}
