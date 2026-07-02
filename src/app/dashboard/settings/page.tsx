'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Image as ImageIcon, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bgImageBase64, setBgImageBase64] = useState('');
  const [yPos, setYPos] = useState('359'); // Default Y position (height - 236)
  const [fontSize, setFontSize] = useState('40'); // Default Font Size
  const [isExamOpen, setIsExamOpen] = useState(true); // Default open

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      const data = await res.json();
      
      if (data.CERTIFICATE_BG) setBgImageBase64(data.CERTIFICATE_BG);
      if (data.CERTIFICATE_Y_POS) setYPos(data.CERTIFICATE_Y_POS);
      if (data.CERTIFICATE_FONT_SIZE) setFontSize(data.CERTIFICATE_FONT_SIZE);
      if (data.SYSTEM_EXAM_OPEN === 'false') setIsExamOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('image/')) {
      alert('กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น');
      return;
    }

    // Convert file to Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setBgImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const settings = {
        CERTIFICATE_BG: bgImageBase64,
        CERTIFICATE_Y_POS: yPos,
        CERTIFICATE_FONT_SIZE: fontSize,
        SYSTEM_EXAM_OPEN: isExamOpen.toString(),
      };

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });

      if (res.ok) {
        alert('บันทึกการตั้งค่าเรียบร้อยแล้ว');
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึกการตั้งค่า');
      }
    } catch (e) {
      console.error(e);
      alert('เกิดข้อผิดพลาดในการบันทึกการตั้งค่า');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Settings className="w-6 h-6 mr-3 text-pink-600" />
            ตั้งค่าระบบ (Settings)
          </h1>
          <p className="text-gray-500 mt-1">จัดการพื้นหลังเกียรติบัตรและตำแหน่งข้อความ</p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 rounded-xl font-bold transition-all shadow-md shadow-pink-200 disabled:opacity-50"
        >
          {saving ? 'กำลังบันทึก...' : <><Save className="w-4 h-4 mr-2" /> บันทึกการตั้งค่า</>}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-8">
        
        {/* System Status Toggle */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4">สถานะระบบสอบ</h3>
          <div className="flex items-center justify-between p-4 border rounded-xl bg-gray-50">
            <div>
              <p className="font-semibold text-gray-800">เปิด-ปิด รับการส่งข้อสอบ</p>
              <p className="text-sm text-gray-500">หากปิดระบบ ผู้เข้าสอบจะไม่สามารถเข้าทำแบบทดสอบหรือส่งคำตอบได้</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={isExamOpen}
                onChange={() => setIsExamOpen(!isExamOpen)}
              />
              <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Certificate BG */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center mb-4">
            <ImageIcon className="w-5 h-5 mr-2 text-indigo-500" /> รูปแบบเกียรติบัตร (พื้นหลัง)
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">คลิกเพื่ออัปโหลด</span> หรือลากไฟล์มาวางที่นี่</p>
                  <p className="text-xs text-gray-500">PNG, JPG (แนะนำขนาด A4 แนวนอน)</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
            
            {bgImageBase64 && (
              <div className="mt-4 border rounded-xl overflow-hidden shadow-sm relative">
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-md flex items-center font-bold">
                  <CheckCircle className="w-3 h-3 mr-1" /> มีรูปภาพพร้อมใช้งาน
                </div>
                <img src={bgImageBase64} alt="Certificate Background" className="w-full h-auto" />
              </div>
            )}
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Text Position Settings */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4">ตำแหน่งและขนาดตัวอักษร (ชื่อผู้สอบ)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ตำแหน่ง Y (ความสูง-ต่ำ)</label>
              <input 
                type="number" 
                value={yPos} 
                onChange={(e) => setYPos(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                placeholder="ค่าเริ่มต้น: 359"
              />
              <p className="text-xs text-gray-500 mt-2">
                * เลขยิ่งมาก = ชื่อยิ่งอยู่ใกล้ขอบบน (ค่าเดิมประมาณ 359 สำหรับขนาด A4)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ขนาดตัวอักษร (Font Size)</label>
              <input 
                type="number" 
                value={fontSize} 
                onChange={(e) => setFontSize(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                placeholder="ค่าเริ่มต้น: 40"
              />
              <p className="text-xs text-gray-500 mt-2">
                * ค่าเริ่มต้นคือ 40
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
