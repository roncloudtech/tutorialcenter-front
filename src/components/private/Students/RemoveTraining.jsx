import React, { useState } from "react";
import axios from "axios";
import { BellIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";

export default function RemoveTraining({ 
  activeCourses = [], 
  loading = false, 
  fetchData, 
  setToast, 
  setActiveView, 
  API_BASE_URL, 
  token,
  formatDate 
}) {
  const [selectedToRemove, setSelectedToRemove] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);

  const handleRemoveSubmit = async () => {
    if (!selectedToRemove) return;
    
    setRemoveLoading(true);
    try {
      // Endpoint provided: api/students/courses/disenroll/{courseId}
      await axios.post(`${API_BASE_URL}/api/students/courses/disenroll/${selectedToRemove.course_id}`, {}, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
      });
      
      setToast({ type: "success", message: "Course removed successfully" });
      setShowRemoveModal(false);
      setSelectedToRemove(null);
      setActiveView("main");
      fetchData();
    } catch (error) {
      console.error("Removal failed:", error);
      setToast({ 
        type: "error", 
        message: error.response?.data?.message || "Failed to remove course" 
      });
    } finally {
      setRemoveLoading(false);
    }
  };

  const ConfirmationModal = () => (
    <div className="fixed inset-0 z-[110] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRemoveModal(false)} />
      <div className="relative bg-white rounded-3xl p-10 w-[90%] max-w-sm shadow-2xl z-10 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h2 className="text-2xl font-black text-[#0F2843] mb-2">Remove Course</h2>
        <p className="text-gray-500 text-sm mb-2 leading-relaxed">Are you sure you want to remove <span className="font-bold text-gray-700">{selectedToRemove?.course?.title || "this course"}</span> from your training list?</p>
        <p className="text-red-500 text-xs font-bold mb-8 leading-relaxed">A cancelled course cannot be reactivated. Are you sure you want to cancel?</p>
        <div className="flex flex-col gap-3">
          <button onClick={handleRemoveSubmit} disabled={removeLoading} className="w-full py-4 bg-[#09314F] text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-md active:scale-95 disabled:bg-gray-400">
            {removeLoading ? "Removing..." : "Yes, Remove"}
          </button>
          <button onClick={() => setShowRemoveModal(false)} disabled={removeLoading} className="w-full py-4 bg-gray-50 text-gray-500 font-bold rounded-xl hover:bg-gray-100 transition-all">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="pt-4" />

      <button onClick={() => { setActiveView("main"); setSelectedToRemove(null); }} className="flex items-center gap-2 mb-8 group">
        <ChevronLeftIcon className="w-4 h-4 text-gray-500 group-hover:text-[#0F2843] transition-colors" />
        <span className="text-sm text-gray-500 group-hover:text-[#0F2843] transition-colors">
          Back / <span className="font-bold text-[#0F2843]">Remove Training</span>
        </span>
      </button>

      <div>
        <h3 className="text-sm font-bold text-gray-600 mb-5">On-going Training</h3>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-[#09314F] mx-auto" />
          </div>
        ) : activeCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 font-bold">No active trainings found.</p>
          </div>
        ) : (
          <div className="space-y-4 mb-10">
            {activeCourses.map((item, index) => {
              const isSelected = selectedToRemove?.enrollment_id === item.enrollment_id;
              return (
                <div
                  key={item.enrollment_id || item.id || `remove-${index}`}
                  onClick={() => setSelectedToRemove(item)}
                  className={`relative bg-white border cursor-pointer rounded-xl p-6 transition-all duration-200 ${isSelected ? "border-[#09314F] shadow-md ring-2 ring-[#09314F]/10" : "border-gray-200 hover:border-[#09314F] hover:shadow-sm"}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-[17px] font-black text-[#0F2843] mb-1">
                        {item.course?.title || item.course_name}
                      </h4>
                      <p className="text-xs text-gray-400 capitalize">{item.billing_cycle || "Weekly"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-500 mb-1">Duration</p>
                      <p className="text-[11px] text-gray-400">{formatDate(item.start_date)} - {formatDate(item.end_date)}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 bg-[#09314F] text-white p-1 rounded-full shadow-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={() => selectedToRemove && setShowRemoveModal(true)}
          disabled={!selectedToRemove}
          className={`w-full py-4 font-black rounded-xl transition-all shadow-lg ${!selectedToRemove ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#09314F] text-white hover:bg-[#0a3d63] active:scale-[0.99]"}`}
        >
          Remove
        </button>
      </div>

      {showRemoveModal && <ConfirmationModal />}
    </>
  );
}
