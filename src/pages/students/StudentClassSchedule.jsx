import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import DashboardLayout from "../../components/private/students/DashboardLayout";
import { 
  BellIcon, 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon,
  CalendarIcon,
  VideoCameraIcon,
  ClockIcon,
  UserIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SignalIcon
} from "@heroicons/react/24/outline";

export default function StudentClassSchedule() {
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
  const authToken = localStorage.getItem("student_token");

  // --- STATE ---
  const [scheduleData, setScheduleData] = useState({
    today_classes: [],
    week_schedule: [],
    upcoming_sessions: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Collapse States
  const [isWeeklyOpen, setIsWeeklyOpen] = useState(true);
  const [isOlderOpen, setIsOlderOpen] = useState(false);

  /* =============================
     FETCH STUDENT SCHEDULE
  ============================= */
  const fetchStudentSchedule = useCallback(async () => {
    if (!authToken) {
      console.warn("DEBUG: No student_token found in localStorage!");
      return;
    }
    
    setLoading(true);
    try {
      console.group("DEBUG: Student Class Schedule Fetching");
      const res = await axios.get(`${API_BASE_URL}/api/students/class/schedule`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: "application/json",
        },
      });

      const data = res.data?.data || res.data;
      setScheduleData({
        today_classes: Array.isArray(data.today_classes) ? data.today_classes : [],
        week_schedule: Array.isArray(data.week_schedule) ? data.week_schedule : [],
        upcoming_sessions: Array.isArray(data.upcoming_sessions) ? data.upcoming_sessions : []
      });
      console.log("Fetched Data:", data);
      console.groupEnd();
    } catch (err) {
      console.error("DEBUG: Failed to fetch student schedule", err);
      setError(err.response?.data?.message || "Unable to load schedule at the moment.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, authToken]);

  useEffect(() => {
    fetchStudentSchedule();
  }, [fetchStudentSchedule]);

  /* =============================
     DATA RE-GROUPING LOGIC
  ============================= */
  const groupedSessions = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    // Combine all sessions from API
    const combined = [
      ...scheduleData.today_classes,
      ...scheduleData.week_schedule,
      ...scheduleData.upcoming_sessions
    ];

    // Remove duplicates by session ID
    const uniqueMap = new Map();
    combined.forEach(s => {
      if (!uniqueMap.has(s.id)) uniqueMap.set(s.id, s);
    });
    const all = Array.from(uniqueMap.values());

    const groups = {
      today: [],
      weekly: [],
      older: []
    };

    all.forEach(session => {
      const sessionDate = session.session_date.split('T')[0];
      const sDate = new Date(session.session_date);
      
      // Categorize
      if (sessionDate === todayStr) {
        groups.today.push(session);
      } else if (sDate > now && (sDate.getTime() - now.getTime()) < (7 * 24 * 60 * 60 * 1000)) {
        groups.weekly.push(session);
      } else if (sDate < now && sessionDate !== todayStr) {
        groups.older.push(session);
      }
    });

    // Sort sections by date/time
    const sortByTime = (a, b) => a.starts_at.localeCompare(b.starts_at);
    groups.today.sort(sortByTime);
    groups.weekly.sort((a,b) => a.session_date.localeCompare(b.session_date) || sortByTime(a,b));
    groups.older.sort((a,b) => b.session_date.localeCompare(a.session_date)); // Newest older first

    return groups;
  }, [scheduleData]);

  /* =============================
     HELPERS
  ============================= */
  const getSessionStatus = (session) => {
    const now = new Date();
    const [startH, startM] = session.starts_at.split(':');
    const [endH, endM] = session.ends_at.split(':');
    
    const startTime = new Date();
    startTime.setHours(parseInt(startH), parseInt(startM), 0);
    
    const endTime = new Date();
    endTime.setHours(parseInt(endH), parseInt(endM), 0);

    if (now >= startTime && now <= endTime) return 'live';
    if (now < startTime) return 'upcoming';
    return 'completed';
  };

  const formatSessionDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: "long", month: "short", day: "numeric", year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "N/A";
    const [hour, minute] = time.split(":");
    const date = new Date();
    date.setHours(hour, minute);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  /* =============================
     UI COMPONENTS
  ============================= */
  const ClassRow = ({ session, isToday }) => {
    const status = isToday ? getSessionStatus(session) : null;
    
    return (
      <div className="grid grid-cols-5 items-center bg-white px-8 py-6 rounded-3xl border border-gray-50 shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all cursor-pointer group mb-4">
        {/* Title Column */}
        <div className="flex items-center gap-4 col-span-1">
          <div className="relative">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-50 border-2 border-[#BB9E7F]/30 group-hover:border-[#BB9E7F] transition-all flex items-center justify-center">
              {session.class?.staffs?.[0]?.profile_picture ? (
                <img 
                  src={`${API_BASE_URL}/storage/${session.class.staffs[0].profile_picture}`}
                  className="w-full h-full object-cover"
                  alt="Instructor"
                  onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=" + (session.class?.staffs?.[0]?.firstname || "T"); }}
                />
              ) : (
                <UserIcon className="w-6 h-6 text-gray-300" />
              )}
            </div>
            {status === 'live' && <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#22C55E] border-2 border-white rounded-full shadow-sm animate-pulse"></span>}
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-black text-[#0F2843] leading-tight uppercase truncate max-w-[150px]">
              {session.class?.title || "Master Class"}
            </span>
            {isToday && (
              <div className="mt-1">
                {status === 'live' ? (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100">
                    <SignalIcon className="w-3 h-3 animate-pulse" /> LIVE NOW
                  </span>
                ) : status === 'upcoming' ? (
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                    UPCOMING
                  </span>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Instructor Column */}
        <div className="text-center">
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-1">Instructor</span>
          <span className="text-[13px] font-black text-[#0F2843]">
            {session.class?.staffs?.[0] ? `${session.class.staffs[0].firstname} ${session.class.staffs[0].surname}` : "N/A"}
          </span>
        </div>

        {/* Link Column */}
        <div className="text-center">
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-1">Session Link</span>
          <a 
            href={session.class_link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#3A5ECC] text-[13px] font-bold underline decoration-dotted underline-offset-4 hover:text-[#0F2843] transition-colors truncate block max-w-[160px] mx-auto"
          >
            {session.class_link || "Link Awaiting"}
          </a>
        </div>

        {/* Time Column */}
        <div className="text-center">
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-1">Schedule Time</span>
          <div className="flex items-center justify-center gap-1.5 text-[#0F2843] font-black text-[13px]">
            <ClockIcon className="w-4 h-4 text-[#BB9E7F]" />
            <span>{formatTime(session.starts_at)} - {formatTime(session.ends_at)}</span>
          </div>
        </div>

        {/* Date Column */}
        <div className="text-center">
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-1">Date</span>
          <span className="text-[13px] font-black text-gray-600">
            {formatSessionDate(session.session_date)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout pagetitle="Class Schedule" hideHeader={true}>
      <div className="p-6 max-w-5xl mx-auto w-full min-h-screen">
        
        {/* ========= Header Section ========= */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-[42px] font-black text-[#0F2843] tracking-tighter leading-none italic uppercase">
            MASTER <span className="text-[#BB9E7F] not-italic">CLASS</span>
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="relative p-3 bg-white rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 transition-all">
              <BellIcon className="w-7 h-7 text-[#0F2843]" />
              <span className="absolute top-3.5 right-3.5 w-3 h-3 bg-[#E83831] rounded-full border-2 border-white shadow-sm"></span>
            </div>
          </div>
        </div>

        {/* ========= Controls Bar ========= */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-10">
          <div className="relative flex-1 group">
            <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-[#BB9E7F] transition-colors" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search master classes..." 
              className="w-full pl-16 pr-8 py-5 bg-white rounded-[32px] border-none shadow-[0_10px_35px_rgba(0,0,0,0.03)] focus:ring-4 focus:ring-[#BB9E7F]/10 text-[15px] font-bold text-[#0F2843] placeholder-gray-300 transition-all"
            />
          </div>
        </div>

        {/* ========= Classes List ========= */}
        <div className="space-y-12">
          
          {/* Today Section (Non-collapsable) */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-[12px] font-black text-[#BB9E7F] uppercase tracking-[0.3em] pl-2">TODAY'S CLASSES</h2>
              <div className="h-[1px] flex-1 bg-gray-100"></div>
            </div>
            
            <div className="flex flex-col">
              {groupedSessions.today.length > 0 ? (
                groupedSessions.today.map(session => (
                  <ClassRow key={session.id} session={session} isToday={true} />
                ))
              ) : (
                <div className="p-12 text-center bg-gray-50/30 rounded-[40px] border border-gray-100">
                  <p className="font-bold text-gray-400 text-sm">No classes scheduled for today</p>
                </div>
              )}
            </div>
          </div>

          {/* Weekly Section (Collapsable) */}
          <div>
            <div 
              className="flex items-center gap-4 mb-6 cursor-pointer group/header"
              onClick={() => setIsWeeklyOpen(!isWeeklyOpen)}
            >
              <h2 className="text-[12px] font-black text-[#BB9E7F] uppercase tracking-[0.3em] pl-2">WEEKLY SCHEDULE</h2>
              <div className="h-[1px] flex-1 bg-gray-100 group-hover/header:bg-[#BB9E7F]/30 transition-all"></div>
              {isWeeklyOpen ? <ChevronUpIcon className="w-4 h-4 text-gray-400" /> : <ChevronDownIcon className="w-4 h-4 text-gray-400" />}
            </div>
            
            {isWeeklyOpen && (
              <div className="flex flex-col animate-in fade-in slide-in-from-top-2 duration-300">
                {groupedSessions.weekly.length > 0 ? (
                  groupedSessions.weekly.map(session => (
                    <ClassRow key={session.id} session={session} isToday={false} />
                  ))
                ) : (
                  <div className="p-10 text-center bg-gray-50/20 rounded-[30px] border border-dashed border-gray-100">
                    <p className="font-bold text-gray-400 text-xs italic">No other sessions scheduled for this week</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Older Section (Collapsable) */}
          <div>
            <div 
              className="flex items-center gap-4 mb-6 cursor-pointer group/header"
              onClick={() => setIsOlderOpen(!isOlderOpen)}
            >
              <h2 className="text-[12px] font-black text-[#BB9E7F] uppercase tracking-[0.3em] pl-2">OLDER CLASSES</h2>
              <div className="h-[1px] flex-1 bg-gray-100 group-hover/header:bg-[#BB9E7F]/30 transition-all"></div>
              {isOlderOpen ? <ChevronUpIcon className="w-4 h-4 text-gray-400" /> : <ChevronDownIcon className="w-4 h-4 text-gray-400" />}
            </div>
            
            {isOlderOpen && (
              <div className="flex flex-col animate-in fade-in slide-in-from-top-2 duration-300">
                {groupedSessions.older.length > 0 ? (
                  groupedSessions.older.map(session => (
                    <ClassRow key={session.id} session={session} isToday={false} />
                  ))
                ) : (
                  <div className="p-10 text-center bg-gray-50/20 rounded-[30px] border border-dashed border-gray-100">
                    <p className="font-bold text-gray-400 text-xs italic">No older sessions found</p>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Loading State */}
        {loading && (
          <div className="fixed bottom-10 right-10 z-[100] bg-[#0F2843] text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-4">
             <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
             <span className="text-sm font-black uppercase tracking-widest italic">Syncing Class Schedule...</span>
          </div>
        )}

        {error && (
          <div className="mt-12 p-10 bg-red-50 rounded-[40px] border-2 border-dashed border-red-100 text-center">
            <h3 className="text-red-600 font-bold mb-2 uppercase tracking-widest text-sm">Data Link Interrupted</h3>
            <p className="text-red-400 text-xs font-bold">{error}</p>
            <button 
              onClick={fetchStudentSchedule}
              className="mt-6 px-10 py-3.5 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all text-xs uppercase tracking-widest active:scale-95 shadow-lg shadow-red-200"
            >
              Force Reconnect
            </button>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}