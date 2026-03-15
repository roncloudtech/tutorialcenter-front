// pages/Admin/MasterClass/MasterClassList.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
import axios from "axios";
import StaffDashboardLayout from "../../components/private/staffs/DashboardLayout.jsx";
import CreateMasterClassModal from "../../components/private/staffs/MasterclassModal.jsx";
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
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

  // --- CLASS ROW ---
  const ClassRow = ({ cls }) => {
    const schedule = cls.schedules?.[0];
    return (
      <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors px-2 rounded-lg">
        {/* Yellow dot */}
        <span className="w-2.5 h-2.5 rounded-full bg-[#F5A623] flex-shrink-0" />

        {/* ME avatar */}
        <div className="w-10 h-10 rounded-full bg-[#0F2843] text-white text-xs font-black flex items-center justify-center flex-shrink-0 shadow-sm">
          ME
        </div>

        {/* Title */}
        <span className="text-sm font-bold text-[#1F2937] w-[180px] truncate flex-shrink-0">
          {cls.title}
        </span>

        {/* Instructor */}
        <span className="text-sm text-gray-600 w-[200px] truncate flex-shrink-0">
          {getStaffName(cls)}
        </span>

        {/* Date */}
        <span className="text-sm text-gray-500 w-[110px] flex-shrink-0">
          {formatDate(cls.start_date)}
        </span>

        {/* Time */}
        <span className="text-sm text-gray-500 w-[80px] flex-shrink-0">
          {schedule ? formatTime(schedule.start_time) : "—"}
        </span>

        {/* Link */}
        {cls.class_link ? (
          <a
            href={cls.class_link}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-sm text-blue-600 font-bold hover:underline truncate max-w-[80px]"
          >
            http...
          </a>
        ) : (
          <span className="text-sm text-gray-300 max-w-[80px]">—</span>
        )}
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
        {/* ========= Main Content ========= */}

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-2xl font-black text-[#09314F] tracking-tight">MASTER CLASS</h1>
            <div className="w-9 h-9 rounded-xl bg-[#0F2843] overflow-hidden shadow-md flex items-center justify-center">
              <Icon icon="mdi:bell" className="text-white w-5 h-5" />
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center gap-4 mb-8">
            {/* Search */}
            <div className="relative w-80">
              <MagnifyingGlassIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by date"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-5 pr-12 py-3 border border-gray-200 rounded-lg text-base font-medium focus:ring-2 focus:ring-[#09314F] focus:border-transparent bg-white"
              />
            </div>

            {/* Schedule Master Class */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-[#09314F] font-bold rounded-lg text-base hover:bg-gray-50 transition-all active:scale-95 whitespace-nowrap"
            >
              <PlusIcon className="w-5 h-5" />
              Schedule Master Class
            </button>

            {/* Requests */}
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-[#09314F] font-bold rounded-lg text-base hover:bg-gray-50 transition-all whitespace-nowrap">
              <Icon icon="mdi:bell-outline" className="w-5 h-5 text-[#E83831]" />
              Requests
              <span className="bg-[#E83831] text-white text-[10px] font-bold px-2 py-1 rounded-full leading-none">12</span>
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