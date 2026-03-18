// pages/Admin/MasterClass/MasterClassList.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
import axios from "axios";
import StaffDashboardLayout from "../../components/private/staffs/DashboardLayout.jsx";
import CreateMasterClassModal from "../../components/private/staffs/MasterclassModal.jsx";
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  LinkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { Icon } from "@iconify/react";

export default function MasterClassList() {
  // const navigate = useNavigate();
  
  // --- STATE ---
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [copiedLink, setCopiedLink] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
  const token = localStorage.getItem("staff_token");

  // --- FETCHING LOGIC ---
  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/classes/all`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      
      console.table(response?.data?.classes); 
      
      const fetchedClasses = response?.data?.classes;
      
      if (Array.isArray(fetchedClasses)) {
        setClasses(fetchedClasses);
      } else {
        setClasses([]);
      }

    } catch (error) {
      console.error("Endpoint failed:", error.response?.status, error.response?.data);
      setClasses([]); 
      setToast({
        type: "error",
        message: "Failed to load classes."
      });
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  // Fetch classes on component mount
  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // --- GROUPING: Separate into Today and Older ---
  const todayClasses = useMemo(() => {
    if (!Array.isArray(classes)) return [];
    let list = classes;
    if (searchQuery) {
      list = list.filter(cls => {
        const titleMatch = cls.title?.toLowerCase().includes(searchQuery.toLowerCase());
        const descMatch = cls.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return titleMatch || descMatch;
      });
    }
    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return list.filter(cls =>
      cls.schedules?.some(schedule => schedule.day_of_week === dayOfWeek)
    );
  }, [classes, searchQuery]);

  const olderClasses = useMemo(() => {
    if (!Array.isArray(classes)) return [];
    let list = classes;
    if (searchQuery) {
      list = list.filter(cls => {
        const titleMatch = cls.title?.toLowerCase().includes(searchQuery.toLowerCase());
        const descMatch = cls.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return titleMatch || descMatch;
      });
    }
    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return list.filter(cls =>
      !cls.schedules?.some(schedule => schedule.day_of_week === dayOfWeek)
    );
  }, [classes, searchQuery]);

  // --- HELPERS ---
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "pm" : "am";
    const h12 = hour % 12 || 12;
    return `${h12}:${m}${ampm}`;
  };

  const getStaffName = (cls) => {
    const staff = cls.staffs?.[0];
    if (!staff) return "—";
    const s = staff.staff || staff;
    if (s.firstname && s.surname) return `${s.firstname} ${s.surname}`;
    return s.name || "—";
  };

  const copyToClipboard = (link, classId) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(classId);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // --- CLASS ROW ---
  const ClassRow = ({ cls }) => {
    const isLinkCopied = copiedLink === cls.id;
    const schedule = cls.schedules?.[0];
    const startTime = schedule ? formatTime(schedule.start_time) : "—";
    
    return (
      <div className="flex items-center gap-6 py-5 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-all px-4 rounded-xl group">
        
        {/* Avatar with Status Dot */}
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-full bg-[#E5E7EB] text-[#4B5563] text-xs font-black flex items-center justify-center shadow-inner border border-white">
            ME
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#F5A623] border-2 border-white rounded-full shadow-sm" />
        </div>

        {/* Info Columns */}
        <div className="flex-1 grid grid-cols-12 items-center gap-4">
          {/* Title */}
          <div className="col-span-3">
             <span className="text-[15px] font-bold text-[#1F2937] truncate block">
                {cls.title}
             </span>
          </div>

          {/* Instructor */}
          <div className="col-span-3">
             <span className="text-sm font-medium text-gray-500 truncate block">
                {getStaffName(cls)}
             </span>
          </div>

          {/* Date */}
          <div className="col-span-2">
             <span className="text-sm font-bold text-gray-600 block">
                {formatDate(cls.start_date)}
             </span>
          </div>

          {/* Time */}
          <div className="col-span-1 text-center">
             <span className="text-sm font-bold text-gray-600 block">
                {startTime}
             </span>
          </div>

          {/* Link */}
          <div className="col-span-3 text-right">
             {cls.class_link ? (
               <div className="flex items-center justify-end gap-2">
                 <a
                   href={cls.class_link}
                   target="_blank"
                   rel="noreferrer"
                   className="text-sm text-blue-500 font-bold hover:underline truncate max-w-[120px]"
                 >
                   {cls.class_link.replace(/^https?:\/\//, '')}
                 </a>
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     copyToClipboard(cls.class_link, cls.id);
                   }}
                   className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                 >
                   <Icon icon={isLinkCopied ? "mdi:check" : "mdi:content-copy"} className={`w-3.5 h-3.5 ${isLinkCopied ? "text-green-500" : "text-blue-400"}`} />
                 </button>
               </div>
             ) : (
               <span className="text-xs text-gray-300 italic">No link</span>
             )}
          </div>
        </div>
      </div>
    );
  };

  // --- RENDER ---
  return (
    <StaffDashboardLayout>
      {/* Toast */}
      {toast && (
        <div 
          className={`fixed top-5 right-5 z-50 px-6 py-4 rounded-2xl shadow-2xl text-white transition-all duration-500 ${
            toast.type === "success" ? "bg-[#76D287]" : "bg-[#E83831]"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-1 bg-white/20 rounded-full">
              <Icon icon={toast.type === "success" ? "mdi:check-circle" : "mdi:close-circle"} className="w-4 h-4" />
            </div>
            <p className="font-bold text-sm">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Create Class Modal */}
      {showCreateModal && (
        <CreateMasterClassModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchClasses();
            setToast({ type: "success", message: "Master class created successfully!" });
          }}
        />
      )}

      <div className="p-6 max-w-5xl mx-auto w-full">
        {/* ========= Header Section ========= */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-[#0F2843] tracking-tighter">MASTER CLASS</h1>
          <div className="relative group cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center transition-all hover:shadow-md">
              <Icon icon="mdi:bell" className="text-[#0F2843] w-6 h-6" />
              <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-[#E83831] border-2 border-white rounded-full" />
            </div>
          </div>
        </div>

        {/* ========= Controls Bar ========= */}
        <div className="flex flex-wrap items-center gap-4 mb-10">
          {/* Search */}
          <div className="relative flex-1 min-w-[280px]">
            <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by date"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 border border-gray-200 rounded-2xl text-[15px] font-bold text-[#1F2937] focus:ring-2 focus:ring-[#0F2843] focus:border-transparent bg-white shadow-sm transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Schedule Master Class */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-3 px-8 py-4 bg-[#E2E8F0] border border-transparent text-[#0F2843] font-black rounded-2xl text-[15px] hover:bg-[#CBD5E1] transition-all active:scale-95 whitespace-nowrap shadow-sm group"
          >
            <PlusIcon className="w-5 h-5 text-[#0F2843] group-hover:scale-110 transition-transform" />
            Schedule Master Class
          </button>

          {/* Requests */}
          <button className="flex items-center gap-3 px-8 py-4 bg-[#E2E8F0] border border-transparent text-[#0F2843] font-black rounded-2xl text-[15px] hover:bg-[#CBD5E1] transition-all whitespace-nowrap shadow-sm group">
            <Icon icon="mdi:swap-horizontal" className="w-5 h-5 text-[#0F2843] rotate-90" />
            Requests
            <span className="bg-[#E83831] text-white text-[11px] font-black px-2.5 py-1 rounded-full leading-none min-w-[24px] text-center shadow-sm">12</span>
          </button>
        </div>

          {/* Classes List */}
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#09314F] mx-auto" />
              <p className="mt-4 text-gray-600">Loading classes...</p>
            </div>
          ) : (todayClasses.length === 0 && olderClasses.length === 0) ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No classes found</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-6 py-3 bg-[#09314F] text-white font-bold rounded-xl hover:bg-opacity-90"
              >
                Create Your First Class
              </button>
            </div>
          ) : (
            <div>
              {/* Today Section */}
              {todayClasses.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-800 mb-3 px-2">Today</h3>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-1">
                    {todayClasses.map(cls => (
                      <ClassRow key={cls.id} cls={cls} />
                    ))}
                  </div>
                </div>
              )}

              {/* Older Section */}
              {olderClasses.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-3 px-2">Older</h3>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-1">
                    {olderClasses.map(cls => (
                      <ClassRow key={cls.id} cls={cls} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
      </div>
    </StaffDashboardLayout>
  );
}