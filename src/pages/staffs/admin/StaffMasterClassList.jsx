// pages/Admin/MasterClass/MasterClassList.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
import axios from "axios";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import CreateMasterClassModal from "../../../components/private/staffs/AdminMasterclassModal.jsx";
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  // LinkIcon,
  // CheckIcon,
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
  const [selectedClassDetail, setSelectedClassDetail] = useState(null);

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
    
    let link = cls.class_link;
    if (!link && cls.schedules && cls.schedules.length > 0) {
       for (let sched of cls.schedules) {
          if (sched.sessions && sched.sessions.length > 0) {
             const found = sched.sessions.find(s => s.class_link);
             if (found) { link = found.class_link; break; }
          }
       }
    }

    return (
      <div 
        onDoubleClick={() => setSelectedClassDetail(cls)}
        className="flex items-center gap-6 py-5 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-all px-4 rounded-xl group cursor-pointer select-none"
      >
        
        {/* Avatar with Status Dot */}
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-full bg-[#E5E7EB] text-[#4B5563] text-xs font-black flex items-center justify-center shadow-inner border border-white">
            ME
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#F5A623] border-2 border-white rounded-full shadow-sm" />
        </div>

        {/* Info Columns */}
        <div className="flex-1 flex flex-row items-center justify-between gap-3 overflow-hidden">
          {/* Title - Takes priority space */}
          <div className="flex-[2] min-w-0">
             <span className="text-[15px] font-bold text-[#1F2937] truncate block" title={cls.title}>
                {cls.title}
             </span>
          </div>

          {/* Instructor - Flexible but secondary */}
          <div className="flex-[1.5] min-w-0 hidden sm:block">
             <span className="text-sm font-medium text-gray-400 truncate block" title={getStaffName(cls)}>
                {getStaffName(cls)}
             </span>
          </div>

          {/* Created At & Date & Time - Compact group */}
          <div className="flex-shrink-0 flex items-center gap-4 text-center">
            <div className="flex flex-col items-center min-w-[80px] hidden lg:flex">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Created At</span>
              <span className="text-[11px] font-black text-[#0F2843] whitespace-nowrap">
                {formatDate(cls.created_at)}
              </span>
            </div>
            <div className="w-[1px] h-6 bg-gray-100 hidden lg:block" />
            <span className="text-sm font-bold text-gray-600 whitespace-nowrap hidden md:block">
              {formatDate(cls.start_date)}
            </span>
            <span className="text-sm font-bold text-[#0F2843] whitespace-nowrap min-w-[65px]">
              {startTime}
            </span>
          </div>

          {/* Link - Right aligned and compact */}
          <div className="flex-shrink-0 min-w-0 flex justify-end">
             {link ? (
               <div className="flex items-center gap-2">
                 <a
                   href={link}
                   target="_blank"
                   rel="noreferrer"
                   className="text-sm text-blue-500 font-bold hover:underline truncate max-w-[100px] lg:max-w-[150px]"
                 >
                   {link.replace(/^https?:\/\//, '')}
                 </a>
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     copyToClipboard(link, cls.id);
                   }}
                   className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
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
      
      {/* Detail Modal */}
      {selectedClassDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#0F2843]/40 backdrop-blur-sm" 
            onClick={() => setSelectedClassDetail(null)} 
          />
          <div className="relative bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="bg-[#0F2843] p-10 text-white relative">
              <button 
                onClick={() => setSelectedClassDetail(null)}
                className="absolute top-8 right-8 p-3 hover:bg-white/10 rounded-2xl transition-all"
              >
                <Icon icon="mdi:close" className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-6 mb-4">
                <div className="w-16 h-16 rounded-3xl bg-[#76D287] flex items-center justify-center text-white text-2xl font-black shadow-lg">
                  {selectedClassDetail.title?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">{selectedClassDetail.title}</h2>
                  <p className="text-white/60 text-sm font-bold mt-2 uppercase tracking-widest">Master Class Details</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Left Column */}
                <div className="space-y-8">
                  <div>
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Instructor / Admin</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[#0F2843] font-black text-xs">
                        {getStaffName(selectedClassDetail)[0]}
                      </div>
                      <p className="text-[17px] font-black text-[#0F2843]">{getStaffName(selectedClassDetail)}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Created On</h4>
                    <div className="flex items-center gap-3 text-[#0F2843]">
                      <Icon icon="mdi:calendar-clock" className="w-5 h-5 opacity-40" />
                      <p className="text-[15px] font-bold">{formatDate(selectedClassDetail.created_at)}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Description</h4>
                    <p className="text-gray-500 text-sm leading-relaxed font-medium">
                      {selectedClassDetail.description || "No description provided for this master class."}
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  <div>
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Schedule Info</h4>
                    <div className="bg-gray-50 rounded-3xl p-6 space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                        <span className="text-xs font-bold text-gray-400">Start Date</span>
                        <span className="text-xs font-black text-[#0F2843]">{formatDate(selectedClassDetail.start_date)}</span>
                      </div>
                      {selectedClassDetail.schedules?.map((s, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2">
                          <span className="text-xs font-bold text-gray-400 capitalize">{s.day_of_week}s</span>
                          <span className="text-xs font-black text-[#76D287]">{formatTime(s.start_time)} - {formatTime(s.end_time)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Quick Links</h4>
                    <div className="space-y-3">
                      {selectedClassDetail.class_link && (
                        <a 
                          href={selectedClassDetail.class_link} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-2xl transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <Icon icon="mdi:link-variant" className="w-5 h-5 text-blue-500" />
                            <span className="text-xs font-black text-blue-600">Join Class</span>
                          </div>
                          <Icon icon="mdi:arrow-right" className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform" />
                        </a>
                      )}
                      {selectedClassDetail.recording_link && (
                        <a 
                          href={selectedClassDetail.recording_link} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-2xl transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <Icon icon="mdi:video" className="w-5 h-5 text-green-500" />
                            <span className="text-xs font-black text-green-600">Watch Recording</span>
                          </div>
                          <Icon icon="mdi:arrow-right" className="w-4 h-4 text-green-500 group-hover:translate-x-1 transition-transform" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-10 bg-gray-50 flex items-center justify-end gap-4">
              <button 
                onClick={() => setSelectedClassDetail(null)}
                className="px-10 py-4 bg-white border border-gray-200 text-gray-500 font-black rounded-2xl text-[13px] uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95 shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </StaffDashboardLayout>
  );
}