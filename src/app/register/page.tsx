'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Stethoscope, User, Phone, Building, ClipboardEdit, MapPin, Briefcase, Video } from 'lucide-react';

const DISTRICTS = [
  'อ.เมือง', 'อ.ท่ามะกา', 'อ.ไทรโยค', 'อ.บ่อพลอย', 'อ.ท่าม่วง', 
  'อ.ทองผาภูมิ', 'อ.สังขละบุรี', 'อ.พนมทวน', 'อ.เลาขวัญ', 
  'อ.ด่านมะขามเตี้ย', 'อ.หนองปรือ', 'อ.ศรีสวัสดิ์', 'อ.ห้วยกระเจา'
];

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState({ 
    name: '', 
    phone: '', 
    district: '',
    occupation: '',
    attendanceType: '',
    hospital: '' 
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already registered
    const userId = document.cookie.split('; ').find(row => row.startsWith('userId='))?.split('=')[1];
    if (userId) {
      router.push('/user/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const { user } = await res.json();
        document.cookie = `userId=${user.id}; path=/; max-age=86400`; // 1 day cookie
        router.push('/user/dashboard');
      } else {
        alert('เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง');
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-white/50 my-8">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 text-white mb-4 shadow-inner">
            <Stethoscope size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">ระบบประเมินความรู้ออนไลน์</h1>
          <p className="text-emerald-100 text-sm">
            โครงการประชุมแลกเปลี่ยนเรียนรู้การดูแลผู้ป่วยโรคไต<br/>จังหวัดกาญจนบุรี
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ชื่อ - นามสกุล</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  className="focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3 border bg-gray-50/50 hover:bg-gray-50 transition-colors"
                  placeholder="เช่น สมชาย รักดี"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">เบอร์โทรศัพท์</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  pattern="[0-9]{10}"
                  title="กรุณากรอกเบอร์โทรศัพท์ 10 หลัก"
                  className="focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3 border bg-gray-50/50 hover:bg-gray-50 transition-colors"
                  placeholder="เช่น 0812345678"
                  value={formData.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, phone: val });
                  }}
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">อำเภอ</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  required
                  className="focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3 border bg-gray-50/50 hover:bg-gray-50 transition-colors"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                >
                  <option value="" disabled>-- เลือกอำเภอ --</option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="relative">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">อาชีพ</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  required
                  className="focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3 border bg-gray-50/50 hover:bg-gray-50 transition-colors"
                  value={formData.occupation}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      occupation: e.target.value,
                      hospital: e.target.value === 'อสม.' ? '' : formData.hospital 
                    });
                  }}
                >
                  <option value="" disabled>-- เลือกอาชีพ --</option>
                  <option value="อสม.">อสม.</option>
                  <option value="เจ้าหน้าที่">เจ้าหน้าที่</option>
                </select>
              </div>
            </div>

            {formData.occupation === 'เจ้าหน้าที่' && (
              <div className="relative">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">หน่วยงาน</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    required
                    className="focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3 border bg-gray-50/50 hover:bg-gray-50 transition-colors"
                    value={formData.hospital}
                    onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                  >
                    <option value="" disabled>-- เลือกหน่วยงาน --</option>
                    <option value="โรงพยาบาลศูนย์/โรงพยาบาลทั่วไป">โรงพยาบาลศูนย์/โรงพยาบาลทั่วไป</option>
                    <option value="โรงพยาบาลชุมชน">โรงพยาบาลชุมชน</option>
                    <option value="สำนักงานสาธารณสุขอำเภอ">สำนักงานสาธารณสุขอำเภอ</option>
                    <option value="สำนักงานสาธารณสุขจังหวัดกาญจนบุรี">สำนักงานสาธารณสุขจังหวัดกาญจนบุรี</option>
                  </select>
                </div>
              </div>
            )}

            <div className="relative">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">รูปแบบการเข้าร่วมประชุม</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Video className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  required
                  className="focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3 border bg-gray-50/50 hover:bg-gray-50 transition-colors"
                  value={formData.attendanceType}
                  onChange={(e) => setFormData({ ...formData, attendanceType: e.target.value })}
                >
                  <option value="" disabled>-- เลือกรูปแบบ --</option>
                  <option value="On-Site">On-Site</option>
                  <option value="On-line">On-line</option>
                </select>
              </div>
            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
          >
            {loading ? (
              'กำลังดำเนินการ...'
            ) : (
              <>
                <ClipboardEdit className="w-5 h-5 mr-2" />
                เริ่มการประเมิน
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
