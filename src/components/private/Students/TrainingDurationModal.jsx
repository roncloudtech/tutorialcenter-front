import React, { useState, useMemo } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function TrainingDurationModal({ 
  isOpen, 
  onClose, 
  selectedCourses, 
  onContinue 
}) {
  const [selectedDurations, setSelectedDurations] = useState({});

  const DURATION_OPTIONS = [
    { key: "monthly", label: "Monthly", months: 1 },
    { key: "quarterly", label: "Quarterly", months: 3 },
    { key: "semi_annual", label: "Semi-Annual", months: 6 },
    { key: "annual", label: "Annual", months: 12 },
  ];

  const calculatePrice = (basePrice, months) => {
    const total = basePrice * months;
    return months === 1 ? total : total - total * 0.05;
  };

  const handleDurationChange = (course, durationKey) => {
    const option = DURATION_OPTIONS.find((d) => d.key === durationKey);
    const price = calculatePrice(course.price, option.months);

    setSelectedDurations((prev) => ({
      ...prev,
      [course.id]: {
        duration: option.key,
        months: option.months,
        price,
      },
    }));
  };

  const totalAmount = useMemo(() => {
    return Object.values(selectedDurations)
      .filter(Boolean)
      .reduce((sum, item) => sum + item.price, 0);
  }, [selectedDurations]);

  if (!isOpen) return null;

  const valid = selectedCourses.every(c => selectedDurations[c.id]);

  return (
    <div className="fixed inset-0 z-[105] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl p-8 md:p-10 border border-white/20 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-300">
        
        <div className="flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-black text-[#09314F] uppercase tracking-tight">Duration Selection</h2>
            <p className="text-gray-400 text-xs font-bold mt-1 tracking-wide">Select your preferred training duration for your examination</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl transition-all">
            <XMarkIcon className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-visible pr-2 custom-scrollbar my-4">
          <div className="w-full bg-white rounded-[8px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100 mb-8 relative z-10 overflow-hidden">
            <div className="grid grid-cols-3 bg-[#09314F] text-white px-4 md:px-6 py-4 rounded-t-[8px]">
              <span className="text-[8px] sm:text-[10px] md:text-sm font-black uppercase tracking-wider text-left leading-tight">Examination</span>
              <span className="text-[8px] sm:text-[10px] md:text-sm font-black uppercase tracking-wider text-center leading-tight">Duration</span>
              <span className="text-[8px] sm:text-[10px] md:text-sm font-black uppercase tracking-wider text-right leading-tight">Amount</span>
            </div>

            <div className="space-y-0 bg-white">
              {selectedCourses.map((course) => {
                const selected = selectedDurations[course.id];
                return (
                  <div key={course.id} className="grid grid-cols-3 items-center px-4 md:px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <div className="text-[9px] sm:text-[11px] md:text-sm font-extrabold text-[#09314F] uppercase tracking-wide truncate leading-tight">
                      {course.title}
                    </div>
                    
                    <div className="flex justify-center">
                      <select 
                        className="bg-[#D1D5DB] text-[#4B5563] text-[10px] md:text-xs font-bold rounded-lg px-3 py-2 outline-none cursor-pointer hover:bg-gray-400 transition-colors text-center appearance-none min-w-[100px]"
                        value={selected?.duration || ""}
                        onChange={(e) => handleDurationChange(course, e.target.value)}
                      >
                        <option value="">Select</option>
                        {DURATION_OPTIONS.map((opt) => (
                          <option key={opt.key} value={opt.key}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="text-right text-[11px] md:text-sm font-black text-[#09314F]">
                      {selected ? `₦${selected.price.toLocaleString()}` : "NO"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 shrink-0 flex flex-col gap-6">
          <button 
            disabled={!valid}
            onClick={() => onContinue(selectedDurations, totalAmount)}
            className={`w-full py-5 px-6 rounded-2xl font-black text-white shadow-xl transition-all duration-300 transform active:scale-[0.98] uppercase tracking-widest text-[11px] ${!valid ? "bg-gray-200 cursor-not-allowed shadow-none" : "bg-gradient-to-r from-[#09314F] to-[#E83831] hover:shadow-[#E8383144] hover:-translate-y-0.5"}`}
          >
            Continue = ₦{totalAmount.toLocaleString()}
          </button>
          
          <button onClick={onClose} className="w-full py-4 bg-red-50 text-red-500 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-red-100 transition-all active:scale-[0.98]">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
