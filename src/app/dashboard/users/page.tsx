'use client';

import { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Trash2, Edit, AlertTriangle, Search, Filter, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UsersManagementPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', phone: '', hospital: '', district: '', occupation: '', attendanceType: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

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
    const confirmed = window.confirm("คำเตือน: คุณกำลังจะลบข้อมูลผู้เข้าร่วมการประเมินทั้งหมด รวมทั้งผลการสอบทั้งหมด\n\nคุณแน่ใจหรือไม่ที่จะดำเนินการนี้?");
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
    setEditFormData({ 
      name: user.name, 
      phone: user.phone, 
      hospital: user.hospital || '',
      district: user.district || '',
      occupation: user.occupation || '',
      attendanceType: user.attendanceType || ''
    });
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

  const filteredUsers = usersData ? usersData.filter((user: any) => {
    // Search match
    const searchString = `${user.name} ${user.phone} ${user.hospital} ${user.district} ${user.occupation}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    
    // Filter match
    let matchesFilter = true;
    if (filterStatus === 'อสม.') matchesFilter = user.occupation === 'อสม.';
    if (filterStatus === 'เจ้าหน้าที่') matchesFilter = user.occupation === 'เจ้าหน้าที่';
    if (filterStatus === 'On-Site') matchesFilter = user.attendanceType === 'On-Site';
    if (filterStatus === 'On-line') matchesFilter = user.attendanceType === 'On-line';

    return matchesSearch && matchesFilter;
  }) : [];

  const getEvaluation = (score: number | null) => {
    if (score === null) return '-';
    if (score >= 80) return 'ดีมาก';
    if (score >= 55) return 'ดี';
    if (score >= 30) return 'พอใช้';
    return 'ควรทบทวน';
  };

  const handleExportCSV = () => {
    if (!filteredUsers || filteredUsers.length === 0) return alert('ไม่มีข้อมูลสำหรับส่งออก');
    
    const headers = ['ชื่อ - นามสกุล', 'เบอร์โทรศัพท์', 'อำเภอ', 'อาชีพ', 'รูปแบบ', 'หน่วยงาน', 'Pretest (คะแนน)', 'Posttest (คะแนน)', 'ผลประเมิน Posttest'];
    const rows = filteredUsers.map((u: any) => [
      u.name,
      u.phone,
      u.district || '-',
      u.occupation || '-',
      u.attendanceType || '-',
      u.hospital || '-',
      u.pretestScore !== null ? (Number(u.pretestScore) / 5).toFixed(0) : '-',
      u.posttestScore !== null ? (Number(u.posttestScore) / 5).toFixed(0) : '-',
      getEvaluation(u.posttestScore)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row: any[]) => row.map((cell: any) => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }); // \uFEFF for Excel UTF-8 BOM
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ข้อมูลผู้ใช้_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
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
        {/* Search, Filter, Export Bar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="ค้นหาชื่อ, เบอร์โทร..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div className="relative flex items-center">
              <Filter className="w-4 h-4 absolute left-3 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 w-full sm:w-auto"
              >
                <option value="ALL">ทั้งหมด</option>
                <option value="อสม.">เฉพาะ อสม.</option>
                <option value="เจ้าหน้าที่">เฉพาะ เจ้าหน้าที่</option>
                <option value="On-Site">เฉพาะ On-Site</option>
                <option value="On-line">เฉพาะ On-line</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={handleExportCSV}
            className="flex items-center px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg font-semibold transition-colors border border-emerald-200 hover:border-emerald-600 w-full md:w-auto justify-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel (CSV)
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-4 font-bold">ชื่อ - นามสกุล</th>
                <th className="px-4 py-4 font-bold">เบอร์โทรศัพท์</th>
                <th className="px-4 py-4 font-bold">อำเภอ</th>
                <th className="px-4 py-4 font-bold">อาชีพ</th>
                <th className="px-4 py-4 font-bold">รูปแบบ</th>
                <th className="px-4 py-4 font-bold">หน่วยงาน</th>
                <th className="px-4 py-4 font-bold text-center">Pretest</th>
                <th className="px-4 py-4 font-bold text-center">Posttest</th>
                <th className="px-4 py-4 font-bold text-center">ผลประเมิน</th>
                <th className="px-4 py-4 font-bold text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers && filteredUsers.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 font-medium text-gray-900 min-w-[150px]">
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
                  <td className="px-4 py-4 whitespace-nowrap">
                    {editMode === user.id ? (
                      <input 
                        type="text" 
                        value={editFormData.district} 
                        onChange={e => setEditFormData({...editFormData, district: e.target.value})}
                        className="w-full border rounded px-2 py-1 text-sm"
                      />
                    ) : (user.district || '-')}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {editMode === user.id ? (
                      <select 
                        value={editFormData.occupation} 
                        onChange={e => setEditFormData({...editFormData, occupation: e.target.value})}
                        className="w-full border rounded px-2 py-1 text-sm"
                      >
                        <option value="อสม.">อสม.</option>
                        <option value="เจ้าหน้าที่">เจ้าหน้าที่</option>
                      </select>
                    ) : (user.occupation || '-')}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {editMode === user.id ? (
                      <select 
                        value={editFormData.attendanceType} 
                        onChange={e => setEditFormData({...editFormData, attendanceType: e.target.value})}
                        className="w-full border rounded px-2 py-1 text-sm"
                      >
                        <option value="On-Site">On-Site</option>
                        <option value="On-line">On-line</option>
                      </select>
                    ) : (user.attendanceType || '-')}
                  </td>
                  <td className="px-4 py-4">
                    {editMode === user.id ? (
                      <input 
                        type="text" 
                        value={editFormData.hospital} 
                        onChange={e => setEditFormData({...editFormData, hospital: e.target.value})}
                        className="w-full border rounded px-2 py-1 text-sm"
                      />
                    ) : (user.hospital || '-')}
                  </td>
                  <td className="px-4 py-4 text-center font-semibold text-gray-700">
                    {user.pretestScore !== null ? (Number(user.pretestScore) / 5).toFixed(0) : '-'}
                  </td>
                  <td className="px-4 py-4 text-center font-semibold text-gray-700">
                    {user.posttestScore !== null ? (Number(user.posttestScore) / 5).toFixed(0) : '-'}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {user.posttestScore !== null ? (
                      <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center justify-center w-max mx-auto ${
                        user.posttestScore >= 80 ? 'bg-blue-100 text-blue-800' :
                        user.posttestScore >= 55 ? 'bg-green-100 text-green-800' :
                        user.posttestScore >= 30 ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {getEvaluation(user.posttestScore)}
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full w-max mx-auto">
                        ยังไม่ทำ
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
              {(!filteredUsers || filteredUsers.length === 0) && (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                    ไม่พบข้อมูลผู้เข้าร่วมการประเมิน
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
