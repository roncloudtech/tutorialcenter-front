import { useState } from "react";
import { Icon } from "@iconify/react";

export default function ProgressCard({ title, end_date, subjects = [] }) {
  const [open, setOpen] = useState(false);

  // Average progress for course progress bar
  const avgProgress =
    subjects.length > 0
      ? subjects.reduce((sum, s) => sum + (s.progress || 0), 0) /
        subjects.length
      : 0;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return (
    <div className="flex flex-col gap-2 mb-6">
      
      {/* MAIN PARENT CONTAINER */}
      <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-[#09314F]/50 p-5 transition-all">
        
        {/* Top Section: Icon, Title, Chevron */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Icon icon="game-icons:progression" className="w-6 h-6 text-[#09314F] dark:text-blue-300" />
            <h3 className="text-[17px] font-black text-[#09314F] dark:text-white uppercase tracking-tight">{title || "Course"}</h3>
          </div>
          <button 
            onClick={() => setOpen(!open)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all"
          >
            <Icon 
              icon="lucide:chevron-down" 
              className={`w-5 h-5 text-[#09314F] dark:text-white transition-transform duration-300 ${open ? 'rotate-180' : ''}`} 
            />
          </button>
        </div>

        {/* Info Row: Subjects Count & Exp Date */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#09314F] dark:text-gray-300">Subjects</span>
            <span className="text-sm font-black text-[#09314F] dark:text-white ml-2">{subjects.length}</span>
          </div>
          <div className="flex items-center gap-1">
             <span className="text-sm font-bold text-[#09314F] dark:text-gray-300">Exp Date -</span>
             <span className="text-sm font-black text-[#09314F] dark:text-white">{formatDate(end_date)}</span>
          </div>
        </div>

        {/* Global Progress Bar with Start/Finish labels */}
        <div className="relative mt-2">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-[#09314F] dark:text-gray-400 uppercase tracking-tighter">Start</span>
            <span className="text-[10px] font-bold text-[#09314F] dark:text-gray-400 uppercase tracking-tighter">Finish</span>
          </div>
          <div className="h-2.5 bg-gray-200/60 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
            <div 
              className="bg-[#09314F] dark:bg-blue-400 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${avgProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* DETACHED SUB-CONTAINERS for subjects */}
      <div 
        className={`flex flex-col gap-2 transition-all duration-300 origin-top ${
          open ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none h-0 overflow-hidden"
        }`}
      >
        {subjects.map((sub, idx) => (
          <div 
            key={sub.id || idx}
            className="bg-white dark:bg-[#09314F]/60 border border-gray-100 dark:border-[#1a4a75] rounded-xl p-3 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-center justify-between mx-4"
          >
            <span className="text-[13px] font-bold text-[#09314F] dark:text-gray-200">{sub.name}</span>
            <div className="flex items-center gap-3 w-1/2">
              <div className="flex-1 h-2.5 bg-gray-200/50 dark:bg-gray-800 rounded-full overflow-hidden relative">
                 <div 
                  className="bg-[#09314F] dark:bg-blue-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${sub.progress || 0}%` }}
                 />
                 <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-white mix-blend-difference">
                   {Math.round(sub.progress || 0)}%
                 </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}