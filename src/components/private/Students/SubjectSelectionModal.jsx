import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { dropdownTheme } from "../../../utils/dropdownTheme";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

export default function SubjectSelectionModal({ 
  isOpen, 
  onClose, 
  selectedCourses, 
  department, 
  onContinue 
}) {
  const [subjectsByCourse, setSubjectsByCourse] = useState({});
  const [selectedSubjects, setSelectedSubjects] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !selectedCourses?.length || !department) return;

    const fetchSubjects = async () => {
      setLoading(true);
      const subjectMap = {};
      const selectionMap = {};

      for (const course of selectedCourses) {
        try {
          const res = await axios.get(
            `${API_BASE_URL}/api/courses/${course.id}/subjects/${department}`
          );
          subjectMap[course.id] = res.data.subjects || [];
          selectionMap[course.id] = [];
        } catch (err) {
          console.error(`Failed to fetch subjects for ${course.title}`, err);
          subjectMap[course.id] = [];
          selectionMap[course.id] = [];
        }
      }
      setSubjectsByCourse(subjectMap);
      setSelectedSubjects(selectionMap);
      setLoading(false);
    };

    fetchSubjects();
  }, [isOpen, selectedCourses, department]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const getSubjectLimit = (title) => title.toLowerCase().includes("jamb") ? 4 : 9;

  const toggleSubject = (courseId, subjectId) => {
    setSelectedSubjects((prev) => {
      const current = prev[courseId] || [];
      const course = selectedCourses.find((c) => c.id === courseId);
      const limit = getSubjectLimit(course.title);

      if (current.includes(subjectId)) {
        return { ...prev, [courseId]: current.filter((id) => id !== subjectId) };
      }
      if (current.length >= limit) return prev;
      return { ...prev, [courseId]: [...current, subjectId] };
    });
  };

  const handleProceed = () => {
    const valid = selectedCourses.every(c => selectedSubjects[c.id]?.length > 0);
    if (!valid) return;
    onContinue(selectedSubjects, subjectsByCourse);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl p-8 md:p-10 border border-white/20 flex flex-col my-8 animate-in fade-in zoom-in-95 duration-300">
        
        <div className="flex justify-between items-center mb-8 shrink-0">
          <div>
            <h2 className="text-2xl font-black text-[#09314F] uppercase tracking-tight">Subject Selection</h2>
            <p className="text-gray-400 text-xs font-bold mt-1 tracking-wide">Select your preferred subjects for your examination</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl transition-all active:scale-90">
            <XMarkIcon className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-visible pr-2 pb-32">
          <div ref={dropdownRef} className="w-full bg-white rounded-[8px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100 mb-8 relative z-10 w-full">
            <div className="grid grid-cols-3 bg-[#09314F] text-white px-4 md:px-6 py-4 rounded-t-[8px]">
              <span className="text-[8px] sm:text-[10px] md:text-sm font-black uppercase tracking-wider text-left leading-tight">Examination</span>
              <span className="text-[8px] sm:text-[10px] md:text-sm font-black uppercase tracking-wider text-center leading-tight">Subjects</span>
              <span className="text-[8px] sm:text-[10px] md:text-sm font-black uppercase tracking-wider text-right leading-tight">Number</span>
            </div>

            {loading ? (
              <div className="p-20 text-center">
                <div className="w-10 h-10 border-4 border-[#09314F]/10 border-t-[#09314F] rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest italic animate-pulse">Syncing Subjects...</p>
              </div>
            ) : (
              <div className="space-y-0">
                {selectedCourses.map((course) => {
                  const selectedIds = selectedSubjects[course.id] || [];
                  const subjects = subjectsByCourse[course.id] || [];
                  const limit = getSubjectLimit(course.title);
                  const isOpen = openDropdown === course.id;

                  return (
                    <div key={course.id} className={`grid grid-cols-3 items-center px-4 md:px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors relative ${isOpen ? 'z-50' : 'z-10'}`}>
                      <div className="text-[9px] sm:text-[11px] md:text-sm font-extrabold text-[#09314F] uppercase tracking-wide truncate leading-tight">
                        {course.title}
                      </div>

                      <div className="min-w-0 lg:relative flex justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(isOpen ? null : course.id);
                          }}
                          className="w-full max-w-[180px] min-w-0 min-h-[44px] flex items-center justify-center transition-all group pointer-events-auto text-[9px] sm:text-[11px] md:text-sm leading-tight"
                        >
                          <div className={`${dropdownTheme.subjectPreview} text-center`}>
                            {selectedIds.length > 0 ? (
                              subjects.filter(s => selectedIds.includes(s.id)).map(s => s.name).join(", ")
                            ) : "Select subjects"}
                          </div>
                        </button>

                        {isOpen && (
                          <div className={`${dropdownTheme.overlay.container} !w-auto !left-4 !right-4 lg:!left-0 lg:!right-auto lg:!w-[280px] lg:!translate-x-0 z-[200] shadow-2xl`}>
                             <p className={dropdownTheme.overlay.header}>Choose up to {limit} subjects</p>
                             <div className="space-y-1.5">
                               {subjects.map((subject) => {
                                 const isSelected = selectedIds.includes(subject.id);
                                 const isLimitReached = !isSelected && selectedIds.length >= limit;
                                 return (
                                   <button
                                     key={subject.id}
                                     disabled={isLimitReached}
                                     onClick={() => toggleSubject(course.id, subject.id)}
                                     className={dropdownTheme.overlay.item(isSelected, isLimitReached)}
                                   >
                                     {subject.name}
                                     {isSelected && <CheckIcon className="h-4 w-4" />}
                                   </button>
                                 );
                               })}
                             </div>
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <span className={`text-[9px] sm:text-[11px] md:text-sm font-black transition-colors ${selectedIds.length === limit ? "text-green-500" : "text-[#09314F]"}`}>
                          {selectedIds.length}
                        </span>
                        <span className="text-[9px] sm:text-[11px] md:text-sm font-bold text-gray-300"> / </span>
                        <span className="text-[9px] sm:text-[11px] md:text-sm font-bold text-gray-400">{limit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 mt-8 shrink-0">
          <button onClick={onClose} className="flex-1 py-4 px-6 rounded-2xl font-black text-gray-400 hover:bg-gray-50 transition-all uppercase tracking-widest text-[11px] border-2 border-transparent">
            Cancel
          </button>
          <button 
            onClick={handleProceed} 
            disabled={!selectedCourses.every(c => selectedSubjects[c.id]?.length > 0)}
            className="flex-[2] py-4 px-6 rounded-2xl font-black text-white bg-[#09314F] shadow-lg hover:shadow-xl transition-all uppercase tracking-widest text-[11px] disabled:bg-gray-200 disabled:shadow-none active:scale-[0.98]"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
