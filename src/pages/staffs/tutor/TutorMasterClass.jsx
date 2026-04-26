import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import { 
  MagnifyingGlassIcon,
  CalendarIcon,
  LinkIcon,
  VideoCameraIcon
} from "@heroicons/react/24/outline";
import { Icon } from "@iconify/react";

export default function TutorMasterClass() {
  const [scheduleData, setScheduleData] = useState({
    next_class: null,
    today_classes: [],
    week_schedule: {},
    upcoming_sessions: []
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
  const staffName = localStorage.getItem("staff_name") || "Tutor";
  const staffRole = localStorage.getItem("staff_role") || "Tutor";
  const token = localStorage.getItem("staff_token");

  // --- FETCHING LOGIC ---
  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tutor/classes/schedule`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      
      console.log("Full Tiered API Response:", response.data);
      const data = response.data || {};
      
      setScheduleData({
        next_class: data.next_class || null,
        today_classes: Array.isArray(data.today_classes) ? data.today_classes : [],
        week_schedule: data.week_schedule || {},
        upcoming_sessions: Array.isArray(data.upcoming_sessions) ? data.upcoming_sessions : []
      });

    } catch (error) {
      console.error("Fetch error:", error);
      setToast({ type: "error", message: "Failed to load master class schedule." });
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

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

  const getInitials = (title) => {
    if (!title) return "ME";
    return title.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  };

  // --- SEARCH FILTERING ---
  const filteredData = useMemo(() => {
    if (!searchQuery) return scheduleData;
    
    const filterFn = (s) => (
      s.session_date?.includes(searchQuery) ||
      s.class?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return {
      next_class: scheduleData.next_class && filterFn(scheduleData.next_class) ? scheduleData.next_class : null,
      today_classes: scheduleData.today_classes.filter(filterFn),
      week_schedule: Object.entries(scheduleData.week_schedule).reduce((acc, [date, sessions]) => {
        const matching = sessions.filter(filterFn);
        if (matching.length > 0) acc[date] = matching;
        return acc;
      }, {}),
      upcoming_sessions: scheduleData.upcoming_sessions.filter(filterFn)
    };
  }, [scheduleData, searchQuery]);

  // --- ACTIONS ---
  const openModal = (session) => {
    setSelectedSession(session);
  };

  // --- UI COMPONENTS ---
  const SessionRow = ({ session, isNext = false }) => (
    <div 
      onClick={() => openModal(session)}
      className={`flex items-center gap-4 md:gap-8 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/80 transition-all px-4 rounded-xl cursor-pointer group ${isNext ? "bg-amber-50/50 hover:bg-amber-50" : ""}`}
    >
      <div className={`w-10 h-10 rounded-full text-[10px] font-black flex items-center justify-center border border-white shadow-sm shrink-0 ${isNext ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-600"}`}>
        {getInitials(session.class?.title)}
      </div>
      
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
           {isNext && <span className="text-[10px] font-black bg-amber-500 text-white px-1.5 py-0.5 rounded leading-none">NEXT</span>}
           <span className="text-[14px] font-bold text-[#374151] truncate" title={session.class?.title}>
             {session.class?.title || "Master Class"}
           </span>
        </div>
        <span className="text-[13px] font-medium text-slate-500 md:text-center">
          {formatDate(session.session_date)}
        </span>
        <span className="text-[13px] font-medium text-slate-500 md:text-center">
          {formatTime(session.starts_at)}
        </span>
        <div className="truncate text-right hidden md:block">
           {session.class_link ? (
             <span className="text-[13px] text-blue-400 font-medium underline underline-offset-4 decoration-dotted">
               {session.class_link.replace(/^https?:\/\//, '')}
             </span>
           ) : (
             <span className="text-xs text-slate-300 italic">No link</span>
           )}
        </div>
      </div>
    </div>
  );

  const Section = ({ title, sessions, isEmpty = false }) => {
    if (isEmpty || (Array.isArray(sessions) && sessions.length === 0)) return null;
    return (
      <div className="mb-10">
        <h3 className="text-[11px] font-black text-slate-400 mb-5 px-4 uppercase tracking-[0.25em]">{title}</h3>
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          {Array.isArray(sessions) ? (
            sessions.map(s => <SessionRow key={s.id} session={s} />)
          ) : (
             Object.entries(sessions).map(([date, dateSessions]) => (
                <div key={date}>
                  {dateSessions.map(s => <SessionRow key={s.id} session={s} />)}
                </div>
             ))
          )}
        </div>
      </div>
    );
  };

  return (
    <StaffDashboardLayout pagetitle="Master Class">
      {toast && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl text-white font-bold text-sm ${toast.type === "success" ? "bg-[#10B981]" : "bg-[#EF4444] animate-bounce"}`}>
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-4 hover:opacity-70">×</button>
        </div>
      )}

      <div className="p-6 max-w-[1600px] xl:px-10 mx-auto w-full min-h-screen">

        <div className="mb-10 max-w-sm">
          <div className="relative group">
            <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#0F2843] transition-colors" />
            <input
              type="text"
              placeholder="Search by date"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 border border-gray-200 rounded-[24px] text-[15px] font-bold text-[#1F2937] focus:ring-4 focus:ring-[#0F2843]/5 focus:border-[#0F2843] bg-white shadow-sm transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#0F2843] mx-auto" />
            <p className="mt-4 text-slate-400 font-bold">Refining your schedule...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Next Class - Special Focus */}
            {filteredData.next_class && (
              <div className="mb-12">
                <h3 className="text-[11px] font-black text-amber-500 mb-5 px-4 uppercase tracking-[0.25em]">Next Up</h3>
                <div className="bg-white rounded-[32px] border border-amber-100 shadow-lg shadow-amber-50 overflow-hidden ring-2 ring-amber-500/10">
                  <SessionRow session={filteredData.next_class} isNext={true} />
                </div>
              </div>
            )}

            <Section title="Today" sessions={filteredData.today_classes} />
            <Section title="This Week" sessions={filteredData.week_schedule} />
            <Section title="Upcoming" sessions={filteredData.upcoming_sessions} />

            {/* Empty State */}
            {!filteredData.next_class && 
             filteredData.today_classes.length === 0 && 
             Object.keys(filteredData.week_schedule).length === 0 && 
             filteredData.upcoming_sessions.length === 0 && (
              <div className="text-center py-24 bg-gray-50/50 rounded-[48px] border-2 border-dashed border-gray-200 mx-4">
                <Icon icon="mdi:calendar-blank" className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-slate-400 text-lg font-bold">Your agenda is clear.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedSession(null)} />
          <div className="relative bg-white rounded-[32px] p-8 md:p-10 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-[#0F2843] mb-8">Details</h2>
            
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-[15px] font-bold text-slate-700">
                  {staffRole} - {staffName}
                </p>
              </div>

              <div className="flex items-center gap-4 text-slate-600">
                <CalendarIcon className="w-5 h-5 shrink-0" />
                <span className="text-[14px] font-bold uppercase tracking-tight">
                  {new Date(selectedSession.session_date).toLocaleDateString("en-US", { weekday: 'short' })}, {formatDate(selectedSession.session_date)} / {formatTime(selectedSession.starts_at).toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-4 text-slate-600">
                <div className="w-5 h-5 bg-[#C5A97A] rounded shrink-0" />
                <span className="text-[14px] font-bold">
                  {selectedSession.class?.title}
                </span>
              </div>

              <div className="flex items-center gap-4 text-blue-500">
                <LinkIcon className="w-5 h-5 shrink-0" />
                <a 
                  href={selectedSession.class_link} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[14px] font-medium underline underline-offset-4 decoration-dotted truncate"
                >
                  {selectedSession.class_link || "No link assigned"}
                </a>
              </div>

              <div className="flex items-center gap-4">
                <VideoCameraIcon className="w-5 h-5 text-slate-400 shrink-0" />
                <div className="flex-1">
                  {selectedSession.recording_link ? (
                    <a 
                      href={selectedSession.recording_link} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-[14px] font-bold text-green-500 underline underline-offset-4 decoration-dotted truncate"
                    >
                      Watch Recording
                    </a>
                  ) : (
                    <span className="text-[14px] font-medium text-slate-300 italic">No recording available</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-10">
              <button 
                onClick={() => setSelectedSession(null)}
                className="w-full py-4 bg-[#0F2843] text-white font-bold rounded-2xl hover:bg-[#1a3d5c] transition-all active:scale-95 shadow-lg shadow-slate-200 uppercase text-[11px] tracking-widest"
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
