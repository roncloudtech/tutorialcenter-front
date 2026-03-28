import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import DashboardLayout from "../../components/private/Students/DashboardLayout";
import { 
  BellIcon, 
  MagnifyingGlassIcon, 
  CalendarIcon, 
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
    next_class: null,
    today_classes: [],
    week_schedule: {},
    upcoming_sessions: [],
    older_sessions: []
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
        next_class: data.next_class || null,
        today_classes: Array.isArray(data.today_classes) ? data.today_classes : [],
        week_schedule: data.week_schedule || {},
        upcoming_sessions: Array.isArray(data.upcoming_sessions) ? data.upcoming_sessions : [],
        older_sessions: Array.isArray(data.older_sessions) ? data.older_sessions : []
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

  const groupedSessions = useMemo(() => {
    // Flatten week_schedule object into an array if it has date keys
    const weeklyArray = Object.values(scheduleData.week_schedule).flat();

    const groups = {
      today: scheduleData.today_classes,
      weekly: weeklyArray.length > 0 ? weeklyArray : scheduleData.upcoming_sessions,
      older: scheduleData.older_sessions
    };

    // Sort sections by date/time
    const sortByTime = (a, b) => (a.starts_at || "").localeCompare(b.starts_at || "");
    groups.today.sort(sortByTime);
    groups.weekly.sort((a,b) => (a.session_date || "").localeCompare(b.session_date || "") || sortByTime(a,b));
    groups.older.sort((a,b) => (b.session_date || "").localeCompare(a.session_date || "")); // Newest older first

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
  // Helper: find the staff member with role 'tutor', fallback to first staff
  const getTutor = (staffs) => {
    if (!staffs || staffs.length === 0) return null;
    return staffs.find(s => s.role?.toLowerCase() === 'tutor') || staffs[0];
  };

  const ClassRow = ({ session, isToday }) => {
    const status = isToday ? getSessionStatus(session) : null;
    const titleParts = (session.class?.title || "Master Class").split(' - ');
    const tutor = getTutor(session.class?.staffs);
    
    return (
      <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 items-center gap-y-6 lg:gap-3 xl:gap-4 bg-white px-8 py-6 rounded-[40px] border border-gray-50 shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all cursor-pointer group mb-10 lg:mb-6">
        {/* FLOATING AVATAR (Visible ONLY at exactly 1024px-1279px / lg) */}
        <div className="hidden lg:flex xl:hidden absolute -top-5 -left-5 w-16 h-16 bg-white rounded-2xl shadow-lg border border-gray-50 items-center justify-center z-20 transition-all group-hover:scale-110 group-hover:-rotate-3">
           <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-[#BB9E7F]/30 group-hover:border-[#BB9E7F] transition-all">
              {tutor?.profile_picture ? (
                <img 
                  src={`${API_BASE_URL}/storage/${tutor.profile_picture}`}
                  className="w-full h-full object-cover"
                  alt="Tutor"
                  onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=" + (tutor?.firstname || "T"); }}
                />
              ) : (
                <UserIcon className="w-8 h-8 text-gray-300 m-auto mt-2" />
              )}
           </div>
        </div>

        {/* Title Column (Responsive: Aligned to avatar edge at lg) */}
        <div className="flex items-center gap-4 col-span-1 lg:pl-3 xl:pl-0">
          {/* INTERNAL AVATAR (Visible on mobile and XL/Desktop) */}
          <div className="relative shrink-0 lg:hidden xl:flex">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-50 border-2 border-[#BB9E7F]/30 group-hover:border-[#BB9E7F] transition-all flex items-center justify-center">
              {tutor?.profile_picture ? (
                <img 
                  src={`${API_BASE_URL}/storage/${tutor.profile_picture}`}
                  className="w-full h-full object-cover"
                  alt="Tutor"
                  onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=" + (tutor?.firstname || "T"); }}
                />
              ) : (
                <UserIcon className="w-8 h-8 text-gray-300" />
              )}
            </div>
            {status === 'live' && <span className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 bg-[#22C55E] border-2 border-white rounded-full shadow-sm animate-pulse"></span>}
          </div>
          <div className="flex flex-col min-w-0">
            {/* Multi-line Title at lg breakpoint, single line otherwise and on XL */}
            <div className="lg:hidden xl:block">
              <span className="text-[15px] font-black text-[#0F2843] leading-tight uppercase truncate">
                {session.class?.title || "Master Class"}
              </span>
            </div>
            <div className="hidden lg:block xl:hidden">
              <div className="flex flex-col">
                <span className="text-[14px] font-black text-[#0F2843] leading-none uppercase">{titleParts[0]}</span>
                {titleParts[1] && (
                  <span className="text-[12px] font-bold text-[#BB9E7F]/80 mt-1 uppercase whitespace-nowrap italic underline underline-offset-2 decoration-dotted decoration-[#BB9E7F]/30">{titleParts[1]}</span>
                )}
              </div>
            </div>
            
            {isToday && (
              <div className="mt-1 flex flex-wrap gap-1.5">
                {status === 'live' ? (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100 italic">
                    <SignalIcon className="w-3.5 h-3.5 animate-pulse" /> LIVE
                  </span>
                ) : status === 'upcoming' ? (
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 italic">
                    UPCOMING
                  </span>
                ) : null}
              </div>
            )}
          </div>
        </div>
        
        {/* Instructor Column */}
        <div className="text-left sm:text-center">
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-1">
            <span className="lg:hidden xl:inline">Instructor</span>
            <span className="hidden lg:inline xl:hidden">Tutor</span>
          </span>
          <span className="text-[13px] font-black text-[#0F2843]">
            {tutor ? `${tutor.firstname} ${tutor.surname}` : "Expert Tutor"}
          </span>
        </div>

        {/* Link Column */}
        <div className="text-left lg:text-center">
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-1">{session.recording_link ? 'Recording' : 'Session Link'}</span>
          <a 
            href={session.recording_link || session.class_link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#3A5ECC] text-[13px] font-bold underline decoration-dotted underline-offset-4 hover:text-[#0F2843] transition-colors truncate block max-w-full lg:max-w-[150px] xl:max-w-[180px] mx-auto"
          >
            {session.recording_link || session.class_link || "Link Awaiting"}
          </a>
        </div>

        {/* Time Column */}
        <div className="text-left sm:text-center">
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-1">Schedule Time</span>
          <div className="flex items-center sm:justify-center gap-1.5 text-[#0F2843] font-black text-[14px]">
            <ClockIcon className="w-4 h-4 text-[#BB9E7F]" />
            <span>{formatTime(session.starts_at)} - {formatTime(session.ends_at)}</span>
          </div>
        </div>

        {/* Date Column */}
        <div className="text-left sm:text-center">
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-1 text-center">Date</span>
          <div className="flex items-center sm:justify-center gap-1.5 text-gray-600 font-black text-[14px]">
            <CalendarIcon className="w-4 h-4 text-[#BB9E7F]" />
            <span>{formatSessionDate(session.session_date)}</span>
          </div>
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

        {/* ========= Featured Next Class ========= */}
        {scheduleData.next_class && (
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-[12px] font-black text-[#E83831] uppercase tracking-[0.3em] pl-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-[#E83831] rounded-full animate-pulse"></span> NEXT UP
              </h2>
              <div className="h-[1px] flex-1 bg-red-100"></div>
            </div>
            
            <div className="bg-[#0F2843] rounded-[40px] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl group transition-all hover:translate-y-[-4px]">
              {/* Background Accents */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-20 -mt-20 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#BB9E7F]/10 rounded-full -ml-20 -mb-20 blur-2xl"></div>

              {/* === DEFAULT LAYOUT (Mobile + XL Desktop) === */}
              <div className="relative z-10 hidden max-lg:flex xl:flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                  <div className="w-24 h-24 rounded-3xl overflow-hidden bg-white/10 border border-white/20 p-1 backdrop-blur-md">
                    <div className="w-full h-full rounded-2xl overflow-hidden bg-gray-100">
                      {(() => { const t = getTutor(scheduleData.next_class.class?.staffs); return t?.profile_picture ? (
                        <img 
                          src={`${API_BASE_URL}/storage/${t.profile_picture}`}
                          className="w-full h-full object-cover"
                          alt="Tutor"
                        />
                      ) : (
                        <UserIcon className="w-10 h-10 text-gray-300 m-auto mt-6" />
                      ); })()}
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className="px-3 py-1 bg-[#E83831] text-white rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 inline-block">Recommended Session</span>
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2 leading-tight">
                      {scheduleData.next_class.class?.title || "Master Class Session"}
                    </h3>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-white/60 font-bold text-sm">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-[#BB9E7F]" />
                        <span>{(() => { const t = getTutor(scheduleData.next_class.class?.staffs); return t ? `${t.firstname} ${t.surname}` : "Expert Tutor"; })()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-[#BB9E7F]" />
                        <span>{formatTime(scheduleData.next_class.starts_at)} - {formatTime(scheduleData.next_class.ends_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-[#BB9E7F]" />
                        <span>{formatSessionDate(scheduleData.next_class.session_date)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center md:items-end gap-4 min-w-[200px]">
                   <div className="text-right flex flex-col items-center md:items-end">
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Live Meeting ID</span>
                      <span className="text-sm font-mono font-bold text-[#BB9E7F]">{(scheduleData.next_class.recording_link || scheduleData.next_class.class_link)?.split('/').pop() || "Awaiting..."}</span>
                   </div>
                   <a 
                     href={scheduleData.next_class.recording_link || scheduleData.next_class.class_link} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="px-10 py-5 bg-[#BB9E7F] text-[#0F2843] font-black rounded-2xl hover:bg-white transition-all shadow-xl shadow-black/20 group-hover:px-12 active:scale-95 uppercase tracking-widest text-xs"
                   >
                     Join Session
                   </a>
                </div>
              </div>

              {/* === 1024px LAYOUT (lg only) === */}
              <div className="relative z-10 hidden lg:flex xl:hidden items-start gap-6">
                {/* Far-Left: Recommended Badge (vertical) */}
                <div className="flex flex-col items-center gap-4 shrink-0">
                  <span className="px-3 py-1.5 bg-[#E83831] text-white rounded-full text-[9px] font-bold uppercase tracking-widest whitespace-nowrap">Recommended</span>
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/10 border border-white/20 p-1 backdrop-blur-md">
                    <div className="w-full h-full rounded-xl overflow-hidden bg-gray-100">
                      {(() => { const t = getTutor(scheduleData.next_class.class?.staffs); return t?.profile_picture ? (
                        <img 
                          src={`${API_BASE_URL}/storage/${t.profile_picture}`}
                          className="w-full h-full object-cover"
                          alt="Tutor"
                        />
                      ) : (
                        <UserIcon className="w-8 h-8 text-gray-300 m-auto mt-5" />
                      ); })()}
                    </div>
                  </div>
                </div>

                {/* Center: Class Info + Right: Button under Date */}
                <div className="flex-1 flex flex-col gap-3">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-tight">
                    {scheduleData.next_class.class?.title || "Master Class Session"}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-white/60 font-bold text-sm">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-[#BB9E7F]" />
                      <span>{(() => { const t = getTutor(scheduleData.next_class.class?.staffs); return t ? `${t.firstname} ${t.surname}` : "Expert Tutor"; })()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4 text-[#BB9E7F]" />
                      <span>{formatTime(scheduleData.next_class.starts_at)} - {formatTime(scheduleData.next_class.ends_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2 text-white/60 font-bold text-sm">
                      <CalendarIcon className="w-4 h-4 text-[#BB9E7F]" />
                      <span>{formatSessionDate(scheduleData.next_class.session_date)}</span>
                    </div>
                    <a 
                      href={scheduleData.next_class.recording_link || scheduleData.next_class.class_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-8 py-3 bg-[#BB9E7F] text-[#0F2843] font-black rounded-xl hover:bg-white transition-all shadow-xl shadow-black/20 active:scale-95 uppercase tracking-widest text-[10px]"
                    >
                      Join Session
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
