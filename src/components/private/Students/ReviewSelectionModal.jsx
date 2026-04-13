import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function ReviewSelectionModal({ 
  isOpen, 
  onClose, 
  selectedCourses, 
  selectedSubjects, 
  subjectsByCourse,
  onEdit, 
  onContinue 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#09314F99] backdrop-blur-sm flex items-center justify-center z-[105] p-6 animate-fadeIn">
      <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl p-8 md:p-10 border border-white/20 flex flex-col max-h-[90vh]">
        
        {/* HEADER: Stays fixed at the top */}
        <div className="flex justify-between items-center mb-8 shrink-0">
          <h2 className="text-2xl font-black text-[#09314F] uppercase tracking-tight">Confirm Selection</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-2xl transition-colors">
            <XMarkIcon className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* CONTENT: This section scrolls */}
        <div className="space-y-6 mb-10 overflow-y-auto pr-2 custom-scrollbar">
          {selectedCourses.map((course) => {
            const subjects = subjectsByCourse[course.id]?.filter((s) => selectedSubjects[course.id]?.includes(s.id)) || [];
            return (
              <div key={course.id} className="p-6 bg-[#F8F9FA] rounded-3xl border border-gray-50">
                <h3 className="text-xs font-black text-[#888888] uppercase tracking-widest mb-3">{course.title}</h3>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((s) => (
                    <span key={s.id} className="px-3 py-1.5 bg-white rounded-xl text-xs font-extrabold text-[#09314F] shadow-sm border border-black/5">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER: Stays fixed at the bottom */}
        <div className="flex flex-col md:flex-row gap-4 shrink-0">
          <button 
            onClick={onEdit} 
            className="flex-1 py-4 px-6 rounded-2xl font-bold text-[#09314F] bg-white border-2 border-[#09314F11] hover:bg-gray-50 transition-all active:scale-95"
          >
            Make Changes
          </button>
          <button 
            onClick={onContinue} 
            className="flex-[1.5] py-4 px-6 rounded-2xl font-bold text-white bg-[#09314F] shadow-lg shadow-[#09314F33] hover:shadow-[#09314F55] transition-all active:scale-95"
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
}
