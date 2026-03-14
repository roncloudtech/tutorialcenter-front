import React, { useState } from "react";
import StaffDashboardLayout from "../../components/private/staffs/DashboardLayout.jsx";
import { useNavigate } from "react-router-dom";
import { 
  UsersIcon, 
  UserPlusIcon, 
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BellIcon,
  ChevronDownIcon,
  UserGroupIcon,
  HandThumbUpIcon,
  NoSymbolIcon
} from "@heroicons/react/24/outline";

/**
 * StaffManagement Component
 * 
 * This page handles the management of staff members.
 * It displays statistics, a searchable list of staff, and pagination.
 * All information is prepared to be populated from the backend.
 */
export default function StaffManagement() {
  const navigate = useNavigate();
  // --- STATE ---
  // Statistics - Initialized to 0 as requested, ready for backend data
  const [stats] = useState([
    { 
      label: "Total Staffs", 
      value: 0, 
      subLabel: "+2 new", 
      icon: UsersIcon, 
      color: "text-[#0F2843]", 
      bg: "bg-blue-50/50",
      counterColor: "bg-white border-gray-100 text-gray-400"
    },
    { 
      label: "Active Staffs", 
      value: 0, 
      subLabel: "Online", 
      icon: HandThumbUpIcon, 
      color: "text-[#22C55E]", 
      bg: "bg-green-50/50",
      counterColor: "bg-white border-green-100 text-[#22C55E]"
    },
    { 
      label: "Inactive Staffs", 
      value: 0, 
      subLabel: "Offline", 
      icon: UserGroupIcon, 
      color: "text-[#EF4444]", 
      bg: "bg-red-50/50",
      counterColor: "bg-white border-red-100 text-[#EF4444]"
    },
    { 
      label: "Suspended", 
      value: 0, 
      subLabel: "+2 staffs", 
      icon: NoSymbolIcon, 
      color: "text-[#F59E0B]", 
      bg: "bg-orange-50/50",
      counterColor: "bg-white border-orange-100 text-[#F59E0B]"
    },
  ]);

  // Pagination state - Default mock state matching mockup visual requirements
  const [currentPage] = useState(5);
  const [totalPages] = useState(12);
  const [viewedPages] = useState([1, 2, 3, 4]);
  const [staffData] = useState([]); // Awaiting info from backend

  return (
    <StaffDashboardLayout>
      <div className="flex flex-col gap-8">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <h1 className="text-[28px] font-black text-[#1F2937] tracking-tight">MANAGE STAFFS</h1>
          <div className="flex items-center gap-4">
             {/* Notification Icon */}
             <div className="relative p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 transition-all">
                <BellIcon className="w-6 h-6 text-[#1F2937]" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#E83831] rounded-full border-2 border-white"></span>
             </div>
             {/* Add Staff Button */}
             <button
             onClick={() => navigate("/staffs/staff-registration")}
             className="flex items-center gap-2 px-8 py-3.5 bg-[#0F2843] text-white font-bold rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all text-sm">
                <span className="text-2xl leading-none">+</span> Add Staff
             </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col justify-between h-44 transition-all hover:translate-y-[-2px]">
               <div className="flex justify-between items-start">
                  <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color}`}>
                     <stat.icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border ${stat.counterColor} shadow-sm uppercase tracking-wider`}>
                    {stat.subLabel}
                  </span>
               </div>
               <div>
                  <p className="text-[13px] font-bold text-gray-400 mb-1">{stat.label}</p>
                  <h3 className="text-4xl font-black text-[#0F2843]">{stat.value}</h3>
               </div>
            </div>
          ))}
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
           {/* Search and Filters */}
           <div className="flex items-center gap-4 w-full md:w-auto flex-1">
              <button className="p-3.5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all">
                 <AdjustmentsHorizontalIcon className="w-6 h-6 text-gray-600" />
              </button>
              <div className="relative flex-1 max-w-lg">
                 <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                 <input 
                   type="text" 
                   placeholder="Search by name" 
                   className="w-full pl-14 pr-6 py-4 bg-white rounded-2xl border-none shadow-[0_4px_15px_rgba(0,0,0,0.02)] focus:ring-2 focus:ring-[#BB9E7F] text-sm font-medium placeholder-gray-300" 
                 />
              </div>
           </div>

           {/* Simple pagination arrows */}
           <div className="flex items-center gap-3">
              <button className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-50 disabled:opacity-30" disabled>
                 <ChevronLeftIcon className="w-5 h-5 text-gray-400" />
              </button>
              <button className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-50 hover:bg-gray-50 transition-all">
                 <ChevronRightIcon className="w-5 h-5 text-[#0F2843]" />
              </button>
           </div>
        </div>

        {/* Staff Table Section */}
        <div className="space-y-4">
           {/* Custom Table Header */}
           <div className="grid grid-cols-6 items-center bg-[#BB9E7F] px-8 py-5 rounded-2xl text-white font-black text-[13px] uppercase tracking-widest shadow-lg">
              <div>Name</div>
              <div className="text-center">Role</div>
              <div className="text-center">Course</div>
              <div className="text-center">Subject</div>
              <div className="text-center">Attendance</div>
              <div className="text-center">Class</div>
           </div>

           {/* Staff Rows List */}
           <div className="flex flex-col gap-4 min-h-[400px]">
              {staffData.length > 0 ? (
                staffData.map((staff, idx) => (
                  <div key={idx} className="grid grid-cols-6 items-center bg-white px-8 py-5 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-gray-50 hover:shadow-xl transition-all cursor-pointer group">
                     {/* Name Column with Avatar */}
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#BB9E7F]/30 group-hover:border-[#BB9E7F] transition-all">
                           <img src={staff.profile_picture} className="w-full h-full object-cover" alt={staff.name} />
                        </div>
                        <span className="font-black text-[#0F2843] text-sm">{staff.name}</span>
                     </div>
                     
                     {/* Data Columns */}
                     <div className="text-center text-gray-500 font-bold text-[13px]">{staff.role}</div>
                     <div className="text-center text-gray-900 font-black text-[13px] tracking-tight">{staff.course}</div>
                     <div className="text-center text-gray-500 font-bold text-[13px]">{staff.subject}</div>
                     <div className="text-center text-[#BB9E7F] font-black text-sm">{staff.attendance}</div>
                     <div className="text-center text-gray-900 font-black text-[13px]">{staff.class_id}</div>
                  </div>
                ))
              ) : (
                /* Awaiting Content Placeholder */
                <div className="flex-1 flex flex-col items-center justify-center bg-white/40 rounded-[32px] border-2 border-dashed border-gray-200 p-12">
                   <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                      <UserPlusIcon className="w-10 h-10 text-gray-300" />
                   </div>
                   <h3 className="text-2xl font-black text-gray-400 mb-2">Awaiting Info from Backend</h3>
                   <p className="text-gray-400 text-sm font-medium text-center max-w-sm leading-relaxed">
                      All system modules are ready. Data for names, roles, subjects, and classes will populate automatically once connected.
                   </p>
                </div>
              )}
           </div>
        </div>

        {/* Detailed Pagination Footer */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 py-6 border-t border-gray-100">
           {/* Page Numbers */}
           <div className="flex items-center gap-2">
              <button className="w-12 h-12 flex items-center justify-center rounded-xl bg-white shadow-sm hover:translate-y-[-2px] transition-all border border-gray-50">
                 <ChevronLeftIcon className="w-5 h-5 text-gray-400" />
              </button>
              
              {/* Dynamic Page Buttons based on visually defined states */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button 
                  key={page}
                  className={`w-12 h-12 rounded-xl font-black text-sm transition-all hover:translate-y-[-2px] ${
                    page === currentPage 
                      ? "bg-[#BB9E7F] text-white shadow-lg scale-105" 
                      : viewedPages.includes(page)
                        ? "bg-gray-100/80 text-gray-400 border border-gray-100"
                        : "bg-white text-gray-600 shadow-sm border border-gray-50 hover:border-[#BB9E7F]/30"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button className="w-12 h-12 flex items-center justify-center rounded-xl bg-white shadow-sm hover:translate-y-[-2px] transition-all border border-gray-50">
                 <ChevronRightIcon className="w-5 h-5 text-[#0F2843]" />
              </button>
           </div>

           {/* Rows per page selector */}
           <div className="flex items-center gap-4">
              <div className="bg-white px-5 py-3.5 rounded-2xl shadow-sm border border-gray-50 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-all group">
                 <span className="font-black text-[#0F2843] text-sm">5</span>
                 <ChevronDownIcon className="w-5 h-5 text-gray-300 group-hover:text-[#BB9E7F] transition-all" />
              </div>
              <span className="text-sm font-black text-gray-400 uppercase tracking-widest">/ page</span>
           </div>
        </div>

      </div>
    </StaffDashboardLayout>
  );
}
