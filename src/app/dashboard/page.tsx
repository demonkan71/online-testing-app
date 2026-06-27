'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, CheckCircle, XCircle, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/dashboard');
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">กำลังโหลดข้อมูล Dashboard...</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center bg-gray-50">ไม่สามารถโหลดข้อมูลได้</div>;

  const { metrics, charts, leaderboards, usersData } = data;

  const MetricCard = ({ title, value, icon: Icon, colorClass, borderClass }: any) => (
    <div className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border ${borderClass} p-6 flex items-center relative overflow-hidden group`}>
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${colorClass} opacity-10 group-hover:scale-150 transition-transform duration-500`}></div>
      <div className={`p-4 rounded-full ${colorClass} bg-opacity-10 mr-5 relative z-10`}>
        <Icon className={`w-8 h-8 ${colorClass.replace('bg-', 'text-').replace('-600', '-500')}`} />
      </div>
      <div className="relative z-10">
        <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">{title}</p>
        <p className="text-4xl font-black text-gray-800">{value}</p>
      </div>
    </div>
  );

  // Apply Ministry of Public Health Theme to charts
  if (charts) {
    charts.compareData.forEach((d: any) => {
      d.fill = '#10B981'; // Emerald 500
    });
    charts.passFailData.forEach((d: any) => {
      if (d.name === 'ผ่าน') d.fill = '#10B981'; // Emerald 500
      if (d.name === 'ไม่ผ่าน') d.fill = '#EF4444'; // Red 500
    });
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-600 rounded-2xl p-8 text-white shadow-lg flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold mb-2">สถิติภาพรวม</h1>
            <p className="text-emerald-100 font-medium">แดชบอร์ดสรุปผลการทดสอบโครงการดูแลผู้ป่วยโรคไต</p>
          </div>
          <div className="hidden md:block bg-white/20 p-4 rounded-xl backdrop-blur-md">
            <LayoutDashboard className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard title="ผู้เข้าสอบทั้งหมด" value={metrics.totalUsers} icon={Users} colorClass="bg-blue-600" borderClass="border-blue-100" />
          <MetricCard title="สอบผ่าน (Posttest)" value={metrics.totalPassed} icon={CheckCircle} colorClass="bg-emerald-600" borderClass="border-emerald-100" />
          <MetricCard title="สอบไม่ผ่าน (Posttest)" value={metrics.totalFailed} icon={XCircle} colorClass="bg-red-600" borderClass="border-red-100" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pass vs Fail Pie Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">สัดส่วนผู้สอบผ่าน (Posttest)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.passFailData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {charts.passFailData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pretest vs Posttest Bar Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">เปรียบเทียบผู้สอบผ่าน (Pretest vs Posttest)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.compareData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="passed" name="จำนวนคนผ่าน" radius={[4, 4, 0, 0]}>
                    {charts.compareData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>



        {/* Leaderboards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-md border border-emerald-100 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 border-b border-emerald-100">
              <h2 className="text-lg font-bold text-white flex items-center">
                <LayoutDashboard className="w-5 h-5 mr-2" /> Leaderboard - Pretest
              </h2>
            </div>
            <ul className="divide-y divide-gray-100">
              {leaderboards.pretest.map((user: any, index: number) => (
                <li key={user.id} className="px-6 py-4 flex items-center justify-between hover:bg-emerald-50 transition-colors">
                  <div className="flex items-center">
                    <span className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black mr-4 shadow-inner">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.hospital}</p>
                    </div>
                  </div>
                  <span className="text-lg font-black text-emerald-600">{Number(user.score).toFixed(0)}%</span>
                </li>
              ))}
              {leaderboards.pretest.length === 0 && <li className="px-6 py-8 text-sm text-gray-500 text-center">ยังไม่มีข้อมูล</li>}
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-emerald-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4 border-b border-green-100">
              <h2 className="text-lg font-bold text-white flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" /> Leaderboard - Posttest
              </h2>
            </div>
            <ul className="divide-y divide-gray-100">
              {leaderboards.posttest.map((user: any, index: number) => (
                <li key={user.id} className="px-6 py-4 flex items-center justify-between hover:bg-green-50 transition-colors">
                  <div className="flex items-center">
                    <span className="w-10 h-10 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-black mr-4 shadow-inner">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.hospital}</p>
                    </div>
                  </div>
                  <span className="text-lg font-black text-green-600">{Number(user.score).toFixed(0)}%</span>
                </li>
              ))}
              {leaderboards.posttest.length === 0 && <li className="px-6 py-8 text-sm text-gray-500 text-center">ยังไม่มีข้อมูล</li>}
            </ul>
          </div>
        </div>

        {/* User Data Table */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden mt-8">
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-white flex items-center">
              <Users className="w-5 h-5 mr-2" /> รายชื่อผู้เข้ารับการประเมิน
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-bold">ชื่อ - นามสกุล</th>
                  <th className="px-6 py-4 font-bold">เบอร์โทรศัพท์</th>
                  <th className="px-6 py-4 font-bold">หน่วยงาน</th>
                  <th className="px-6 py-4 font-bold text-center">Pretest (%)</th>
                  <th className="px-6 py-4 font-bold text-center">Posttest (%)</th>
                  <th className="px-6 py-4 font-bold text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usersData && usersData.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4">{user.phone}</td>
                    <td className="px-6 py-4">{user.hospital}</td>
                    <td className="px-6 py-4 text-center font-semibold text-gray-700">
                      {user.pretestScore !== null ? Number(user.pretestScore).toFixed(0) : '-'}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-gray-700">
                      {user.posttestScore !== null ? Number(user.posttestScore).toFixed(0) : '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {user.isPassed === true ? (
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full flex items-center justify-center w-max mx-auto">
                          <CheckCircle className="w-3 h-3 mr-1" /> ผ่าน
                        </span>
                      ) : user.isPassed === false ? (
                        <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full flex items-center justify-center w-max mx-auto">
                          <XCircle className="w-3 h-3 mr-1" /> ไม่ผ่าน
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                          ยังไม่ประเมิน
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {(!usersData || usersData.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      ยังไม่มีข้อมูลผู้เข้ารับการประเมิน
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
