import React from "react";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import {
  UserGroupIcon as UserGroupOutline, 
  ShieldCheckIcon,
  FunnelIcon 
} from "@heroicons/react/24/outline";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

const performanceData = [
  { month: "Jan", score: 35 },
  { month: "Feb", score: 55 },
  { month: "Mar", score: 62 },
  { month: "Apr", score: 38 },
  { month: "May", score: 55 },
  { month: "Jun", score: 78 },
  { month: "Jul", score: 45 },
  { month: "Aug", score: 40 },
  { month: "Sep", score: 60 },
];

const topStudents = [
  { name: "Kola John Olamide", score: 66, attendance: 80, status: "Excellent", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kola1" },
  { name: "Kola John Olamide", score: 66, attendance: 80, status: "Good", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kola2" },
  { name: "Kola John Olamide", score: 66, attendance: 80, status: "Bad", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kola3" },
  { name: "Kola John Olamide", score: 66, attendance: 80, status: "Excellent", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kola4" },
  { name: "Kola John Olamide", score: 66, attendance: 80, status: "Excellent", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kola5" },
];

const feedbackData = [
  { name: "Kola John Olamide", time: "2hr ago", text: "Lorem ipsum dolor sit amet consectetur. Suscipit tristique ipsum id etiam accumsan u...", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=F1" },
  { name: "Kola John Olamide", time: "2hr ago", text: "Lorem ipsum dolor sit amet consectetur. Suscipit tristique ipsum id etiam accumsan u...", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=F2" },
  { name: "Kola John Olamide", time: "1d ago", text: "Lorem ipsum dolor sit amet consectetur. Suscipit tristique ipsum id etiam accumsan u...", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=F3" },
  { name: "Kola John Olamide", time: "1w ago", text: "Lorem ipsum dolor sit amet consectetur. Suscipit tristique ipsum id etiam accumsan u...", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=F4" },
];

export default function CourseAdvisorDashboard() {
  return (
    <StaffDashboardLayout pagetitle="Dashboard" hideHeader={false}>
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        
        {/* Alert Banner */}
        <div className="bg-[#EBEDED] dark:bg-gray-800 p-6 rounded-xl flex justify-between items-center shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-[#09314F] dark:text-gray-200 font-medium text-sm md:text-base">
            You have English Master Class in 20mins
          </p>
          <span className="text-[10px] md:text-xs text-gray-500 font-bold uppercase">10:15am</span>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Total Students Card */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl group-hover:scale-110 transition-transform">
                <UserGroupOutline className="w-6 h-6 text-[#09314F] dark:text-blue-400" />
              </div>
              <span className="px-3 py-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-wider">
                +2 this month
              </span>
            </div>
            <h4 className="text-sm font-bold text-gray-400 mb-1 tracking-tight">Total Students</h4>
            <div className="text-4xl font-black text-[#09314F] dark:text-white mb-6 tracking-tighter">42</div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50 dark:border-gray-700">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Active Students <span className="lowercase text-gray-300 font-medium">(online)</span></p>
                <p className="text-2xl font-black text-[#76D287]">38</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Inactive Students <span className="lowercase text-gray-300 font-medium">(offline)</span></p>
                <p className="text-2xl font-black text-[#E83831]">38</p>
              </div>
            </div>
            <p className="mt-4 text-[10px] font-bold text-gray-400 uppercase">Students currently in your roster</p>
          </div>

          {/* Total Guardians Card */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl group-hover:scale-110 transition-transform">
                <ShieldCheckIcon className="w-6 h-6 text-[#09314F] dark:text-blue-400" />
              </div>
              <span className="px-3 py-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-wider">
                +0 this month
              </span>
            </div>
            <h4 className="text-sm font-bold text-gray-400 mb-1 tracking-tight">Total Guardians</h4>
            <div className="text-4xl font-black text-[#09314F] dark:text-white mb-6 tracking-tighter">10</div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50 dark:border-gray-700">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Active Students <span className="lowercase text-gray-300 font-medium">(online)</span></p>
                <p className="text-2xl font-black text-[#76D287]">3</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Inactive Students <span className="lowercase text-gray-300 font-medium">(offline)</span></p>
                <p className="text-2xl font-black text-[#E83831]">7</p>
              </div>
            </div>
            <p className="mt-4 text-[10px] font-bold text-gray-400 uppercase">Guardians currently in your roster</p>
          </div>
        </div>

        {/* Performance Trend Chart */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#0F2843] dark:text-white">Students Performance Trend</h3>
              <p className="text-xs text-gray-400 font-medium">Average performance scores across all platforms modules</p>
            </div>
            <button className="flex items-center gap-2 bg-[#09314F] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#0a3d63] transition-all shadow-md">
              <FunnelIcon className="w-4 h-4" />
              <span>Filter by Grade</span>
            </button>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 700}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 700}}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performing Students Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-8 pb-4">
            <h3 className="text-lg font-bold text-[#0F2843] dark:text-white">Top Performing Students</h3>
            <p className="text-xs text-gray-400 font-medium">Recent performance assessment of high-achieving students</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#B99E7F] text-white">
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Name</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Average Score</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Attendance</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-center">Academic Standing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {topStudents.map((student, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-all">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <img src={student.avatar} alt="" className="w-10 h-10 rounded-full border border-gray-100 dark:border-gray-700 bg-gray-50" />
                        <span className="text-sm font-bold text-[#0F2843] dark:text-gray-200">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-sm font-black text-[#F5A623]">{student.score}%</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{student.attendance}%</span>
                    </td>
                    <td className="px-8 py-5 text-center font-bold text-xs">
                      <span className={`px-4 py-1.5 rounded-full ${
                        student.status === "Excellent" ? "text-gray-600 dark:text-gray-300" : 
                        student.status === "Good" ? "text-gray-600 dark:text-gray-300" :
                        "text-[#E83831]"
                      }`}>
                         {student.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-6 text-center border-t border-gray-50 dark:border-gray-700">
             <button className="text-xs font-bold text-blue-500 hover:text-blue-600 underline">
               View Full Student Registry Report
             </button>
          </div>
        </div>

        {/* Feedbacks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Feedbacks */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2">
                <UserGroupOutline className="w-5 h-5 text-blue-500" />
                <h3 className="text-base font-bold text-[#0F2843] dark:text-white">Students Feedbacks</h3>
              </div>
              <button className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline">View All</button>
            </div>
            
            <div className="space-y-6">
              {feedbackData.map((fb, idx) => (
                <div key={idx} className="flex gap-4 group cursor-pointer">
                  <img src={fb.avatar} alt="" className="w-10 h-10 rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="text-sm font-bold text-[#0F2843] dark:text-gray-200 truncate">{fb.name}</h4>
                      <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap ml-2">{fb.time}</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                      {fb.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Guardian Feedbacks */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-blue-500" />
                <h3 className="text-base font-bold text-[#0F2843] dark:text-white">Guardians Feedbacks</h3>
              </div>
              <button className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline">View All</button>
            </div>
            
            <div className="space-y-6">
              {feedbackData.map((fb, idx) => (
                <div key={idx} className="flex gap-4 group cursor-pointer">
                  <img src={fb.avatar} alt="" className="w-10 h-10 rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="text-sm font-bold text-[#0F2843] dark:text-gray-200 truncate">{fb.name}</h4>
                      <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap ml-2">{fb.time}</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                     {fb.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </StaffDashboardLayout>
  );
}
