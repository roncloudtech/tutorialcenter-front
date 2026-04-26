import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import { Icon } from "@iconify/react";
import { 
  UserGroupIcon, 
  HandThumbUpIcon, 
  UserMinusIcon,
  // BellIcon,
  ClockIcon,
  VideoCameraIcon
} from "@heroicons/react/24/outline";

export default function TutorDashboard() {
  const [scheduleData, setScheduleData] = useState({
    next_class: null,
    today_classes: [],
    week_schedule: {},
    upcoming_sessions: []
  });
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
  const token = localStorage.getItem("staff_token");

  // --- FETCHING LOGIC ---
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tutor/classes/schedule`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      
      const data = response.data || {};
      setScheduleData({
        next_class: data.next_class || null,
        today_classes: Array.isArray(data.today_classes) ? data.today_classes : [],
        week_schedule: data.week_schedule || {},
        upcoming_sessions: Array.isArray(data.upcoming_sessions) ? data.upcoming_sessions : []
      });

    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // --- HELPERS ---
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const formatTimeStr = (timeStr) => {
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

  const stats = [
    { 
      label: "Total Students", 
      value: "42", 
      sub: "Students currently in your roster", 
      badge: "+2 this month",
      icon: <UserGroupIcon className="w-6 h-6 text-[#09314F]" />,
      color: "blue"
    },
    { 
      label: "Active Students", 
      value: "38", 
      sub: "Active in lesson this week", 
      badge: "90% Engagement",
      icon: <HandThumbUpIcon className="w-6 h-6 text-[#76D287]" />,
      color: "green"
    },
    { 
      label: "Inactive Students", 
      value: "4", 
      sub: "Paused or finished modules", 
      badge: "-2 this month",
      icon: <UserMinusIcon className="w-6 h-6 text-[#E83831]" />,
      color: "red"
    }
  ];

  return (
    <StaffDashboardLayout pagetitle="Dashboard">
      <div className="p-6 max-w-6xl mx-auto w-full min-h-screen pb-20">

        {/* Announcement Bar */}
        <div className="bg-white border border-gray-100 rounded-[24px] p-2 mb-10 shadow-sm">
           <div className="bg-slate-50/80 rounded-[20px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                 <p className="text-sm font-bold text-slate-600">
                   {scheduleData.next_class ? `Your next session: ${scheduleData.next_class.class?.title}` : "No upcoming sessions for today."}
                 </p>
              </div>
              {scheduleData.next_class && (
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                  {formatTimeStr(scheduleData.next_class.starts_at)}
                </span>
              )}
           </div>
        </div>

        {/* Progress Level Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4 px-2">
            <Icon icon="mdi:chart-line" className="text-[#0F2843] w-5 h-5" />
            <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Activity Level</h2>
          </div>
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
            <div className="flex justify-between text-[10px] font-black text-slate-400 mb-3 uppercase tracking-wider">
              <span>Start</span>
              <span className="text-[#09314F]">Current Progress (8%)</span>
              <span>Goal</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-[#09314F] relative transition-all duration-1000" style={{ width: '8%' }}>
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/20" />
               </div>
            </div>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-7 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-8">
                <div className={`p-4 rounded-2xl transition-colors ${
                  stat.color === 'blue' ? 'bg-blue-50 group-hover:bg-blue-100' : 
                  stat.color === 'green' ? 'bg-green-50 group-hover:bg-green-100' : 'bg-red-50 group-hover:bg-red-100'
                }`}>
                  {stat.icon}
                </div>
                <div className="px-3.5 py-1.5 rounded-full border border-gray-100 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                  {stat.badge}
                </div>
              </div>
              <h4 className="text-[13px] font-bold text-slate-400 mb-1">{stat.label}</h4>
              <div className={`text-4xl font-black mb-3 tracking-tighter ${
                stat.color === 'blue' ? 'text-[#09314F]' : 
                stat.color === 'green' ? 'text-[#10B981]' : 'text-[#EF4444]'
              }`}>
                {stat.value}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Assigned Classes Section */}
        <div>
          <div className="flex items-center justify-between mb-8 px-2">
             <div className="flex items-center gap-3">
               <Icon icon="mdi:book-open-variant" className="text-[#0F2843] w-6 h-6" />
               <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Agenda</h2>
             </div>
             <a href="/staffs/tutor/master-class" className="text-[11px] font-black text-[#0F2843] hover:text-[#2563EB] transition-colors uppercase tracking-widest">
               See All Schedule
             </a>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-[180px] bg-slate-50 animate-pulse rounded-[32px] border border-slate-100" />
                ))
             ) : (
               <>
                {/* Next Class - Prominent Card */}
                {scheduleData.next_class && (
                  <div className="group relative bg-white p-6 rounded-[32px] border-2 border-[#10B981] shadow-lg shadow-green-50/50 flex flex-col justify-between overflow-hidden">
                    <div className="absolute -top-3 left-8 bg-[#10B981] text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.15em] shadow-sm">
                      Next Class
                    </div>
                    
                    <div className="mt-4 flex items-center gap-5">
                       <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-[20px] flex items-center justify-center font-black text-lg border border-emerald-100">
                          {getInitials(scheduleData.next_class.class?.title)}
                       </div>
                       <div className="min-w-0">
                          <h4 className="font-black text-[#0F2843] text-[15px] truncate leading-tight mb-1" title={scheduleData.next_class.class?.title}>
                            {scheduleData.next_class.class?.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
                            {formatDate(scheduleData.next_class.session_date)}
                          </p>
                       </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-50">
                       <div className="flex items-center gap-2">
                          <ClockIcon className="w-4 h-4 text-emerald-500" />
                          <span className="text-[11px] font-black text-emerald-600 uppercase tracking-tight">
                            {formatTimeStr(scheduleData.next_class.starts_at)}
                          </span>
                       </div>
                       {scheduleData.next_class.class_link ? (
                         <a 
                           href={scheduleData.next_class.class_link}
                           target="_blank"
                           rel="noreferrer"
                           className="bg-[#0F2843] text-white text-[10px] font-black px-5 py-2.5 rounded-xl hover:bg-[#E83831] transition-all active:scale-95 shadow-lg shadow-slate-200 uppercase tracking-widest"
                         >
                            Join Now
                         </a>
                       ) : (
                         <span className="text-[10px] font-black text-slate-300 uppercase italic">Awaiting Link</span>
                       )}
                    </div>
                  </div>
                )}

                {/* Today's Other Classes */}
                {scheduleData.today_classes
                  .filter(s => s.id !== scheduleData.next_class?.id)
                  .slice(0, 2) // Limit for dashboard
                  .map(session => (
                    <div key={session.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                       <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-[18px] flex items-center justify-center font-black text-sm border border-slate-100">
                             {getInitials(session.class?.title)}
                          </div>
                          <div className="min-w-0">
                             <h4 className="font-bold text-[#0F2843] text-[14px] truncate" title={session.class?.title}>
                               {session.class?.title}
                             </h4>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Today</p>
                          </div>
                       </div>
                       <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                          <div className="flex items-center gap-2 text-slate-500">
                             <ClockIcon className="w-4 h-4" />
                             <span className="text-[11px] font-bold">
                               {formatTimeStr(session.starts_at)}
                             </span>
                          </div>
                          <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0">
                             <VideoCameraIcon className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                  ))
                }

                {/* Empty State / Add Placeholder */}
                {(!scheduleData.next_class && scheduleData.today_classes.length === 0) && (
                   <div className="bg-slate-50/50 border-2 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center justify-center p-8 text-center min-h-[160px]">
                      <div className="w-12 h-12 rounded-full bg-white border border-slate-100 flex items-center justify-center mb-4">
                         <Icon icon="mdi:calendar-check" className="text-slate-200 w-6 h-6" />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] max-w-[140px]">Agenda is clear for today</p>
                   </div>
                )}
               </>
             )}
          </div>
        </div>

      </div>
    </StaffDashboardLayout>
  );
}
