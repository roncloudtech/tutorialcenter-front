import React, { useState } from "react";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import { Icon } from "@iconify/react";
import { 
  MagnifyingGlassIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  UserGroupIcon as UserGroupOutline,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

export default function CourseAdvisorStudentManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(5);

  const stats = [
    { label: "Total Students", value: "42", badge: "+2 New", icon: <UserGroupOutline className="w-6 h-6 text-[#09314F]" />, color: "blue" },
    { label: "Average Grade", value: "76.4%", badge: "+1.23%", icon: <ChartBarIcon className="w-6 h-6 text-[#09314F]" />, color: "blue" },
    { label: "Attendance Rate", value: "90.4%", badge: "Stable", icon: <CheckCircleIcon className="w-6 h-6 text-[#09314F]" />, color: "blue" },
    { label: "Alert", value: "7", badge: null, icon: <ExclamationTriangleIcon className="w-6 h-6 text-[#09314F]" />, color: "blue" },
  ];

  const students = [
    { id: 1, name: "Kola John Olamide", average: 66, class: "#01", address: "Lagos, Nigerian", phone: "081XXXXXXXX", dob: "17/10/2005", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kola1" },
    { id: 2, name: "Kola John Olamide", average: 73, class: "#01", address: "Lagos, Nigerian", phone: "081XXXXXXXX", dob: "17/10/2005", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kola2" },
    { id: 3, name: "Kola John Olamide", average: 81, class: "#01", address: "Lagos, Nigerian", phone: "081XXXXXXXX", dob: "17/10/2005", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kola3" },
    { id: 4, name: "Kola John Olamide", average: 48, class: "#01", address: "Lagos, Nigerian", phone: "081XXXXXXXX", dob: "17/10/2005", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kola4" },
    { id: 5, name: "Kola John Olamide", average: 68, class: "#01", address: "Lagos, Nigerian", phone: "081XXXXXXXX", dob: "17/10/2005", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kola5" },
    { id: 6, name: "Kola John Olamide", average: 56, class: "#01", address: "Lagos, Nigerian", phone: "081XXXXXXXX", dob: "17/10/2005", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kola6" },
    { id: 7, name: "Kola John Olamide", average: 86, class: "#01", address: "Lagos, Nigerian", phone: "081XXXXXXXX", dob: "17/10/2005", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kola7" },
  ];

  const getGradeColor = (avg) => {
    if (avg >= 80) return "text-[#76D287]";
    if (avg >= 50) return "text-[#F5A623]";
    return "text-[#E83831]";
  };

  return (
    <StaffDashboardLayout pagetitle="Student Management">
      <div className="p-6 max-w-6xl mx-auto w-full min-h-screen bg-[#F8F9FA]">
        
        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-start relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-center justify-between w-full mb-4">
                <div className="p-2.5 bg-gray-50 rounded-xl group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                {stat.badge && (
                  <div className="px-2 py-1 bg-white border border-gray-100 rounded-lg text-[10px] font-black text-gray-400 uppercase">
                    {stat.badge}
                  </div>
                )}
              </div>
              <h4 className="text-xs font-bold text-gray-400 mb-1 tracking-tight">{stat.label}</h4>
              <div className="text-2xl font-black text-[#0F2843]">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-[#0F2843] focus:ring-2 focus:ring-[#0F2843] focus:border-transparent transition-all placeholder:text-gray-400 shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all">
               <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all">
               <ChevronRightIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#B99E7F] text-white">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest">Name</th>
                  <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-center">Average</th>
                  <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-center">Class</th>
                  <th className="px-4 py-4 text-xs font-black uppercase tracking-widest">Address</th>
                  <th className="px-4 py-4 text-xs font-black uppercase tracking-widest">Phone number</th>
                  <th className="px-4 py-4 text-xs font-black uppercase tracking-widest">DOB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={student.avatar} alt="" className="w-10 h-10 rounded-full border border-gray-100 bg-gray-50 object-cover" />
                        <span className="text-sm font-bold text-[#0F2843]">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-sm font-black ${getGradeColor(student.average)}`}>
                        {student.average}%
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-bold text-gray-600">{student.class}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-bold text-gray-500">{student.address}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-bold text-gray-600">{student.phone}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-bold text-gray-400">{student.dob}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
            <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0">
               <button className="p-2.5 rounded-lg hover:bg-gray-100 transition-all">
                  <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
               </button>
               {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                 <button 
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={`min-w-[40px] h-10 rounded-lg text-xs font-black transition-all shadow-sm ${
                    currentPage === num 
                      ? "bg-[#B99E7F] text-white" 
                      : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
                  }`}
                 >
                   {num}
                 </button>
               ))}
               <button className="p-2.5 rounded-lg hover:bg-gray-100 transition-all">
                  <ChevronRightIcon className="w-4 h-4 text-gray-600" />
               </button>
            </div>
            
            <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
               <div className="flex items-center gap-2 px-3 border-r border-gray-100">
                  <span className="text-[10px] font-black text-[#B99E7F] px-2 py-1 bg-[#B99E7F]/10 rounded-md">5</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">/ page</span>
               </div>
               <button className="p-1 px-2 hover:bg-gray-50 transition-all">
                  <Icon icon="mdi:chevron-down" className="w-4 h-4 text-gray-400" />
               </button>
            </div>
        </div>
      </div>
    </StaffDashboardLayout>
  );
}
