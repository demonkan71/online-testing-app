'use client';

import { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UsersManagementPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', phone: '', hospital: '' });

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleClearAll = async () => {
    const confirmed = window.confirm("คำเตือน: คุณกำลังจะลบข้อมูลผู้เข้าร่วมการประเมินทั้งหมด รวมทั้งผลการสอบทั้งหมด\\n\\nคุณแน่ใจหรือไม่ที่จะดำเนินการนี้?");
    if (!confirmed) return;

    try {
      const res = await fetch('/api/users/clear', { method: 'DELETE' });
      if (res.ok) {
        alert('ลบข้อมูลทั้งหมดเรียบร้อยแล้ว');
        fetchDashboard();
      } else {
        alert('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    } catch (e) {
      console.error(e);
      alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    const confirmed = window.confirm(`คุณแน่ใจหรือไม่ที่จะลบข้อมูลของคุณ: ${name}?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchDashboard();
      } else {
        alert('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    } catch (e) {
      console.error(e);
      alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  const handleEditClick = (user: any) => {
    setEditMode(user.id);
    setEditFormData({ name: user.name, phone: user.phone, hospital: user.hospital });
  };

  const handleSaveEdit = async (id: string) => {
    const confirmed = window.confirm("คุณต้องการบันทึกการเปลี่ยนแปลงนี้ใช่หรือไม่?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (res.ok) {
        setEditMode(null);
        fetchDashboard();
      } else {
        alert('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
      }
    } catch (e) {
      console.error(e);
      alert('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">กำลังโหลดข้อมูล...</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center bg-gray-50">ไม่สามารถโหลดข้อมูลได้</div>;

  const { usersData } = data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Users className="w-6 h-6 mr-3 text-pink-600" />
            จัดการข้อมูลผู้ใช้
          </h1>
          <p className="text-gray-500 mt-1">จัดการ ลบ หรือแก้ไขข้อมูลผู้เข้าร่วมการประเมินในช่วงทดสอบระบบ</p>
        </div>
        
        <button
          onClick={handleClearAll}
          className="flex items-center px-4 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg font-semibold transition-colors border border-red-200 hover:border-red-600"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          ล้างข้อมูลทั้งหมด (Clear All)
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-4 font-bold">ชื่อ - นามสกุล</th>
                <th className="px-4 py-4 font-bold">เบอร์โทรศัพท์</th>
                <th className="px-4 py-4 font-bold">หน่วยงาน</th>
                <th className="px-4 py-4 font-bold text-center">Pretest</th>
                <th className="px-4 py-4 font-bold text-center">Posttest</th>
                <th className="px-4 py-4 font-bold text-center">สถานะ</th>
                <th className="px-4 py-4 font-bold text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usersData && usersData.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 font-medium text-gray-900">
                    {editMode === user.id ? (
                      <input 
                        type="text" 
                        value={editFormData.name} 
                        onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                        className="w-full border rounded px-2 py-1 text-sm"
                      />
                    ) : user.name}
                  </td>
                  <td className="px-4 py-4">
                    {editMode === user.id ? (
                      <input 
                        type="text" 
                        value={editFormData.phone} 
                        onChange={e => setEditFormData({...editFormData, phone: e.target.value})}
                        className="w-full border rounded px-2 py-1 text-sm"
                      />
                    ) : user.phone}
                  </td>
                  <td className="px-4 py-4">
                    {editMode === user.id ? (
                      <input 
                        type="text" 
                        value={editFormData.hospital} 
                        onChange={e => setEditFormData({...editFormData, hospital: e.target.value})}
                        className="w-full border rounded px-2 py-1 text-sm"
                      />
                    ) : user.hospital}
                  </td>
                  <td className="px-4 py-4 text-center font-semibold text-gray-700">
                    {user.pretestScore !== null ? Number(user.pretestScore).toFixed(0) + '%' : '-'}
                  </td>
                  <td className="px-4 py-4 text-center font-semibold text-gray-700">
                    {user.posttestScore !== null ? Number(user.posttestScore).toFixed(0) + '%' : '-'}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {user.isPassed === true ? (
                      <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full flex items-center w-max mx-auto">
                        <CheckCircle className="w-3 h-3 mr-1" /> ผ่าน
                      </span>
                    ) : user.isPassed === false ? (
                      <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full flex items-center w-max mx-auto">
                        <XCircle className="w-3 h-3 mr-1" /> ไม่ผ่าน
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full w-max mx-auto">
                        ยังไม่ประเมิน
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {editMode === user.id ? (
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                          onClick={() => handleSaveEdit(user.id)}
                          className="px-3 py-1 text-xs font-medium bg-emerald-600 text-white rounded hover:bg-emerald-700"
                        >
                          บันทึก
                        </button>
                        <button 
                          onClick={() => setEditMode(null)}
                          className="px-3 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                          onClick={() => handleEditClick(user)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="แก้ไข"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="ลบ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {(!usersData || usersData.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    ยังไม่มีข้อมูลผู้เข้าร่วมการประเมิน
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
