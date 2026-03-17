import { useState, useEffect, useCallback } from "react";
import StaffDashboardLayout from "../../components/private/staffs/DashboardLayout.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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

export default function StaffManagement() {
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
  const token = localStorage.getItem("staff_token");

  // --- STATE ---
  const [staffs, setStaffs] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Statistics State
  const [stats, setStats] = useState([
    { 
      label: "Total Staffs", 
      value: 0, 
      subLabel: "+0 new", 
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
      subLabel: "+0 staffs", 
      icon: NoSymbolIcon, 
      color: "text-[#F59E0B]", 
      bg: "bg-orange-50/50",
      counterColor: "bg-white border-orange-100 text-[#F59E0B]"
    },
  ]);

  // --- DATA FETCHING ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [staffRes, classRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/staffs/all`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/api/admin/classes/all`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const fetchedStaffs = staffRes.data?.staffs || staffRes.data?.data || [];
      const fetchedClasses = classRes.data?.classes || classRes.data?.data || [];
      
      setStaffs(fetchedStaffs);
      setClasses(fetchedClasses);
      calculateStats(fetchedStaffs);
    } catch (error) {
      console.error("Failed to fetch staff management data", error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  const calculateStats = (allStaffs) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Total and New Staff (current month)
    const newStaffsThisMonth = allStaffs.filter(s => {
      if (!s.created_at) return false;
      const date = new Date(s.created_at);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    // Suspended logic: "brought but no id"
    const suspendedStaffs = allStaffs.filter(s => !s.id);
    const suspendedThisMonth = suspendedStaffs.filter(s => {
      if (!s.updated_at) return false;
      const date = new Date(s.updated_at);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    setStats(prev => [
      { ...prev[0], value: allStaffs.length, subLabel: `+${newStaffsThisMonth.length} new` },
      { ...prev[1], value: allStaffs.filter(s => s.status === 'active' || s.is_online).length }, // Fallback logic
      { ...prev[2], value: allStaffs.filter(s => s.status === 'inactive' || !s.is_online).length },
      { ...prev[3], value: suspendedStaffs.length, subLabel: `+${suspendedThisMonth.length} staffs` },
    ]);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- MERGE DATA FOR TABLE ---
  const tableData = staffs.map(staff => {
    // Find class where this staff is tutor or assistant
    const staffClass = classes.find(c => 
      c.tutor_id === staff.id || 
      (Array.isArray(c.assistant_ids) && c.assistant_ids.includes(staff.id))
    );

    return {
      ...staff,
      name: `${staff.firstname} ${staff.surname}`,
      profile_picture: staff.profile_picture || "https://ui-avatars.com/api/?name=" + staff.firstname,
      classRole: staffClass ? (staffClass.tutor_id === staff.id ? "Lead Tutor" : "Assistant") : "N/A",
      subject: staffClass?.title || "N/A",
      className: staffClass?.name || "No Class",
      location: staff.address || staff.location || "Online"
    };
  }).filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Pagination state (Mocked for now as per design)
  const [currentPage] = useState(1);
  const [totalPages] = useState(1);
  const [viewedPages] = useState([1]);

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
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
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
              <div className="text-center">ClassRole</div>
              <div className="text-center">Subject</div>
              <div className="text-center">Class</div>
              <div className="text-center">Location</div>
           </div>

           {/* Staff Rows List */}
           <div className="flex flex-col gap-4 min-h-[400px]">
              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-[#0F2843]/20 border-t-[#0F2843] rounded-full animate-spin"></div>
                </div>
              ) : tableData.length > 0 ? (
                tableData.map((staff, idx) => (
                  <div key={staff.id || idx} className="grid grid-cols-6 items-center bg-white px-8 py-5 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-gray-50 hover:shadow-xl transition-all cursor-pointer group animate-in fade-in slide-in-from-bottom-2">
                     {/* Name Column with Avatar */}
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#BB9E7F]/30 group-hover:border-[#BB9E7F] transition-all bg-gray-100 flex-shrink-0">
                           <img 
                             src={`${API_BASE_URL}/storage/${staff.profile_picture}`} 
                             onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=" + (staff.firstname || "User"); }}
                             className="w-full h-full object-cover" 
                             alt={staff.name} 
                           />
                        </div>
                        <span className="font-black text-[#0F2843] text-sm truncate">{staff.name}</span>
                     </div>
                     
                     {/* Data Columns */}
                     <div className="text-center text-gray-500 font-bold text-[13px] capitalize">{staff.role}</div>
                     <div className="text-center text-gray-900 font-black text-[13px] tracking-tight">{staff.classRole}</div>
                     <div className="text-center text-gray-500 font-bold text-[13px] truncate">{staff.subject}</div>
                     <div className="text-center text-[#BB9E7F] font-black text-sm">{staff.className}</div>
                     <div className="text-center text-gray-900 font-black text-[13px] truncate">{staff.location}</div>
                  </div>
                ))
              ) : (
                /* Awaiting Content Placeholder */
                <div className="flex-1 flex flex-col items-center justify-center bg-white/40 rounded-[32px] border-2 border-dashed border-gray-200 p-12">
                   <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                      <UserPlusIcon className="w-10 h-10 text-gray-300" />
                   </div>
                   <h3 className="text-2xl font-black text-gray-400 mb-2">No Staff Found</h3>
                   <p className="text-gray-400 text-sm font-medium text-center max-w-sm leading-relaxed">
                      {searchTerm ? `No staff matches "${searchTerm}". Try a different search.` : "No staff members are currently registered in the system."}
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
