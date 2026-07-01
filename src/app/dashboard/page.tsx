'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, CheckCircle, XCircle, LayoutDashboard, Stethoscope, Building2, MapPin, MonitorPlay, Users2, ChevronDown, ChevronUp } from 'lucide-react';

const CollapsibleLeaderboard = ({ 
  title, 
  icon: Icon, 
  dataList, 
  gradientClass, 
  borderColor, 
  iconBgColor, 
  scoreColor, 
  hoverBg,
  badgeColor
}: any) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className={`bg-white rounded-2xl shadow-md border ${borderColor} overflow-hidden`}>
      <div 
        className={`${gradientClass} px-6 py-4 border-b ${borderColor} cursor-pointer flex justify-between items-center`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-lg font-bold text-white flex items-center">
          <Icon className="w-5 h-5 mr-2" /> {title}
        </h2>
        <div className="text-white opacity-80">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>
      {isOpen && (
        <ul className="divide-y divide-gray-100">
          {dataList?.map((user: any, index: number) => (
            <li key={user.id} className={`px-6 py-4 flex items-center justify-between ${hoverBg} transition-colors`}>
              <div className="flex items-center">
                <span className={`w-10 h-10 rounded-full ${iconBgColor} flex items-center justify-center font-black mr-4 shadow-inner min-w-[40px]`}>
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                    <span className="flex items-center"><MapPin className="w-3 h-3 mr-0.5" /> {user.district || '-'}</span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded-full">{user.occupation || '-'}</span>
                    <span className={`${badgeColor || 'bg-gray-50 text-gray-600'} px-2 py-0.5 rounded-full`}>{user.attendanceType || '-'}</span>
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">ส่งเมื่อ: {new Date(user.submittedAt).toLocaleString('th-TH')}</p>
                </div>
              </div>
              <span className={`text-lg font-black ${scoreColor} ml-4`}>{(Number(user.score) / 5).toFixed(0)}/20</span>
            </li>
          ))}
          {(!dataList || dataList.length === 0) && <li className="px-6 py-8 text-sm text-gray-500 text-center">ยังไม่มีข้อมูล</li>}
        </ul>
      )}
    </div>
  );
};

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

    // Auto-polling every 10 seconds (10000 ms)
    const intervalId = setInterval(fetchDashboard, 10000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">กำลังโหลดข้อมูล Dashboard...</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center bg-gray-50">ไม่สามารถโหลดข้อมูลได้</div>;

  const { metrics, charts, leaderboards } = data;

  const MetricCard = ({ title, value, subtext, icon: Icon, colorClass, borderClass }: any) => (
    <div className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border ${borderClass} p-6 flex items-center relative overflow-hidden group`}>
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${colorClass} opacity-10 group-hover:scale-150 transition-transform duration-500`}></div>
      <div className={`p-4 rounded-full ${colorClass} bg-opacity-10 mr-5 relative z-10`}>
        <Icon className={`w-8 h-8 ${colorClass.replace('bg-', 'text-').replace('-600', '-500')}`} />
      </div>
      <div className="relative z-10 w-full flex justify-between items-end">
        <div>
          <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">{title}</p>
          <p className="text-4xl font-black text-gray-800">{value}</p>
        </div>
        {subtext && (
          <div className="text-right">
            {subtext}
          </div>
        )}
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

  const advanced = metrics.advanced;

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-10">
        
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

        {/* Overall Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard title="ผู้เข้าสอบทั้งหมด" value={metrics.totalUsers} icon={Users} colorClass="bg-blue-600" borderClass="border-blue-100" />
          <MetricCard title="สอบผ่าน (Posttest)" value={metrics.totalPassed} icon={CheckCircle} colorClass="bg-emerald-600" borderClass="border-emerald-100" />
          <MetricCard title="สอบไม่ผ่าน (Posttest)" value={metrics.totalFailed} icon={XCircle} colorClass="bg-red-600" borderClass="border-red-100" />
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            title="ผู้สอบ - อสม." 
            value={advanced.osm.total} 
            icon={Users2} 
            colorClass="bg-purple-600" 
            borderClass="border-purple-100" 
            subtext={
              <div className="text-xs text-gray-500 font-medium">
                <p className="text-emerald-600">ผ่าน: {advanced.osm.passed}</p>
                <p className="text-red-500">ไม่ผ่าน: {advanced.osm.failed}</p>
              </div>
            }
          />
          <MetricCard 
            title="ผู้สอบ - เจ้าหน้าที่" 
            value={advanced.officer.total} 
            icon={Stethoscope} 
            colorClass="bg-indigo-600" 
            borderClass="border-indigo-100"
            subtext={
              <div className="text-xs text-gray-500 font-medium">
                <p className="text-emerald-600">ผ่าน: {advanced.officer.passed}</p>
                <p className="text-red-500">ไม่ผ่าน: {advanced.officer.failed}</p>
              </div>
            }
          />
          <MetricCard 
            title="รูปแบบ On-Site" 
            value={advanced.onsite.total} 
            icon={Building2} 
            colorClass="bg-orange-600" 
            borderClass="border-orange-100" 
            subtext={
              <div className="text-xs text-gray-500 font-medium">
                <p className="text-emerald-600">ผ่าน: {advanced.onsite.passed}</p>
                <p className="text-red-500">ไม่ผ่าน: {advanced.onsite.failed}</p>
              </div>
            }
          />
          <MetricCard 
            title="รูปแบบ On-line" 
            value={advanced.online.total} 
            icon={MonitorPlay} 
            colorClass="bg-pink-600" 
            borderClass="border-pink-100"
            subtext={
              <div className="text-xs text-gray-500 font-medium">
                <p className="text-emerald-600">ผ่าน: {advanced.online.passed}</p>
                <p className="text-red-500">ไม่ผ่าน: {advanced.online.failed}</p>
              </div>
            } 
          />
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <CollapsibleLeaderboard 
            title="Leaderboard - Pretest (อสม.)"
            icon={LayoutDashboard}
            dataList={leaderboards.pretest}
            gradientClass="bg-gradient-to-r from-emerald-500 to-teal-500"
            borderColor="border-emerald-100"
            iconBgColor="bg-emerald-100 text-emerald-800"
            scoreColor="text-emerald-600"
            hoverBg="hover:bg-emerald-50"
            badgeColor="bg-emerald-50 text-emerald-600"
          />
          <CollapsibleLeaderboard 
            title="Leaderboard - Posttest (อสม.)"
            icon={CheckCircle}
            dataList={leaderboards.posttest}
            gradientClass="bg-gradient-to-r from-green-500 to-emerald-500"
            borderColor="border-emerald-100"
            iconBgColor="bg-green-100 text-green-800"
            scoreColor="text-green-600"
            hoverBg="hover:bg-green-50"
            badgeColor="bg-green-50 text-green-600"
          />
        </div>

        {/* Officer Leaderboards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <CollapsibleLeaderboard 
            title="Leaderboard - Pretest (เฉพาะเจ้าหน้าที่)"
            icon={LayoutDashboard}
            dataList={leaderboards.officerPretest}
            gradientClass="bg-gradient-to-r from-blue-500 to-indigo-500"
            borderColor="border-blue-100"
            iconBgColor="bg-blue-100 text-blue-800"
            scoreColor="text-blue-600"
            hoverBg="hover:bg-blue-50"
            badgeColor="bg-blue-50 text-blue-600"
          />
          <CollapsibleLeaderboard 
            title="Leaderboard - Posttest (เฉพาะเจ้าหน้าที่)"
            icon={CheckCircle}
            dataList={leaderboards.officerPosttest}
            gradientClass="bg-gradient-to-r from-indigo-500 to-purple-500"
            borderColor="border-blue-100"
            iconBgColor="bg-indigo-100 text-indigo-800"
            scoreColor="text-indigo-600"
            hoverBg="hover:bg-indigo-50"
            badgeColor="bg-indigo-50 text-indigo-600"
          />
        </div>

        {/* Leaderboards - Online */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <CollapsibleLeaderboard 
            title="Leaderboard - Pretest (อสม. - On-line)"
            icon={LayoutDashboard}
            dataList={leaderboards.onlinePretest}
            gradientClass="bg-gradient-to-r from-pink-500 to-rose-500"
            borderColor="border-pink-100"
            iconBgColor="bg-pink-100 text-pink-800"
            scoreColor="text-pink-600"
            hoverBg="hover:bg-pink-50"
            badgeColor="bg-pink-50 text-pink-600"
          />
          <CollapsibleLeaderboard 
            title="Leaderboard - Posttest (อสม. - On-line)"
            icon={CheckCircle}
            dataList={leaderboards.onlinePosttest}
            gradientClass="bg-gradient-to-r from-rose-500 to-red-500"
            borderColor="border-pink-100"
            iconBgColor="bg-rose-100 text-rose-800"
            scoreColor="text-rose-600"
            hoverBg="hover:bg-rose-50"
            badgeColor="bg-rose-50 text-rose-600"
          />
        </div>

        {/* Officer Leaderboards - Online */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CollapsibleLeaderboard 
            title="Leaderboard - Pretest (เจ้าหน้าที่ - On-line)"
            icon={LayoutDashboard}
            dataList={leaderboards.onlineOfficerPretest}
            gradientClass="bg-gradient-to-r from-orange-500 to-amber-500"
            borderColor="border-orange-100"
            iconBgColor="bg-orange-100 text-orange-800"
            scoreColor="text-orange-600"
            hoverBg="hover:bg-orange-50"
            badgeColor="bg-orange-50 text-orange-600"
          />
          <CollapsibleLeaderboard 
            title="Leaderboard - Posttest (เจ้าหน้าที่ - On-line)"
            icon={CheckCircle}
            dataList={leaderboards.onlineOfficerPosttest}
            gradientClass="bg-gradient-to-r from-amber-500 to-yellow-500"
            borderColor="border-orange-100"
            iconBgColor="bg-amber-100 text-amber-800"
            scoreColor="text-amber-600"
            hoverBg="hover:bg-amber-50"
            badgeColor="bg-amber-50 text-amber-600"
          />
        </div>

    </div>
  );
}
