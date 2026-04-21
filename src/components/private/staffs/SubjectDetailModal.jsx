import React from "react";
import { 
  XMarkIcon, 
  AcademicCapIcon, 
  TrashIcon, 
  PencilSquareIcon,
  BookOpenIcon,
  CheckBadgeIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";

export default function SubjectDetailModal({ isOpen, subject, course, onClose, onDelete, onEdit }) {
  if (!isOpen || !subject) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl bg-[#0F2843]/60 animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] rounded-[48px] shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-white/20">
        
        {/* Banner Section */}
        <div className="relative aspect-video sm:aspect-[21/9] w-full overflow-hidden">
          {subject.banner ? (
            <img 
              src={subject.banner.startsWith('http') ? subject.banner : `${process.env.REACT_APP_API_URL}${subject.banner}`} 
              alt={subject.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#0F2843]/10 flex flex-col items-center justify-center gap-4">
              <AcademicCapIcon className="w-20 h-20 text-[#BB9E7F]/20" />
              <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">No Subject Banner</span>
            </div>
          )}
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-[#E83831] transition-all active:scale-90 shadow-lg hover:shadow-red-900/30"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>

          <div className="absolute bottom-8 left-8 right-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-[#BB9E7F] text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg">Subject Module</span>
              <div className="flex items-center gap-1 px-3 py-1 bg-[#76D287] text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg">
                <CheckBadgeIcon className="w-3 h-3" />
                Active
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-lg uppercase">{subject.name}</h2>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-10 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* Left Main Content */}
            <div className="lg:col-span-2 space-y-10">
              <div className="space-y-4">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-[#BB9E7F] rounded-full"></div>
                  Syllabus Overview
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-medium whitespace-pre-wrap">
                  {subject.description || "This subject module provides in-depth comprehensive learning materials and interactive sessions designed to help students master the complexities of the topic and prepare for excellence."}
                </p>
              </div>

              <div className="space-y-6">
                 <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                   <div className="w-1.5 h-4 bg-[#0F2843] rounded-full"></div>
                   Module Information
                 </h3>
                 <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-[32px] border border-gray-100 dark:border-gray-700">
                      <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-2xl flex items-center justify-center shadow-sm">
                        <InformationCircleIcon className="w-6 h-6 text-[#BB9E7F]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Enrollment Eligibility</p>
                        <p className="text-sm font-bold text-[#0F2843] dark:text-white mt-0.5">Contact administrator for detailed subject requirements and prerequisites.</p>
                      </div>
                    </div>
                 </div>
              </div>
            </div>

            {/* Right Sidebar Info */}
            <div className="space-y-8">
              <div className="p-8 bg-[#0F2843] rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-bl-[80px]" />
                <BookOpenIcon className="w-10 h-10 text-[#BB9E7F] mb-4" />
                <h4 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-1">Parent Curriculum</h4>
                <p className="text-2xl font-black tracking-tight leading-tight uppercase">
                  {course?.title || "Standalone Subject"}
                </p>
                <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white/40">Status:</span>
                  <span className="text-[10px] font-black text-[#76D287] uppercase tracking-widest bg-[#76D287]/10 px-3 py-1 rounded-full">Operational</span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => onEdit(subject)}
                  className="w-full py-5 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-[#0F2843] dark:text-white font-black rounded-3xl hover:border-[#BB9E7F]/30 hover:shadow-lg transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <PencilSquareIcon className="w-5 h-5 text-[#BB9E7F]" />
                  Modify Subject
                </button>
                <button 
                  onClick={() => onDelete(subject.id)}
                  className="w-full py-5 bg-red-50 text-red-500 font-black rounded-3xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95 shadow-sm shadow-red-200"
                >
                  <TrashIcon className="w-5 h-5" />
                  Terminate Module
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
