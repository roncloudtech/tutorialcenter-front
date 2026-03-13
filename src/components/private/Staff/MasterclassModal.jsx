import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  BookOpenIcon, 
  ClockIcon, 
  GlobeAltIcon, 
  UserGroupIcon, 
  LinkIcon, 
  UserCircleIcon, 
  ChatBubbleBottomCenterTextIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";

export default function CreateMasterClassModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [staffList, setStaffList] = useState([]);
  
  const [formData, setFormData] = useState({
    subject_id: "",
    title: "",
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    tutor_id: "",
    assistant_id: "",
    link: "",
    status: "active",
    description: "",
  });

  const [selectedDays, setSelectedDays] = useState(["monday"]);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
  const token = localStorage.getItem("staff_token");

  const weekDays = [
    { label: "Su", value: "sunday" },
    { label: "Mo", value: "monday" },
    { label: "Tu", value: "tuesday" },
    { label: "We", value: "wednesday" },
    { label: "Th", value: "thursday" },
    { label: "Fr", value: "friday" },
    { label: "Sa", value: "saturday" }
  ];

 useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/subjects/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const fetchedSubjects = response.data.subjects || response.data.data;
        setSubjects(Array.isArray(fetchedSubjects) ? fetchedSubjects : []);
      } catch (error) {
        console.warn("Subjects endpoint failed or missing. Defaulting to empty.");
        setSubjects([]);
      }
    };

    const fetchStaff = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/staffs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const fetchedStaff = response.data.staffs || response.data.data;
        setStaffList(Array.isArray(fetchedStaff) ? fetchedStaff : []);
      } catch (error) {
        console.warn("Staff endpoint failed or missing (404). Defaulting to empty.");
        setStaffList([]); 
      }
    };

    fetchSubjects();
    fetchStaff();
  }, [API_BASE_URL, token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const toggleDay = (dayValue) => {
    if (selectedDays.includes(dayValue)) {
      setSelectedDays(selectedDays.filter(d => d !== dayValue));
    } else {
      setSelectedDays([...selectedDays, dayValue]);
    }
    if (errors.days) setErrors({ ...errors, days: null });
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return 60;
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    let diff = (endH * 60 + endM) - (startH * 60 + startM);
    return diff > 0 ? diff : 60;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.subject_id) newErrors.subject_id = "Subject is required";
    if (!formData.title?.trim()) newErrors.title = "Title is required";
    if (!formData.description?.trim()) newErrors.description = "Description is required";
    if (!formData.start_date) newErrors.start_date = "Start date is required";
    if (!formData.end_date) newErrors.end_date = "End date is required";
    
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) > new Date(formData.end_date)) {
        newErrors.end_date = "End date cannot be before start date";
      }
    }
    
    if (!formData.tutor_id) {
      newErrors.tutor_id = "At least one staff member is required";
    }

    if (selectedDays.length === 0) {
      newErrors.days = "At least one schedule day is required";
    }
    if (!formData.start_time) {
      newErrors.start_time = "Start time is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return; 
    }

    setLoading(true);

    try {
      const staffs = [];
      if (formData.tutor_id) staffs.push({ staff_id: parseInt(formData.tutor_id), role: "lead" });
      if (formData.assistant_id) staffs.push({ staff_id: parseInt(formData.assistant_id), role: "assistant" });

      const duration = calculateDuration(formData.start_time, formData.end_time);
      const schedules = selectedDays.map(day => ({
        day_of_week: day,
        start_time: formData.start_time,
        duration_minutes: duration
      }));

      // 🛡️ THE FIX: Safely parse subject_id so we don't send NaN to the backend
      const payload = {
        subject_id: formData.subject_id ? parseInt(formData.subject_id) : "",
        title: formData.title,
        description: formData.description,
        status: formData.status,
        start_date: formData.start_date,
        end_date: formData.end_date,
        staffs: staffs,
        schedules: schedules,
        link: formData.link 
      };

      const response = await axios.post(`${API_BASE_URL}/api/admin/classes/create`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.status === 201 || response.status === 200) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to create class:", error.response?.data);
      
      // 🛡️ THE FIX: Convert Laravel's array of errors into clean strings for the UI state
      if (error.response?.data?.errors) {
        const laravelErrors = error.response.data.errors;
        const formattedErrors = {};
        
        for (const key in laravelErrors) {
          formattedErrors[key] = laravelErrors[key][0]; 
        }
        
        setErrors(formattedErrors);
      } else {
        setApiError(error.response?.data?.message || "Failed to create class. Server error.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        <div className="px-8 py-6">
          <h2 className="text-xl font-bold text-[#1F2937]">Schedule Master Class</h2>
        </div>

        {/* Global API Error Banner (No Icons) */}
        {apiError && (
          <div className="mx-8 mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
            {apiError}
          </div>
        )}

        <div className="px-8 overflow-y-auto custom-scrollbar flex-1 pb-4">
          <form id="masterClassForm" onSubmit={handleSubmit} className="space-y-4">
            
            {/* Session Duration */}
            <div>
              <div className={`bg-[#F1F3F5] rounded-xl p-3 flex justify-between items-center text-sm ${errors.start_date || errors.end_date ? "border border-red-500" : ""}`}>
                <div className="w-1/3">
                  <span className="block text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-1">Period</span>
                  <span className="font-medium text-gray-700">Session Duration</span>
                </div>
                <div className="flex items-center gap-2">
                  <div>
                    <span className="block text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-1">Start</span>
                    <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="bg-transparent border-none p-0 text-sm text-gray-700 focus:ring-0 cursor-pointer outline-none" />
                  </div>
                  <span className="text-gray-400 mt-4">-</span>
                  <div>
                    <span className="block text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-1">End</span>
                    <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="bg-transparent border-none p-0 text-sm text-gray-700 focus:ring-0 cursor-pointer outline-none" />
                  </div>
                </div>
              </div>
              {(errors.start_date || errors.end_date) && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.start_date || errors.end_date}</p>
              )}
            </div>

            {/* Subject */}
            <div>
              <div className={`flex items-center gap-3 bg-[#F1F3F5] rounded-xl relative ${errors.subject_id ? "border border-red-500" : ""}`}>
                <BookOpenIcon className="w-6 h-6 text-gray-800 shrink-0 ml-3" />
                <select name="subject_id" value={formData.subject_id} onChange={handleChange} className="w-full bg-transparent appearance-none px-4 py-3 text-sm font-medium text-gray-800 outline-none cursor-pointer">
                  <option value="" disabled>Select Category (e.g., JAMB)</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <ChevronDownIcon className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {errors.subject_id && <p className="text-red-500 text-xs mt-1 ml-11">{errors.subject_id}</p>}
            </div>

            {/* Title */}
            <div>
              <div className={`flex items-center gap-3 bg-[#F1F3F5] rounded-xl ${errors.title ? "border border-red-500" : ""}`}>
                <div className="w-6 shrink-0 ml-3" /> 
                <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Class Name (e.g. English Master Class)" className="w-full bg-transparent px-4 py-3 text-sm font-medium text-gray-800 outline-none placeholder-gray-500" />
              </div>
              {errors.title && <p className="text-red-500 text-xs mt-1 ml-11">{errors.title}</p>}
            </div>

            {/* Days */}
            <div>
              <div className="flex items-center gap-3">
                <ClockIcon className="w-6 h-6 text-gray-800 shrink-0" />
                <div className="flex-1 flex gap-1 justify-between">
                  {weekDays.map(day => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        selectedDays.includes(day.value) ? "bg-[#93C5FD] text-[#1E3A8A]" : "bg-[#F1F3F5] text-gray-500 hover:bg-gray-200"
                      } ${errors.days ? "border border-red-500" : ""}`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
              {errors.days && <p className="text-red-500 text-xs mt-1 ml-11">{errors.days}</p>}
            </div>

            {/* Time Block */}
            <div>
              <div className="flex items-center gap-3">
                <div className="w-6 shrink-0" />
                <div className={`flex-1 bg-[#F1F3F5] rounded-xl p-3 flex justify-between items-center text-sm ${errors.start_time ? "border border-red-500" : ""}`}>
                  <div className="w-1/3">
                    <span className="block text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-1">Day</span>
                    <span className="font-medium text-gray-700 capitalize">
                      {selectedDays.length > 0 ? selectedDays[0] : "Select a day"}
                      {selectedDays.length > 1 && "..."}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div>
                      <span className="block text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-1">Start</span>
                      <input type="time" name="start_time" value={formData.start_time} onChange={handleChange} className="bg-transparent border-none p-0 text-sm text-gray-700 focus:ring-0 cursor-pointer outline-none w-20" />
                    </div>
                    <span className="text-gray-400 mt-4">-</span>
                    <div>
                      <span className="block text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-1">End</span>
                      <input type="time" name="end_time" value={formData.end_time} onChange={handleChange} className="bg-transparent border-none p-0 text-sm text-gray-700 focus:ring-0 cursor-pointer outline-none w-20" />
                    </div>
                  </div>
                </div>
              </div>
              {errors.start_time && <p className="text-red-500 text-xs mt-1 ml-11">{errors.start_time}</p>}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <GlobeAltIcon className="w-6 h-6 text-gray-800 shrink-0" />
              <span className="text-sm text-gray-600 font-medium">West Africa Standard Time</span>
            </div>

            {/* Tutor */}
            <div>
              <div className={`flex items-center gap-3 mt-4 bg-[#F1F3F5] rounded-xl relative ${errors.tutor_id ? "border border-red-500" : ""}`}>
                <UserGroupIcon className="w-6 h-6 text-gray-800 shrink-0 ml-3" />
                <select name="tutor_id" value={formData.tutor_id} onChange={handleChange} className="w-full bg-transparent appearance-none px-4 py-3 text-sm font-medium text-gray-500 outline-none cursor-pointer">
                  <option value="">Select tutor</option>
                  {staffList.map(s => <option key={s.id} value={s.id}>{s.name || `${s.firstname} ${s.surname}`}</option>)}
                </select>
              </div>
              {errors.tutor_id && <p className="text-red-500 text-xs mt-1 ml-11">{errors.tutor_id}</p>}
            </div>

            {/* Assistant */}
            <div className="flex items-center gap-3 bg-[#F1F3F5] rounded-xl relative">
              <UserGroupIcon className="w-6 h-6 text-gray-800 shrink-0 ml-3" />
              <select name="assistant_id" value={formData.assistant_id} onChange={handleChange} className="w-full bg-transparent appearance-none px-4 py-3 text-sm font-medium text-gray-500 outline-none cursor-pointer">
                <option value="">Select assistant (optional)</option>
                {staffList.map(s => <option key={s.id} value={s.id}>{s.name || `${s.firstname} ${s.surname}`}</option>)}
              </select>
            </div>

            {/* Link */}
            <div className="flex items-center gap-3 bg-[#F1F3F5] rounded-xl">
              <LinkIcon className="w-6 h-6 text-gray-800 shrink-0 ml-3" />
              <input type="url" name="link" value={formData.link} onChange={handleChange} placeholder="Add Link" className="w-full bg-transparent px-4 py-3 text-sm font-medium text-gray-800 outline-none placeholder-gray-400" />
            </div>

            {/* Status */}
            <div className="flex items-center gap-3 bg-[#F1F3F5] rounded-xl relative">
              <UserCircleIcon className="w-6 h-6 text-gray-800 shrink-0 ml-3" />
              <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-transparent appearance-none px-4 py-3 text-sm font-medium text-gray-500 outline-none cursor-pointer">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDownIcon className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Description */}
            <div>
              <div className={`flex items-start gap-3 bg-[#F1F3F5] rounded-xl ${errors.description ? "border border-red-500" : ""}`}>
                <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-gray-800 shrink-0 mt-3 ml-3" />
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" rows="3" className="w-full bg-transparent px-4 py-3 text-sm font-medium text-gray-800 outline-none placeholder-gray-400 resize-none"></textarea>
              </div>
              {errors.description && <p className="text-red-500 text-xs mt-1 ml-11">{errors.description}</p>}
            </div>

          </form>
        </div>

        <div className="p-6 bg-white flex items-center gap-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-[#EF4444] hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="masterClassForm"
            disabled={loading}
            className="flex-1 py-3 bg-[#0F2843] hover:bg-[#0a1b2d] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>

      </div>
    </div>
  );
}