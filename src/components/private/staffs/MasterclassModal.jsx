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
  // ChevronDownIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

export default function CreateMasterClassModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [staffList, setStaffList] = useState([]);
  
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  
  const [formData, setFormData] = useState({
    // course_id: "",
    subject_id: "",
    title: "",
    start_date: "",
    end_date: "",
    tutor_id: "",
    assistant_id: "",
    link: "",
    status: "active",
    description: "",
  });

  const [daySchedules, setDaySchedules] = useState([
    { day: "monday", start_time: "12:00", end_time: "12:30" }
  ]);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);

  // Search states for datalists
  const [courseSearch, setCourseSearch] = useState("");
  const [subjectSearch, setSubjectSearch] = useState("");
  const [tutorSearch, setTutorSearch] = useState("");
  const [assistantSearch, setAssistantSearch] = useState("");
  const [statusSearch, setStatusSearch] = useState("active");

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

  // ✅ Fetch staff (WITH auth header)
  const fetchStaff = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/staffs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Staff response:", response.data);
      
      const fetchedStaff = response.data.staffs || response.data.data || [];
      setStaffList(Array.isArray(fetchedStaff) ? fetchedStaff : []);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
      
      // Fallback to current user
      const currentStaff = JSON.parse(localStorage.getItem("staff_info"));
      if (currentStaff) {
        setStaffList([currentStaff]);
      } else {
        setStaffList([]);
      }
    }
  };


  // ✅ Fetch courses on mount (NO auth header)
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/courses`);
        console.log("Courses raw response.data:", response?.data);
        
        const fetched = response?.data?.courses || response?.data?.data || [];
        
        if (fetched.length === 0) {
          console.warn("No courses resolved — check that response.data.courses exists and is non-empty.");
        }
        
        setCourses(fetched);
        console.table(fetched);
      } catch (error) {
        console.error("Failed to fetch courses", error);
      }
    };

    fetchCourses();
    fetchStaff();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Fetch subjects when course_id changes
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!formData.course_id) {
        setSubjects([]);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/courses/${formData.course_id}/subjects`);
        console.log("Subjects response:", response.data);
        const fetchedSubjects = response.data.subjects || response.data.data || [];
        setSubjects(fetchedSubjects);
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
        setSubjects([]);
      }
    };

    fetchSubjects();
  }, [formData.course_id, API_BASE_URL]);

  // ✅ Handle course change (datalist version)
  const handleCourseChange = (e) => {
    const value = e.target.value;
    setCourseSearch(value);
    
    const course = courses.find(c => (c.title || c.name) === value);
    if (course) {
      setSelectedCourse(course);
      setFormData({
        ...formData,
        course_id: course.id,
        subject_id: "",
        title: ""
      });
      setSelectedSubject(null);
      setSubjectSearch("");
    } else {
      setFormData({ ...formData, course_id: "" });
    }
  };

  // ✅ Handle subject change (datalist version)
  const handleSubjectChange = (e) => {
    const value = e.target.value;
    setSubjectSearch(value);
    
    const subject = subjects.find(s => s.name === value);
    if (subject) {
      setSelectedSubject(subject);
      
      const courseName = selectedCourse?.title || selectedCourse?.name || "";
      const subjectName = subject?.name || "";
      const autoTitle = courseName && subjectName ? `${courseName}-${subjectName}` : "";
      
      setFormData({
        ...formData,
        subject_id: subject.id,
        title: autoTitle
      });
    } else {
      setFormData({ ...formData, subject_id: "" });
    }
  };

  const handleStaffChange = (e, field) => {
    const value = e.target.value;
    if (field === "tutor_id") setTutorSearch(value);
    else setAssistantSearch(value);
    
    const staff = staffList.find(s => (s.name || `${s.firstname} ${s.surname}`) === value);
    if (staff) {
      setFormData({ ...formData, [field]: staff.id });
    } else {
      setFormData({ ...formData, [field]: "" });
    }
  };

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setStatusSearch(value);
    if (["active", "inactive"].includes(value)) {
      setFormData({ ...formData, status: value });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const toggleDay = (dayValue) => {
    const existingIndex = daySchedules.findIndex(s => s.day === dayValue);
    if (existingIndex !== -1) {
      setDaySchedules(daySchedules.filter(s => s.day !== dayValue));
    } else {
      setDaySchedules([...daySchedules, { 
        day: dayValue, 
        start_time: "12:00", 
        end_time: "12:30" 
      }]);
    }
    if (errors.days) setErrors({ ...errors, days: null });
  };

  const handleTimeChange = (day, field, value) => {
    setDaySchedules(prev => prev.map(s => 
      s.day === day ? { ...s, [field]: value } : s
    ));
    if (errors.start_time) setErrors({ ...errors, start_time: null });
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

    if (!formData.course_id) newErrors.course_id = "Course is required";
    if (!formData.subject_id) newErrors.subject_id = "Subject is required";
    if (!formData.title?.trim()) newErrors.title = "Title is required";
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

    if (daySchedules.length === 0) {
      newErrors.days = "At least one schedule day is required";
    } else {
      daySchedules.forEach(s => {
        if (!s.start_time || !s.end_time) {
          newErrors.start_time = "Start and end times are required for all selected days";
        }
      });
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

      const schedules = daySchedules.map(schedule => ({
        day_of_week: schedule.day,
        start_time: schedule.start_time,
        duration_minutes: calculateDuration(schedule.start_time, schedule.end_time)
      }));

      const payload = {
        subject_id: parseInt(formData.subject_id),
        title: formData.title,
        description: formData.description || "No description provided",
        status: formData.status,
        start_date: formData.start_date,
        end_date: formData.end_date,
        staffs: staffs,
        schedules: schedules
      };

      console.log("Submitting payload:", payload);

      // ✅ WITH auth header for creating class
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/classes/create`, 
        payload, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      console.log("Create class response:", response.data);

      if (response.status === 201 || response.status === 200) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to create class:", error.response?.data);
      
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-gray-100">
          <h2 className="text-2xl font-bold text-[#1F2937]">Schedule Master Class</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all"
          >
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Global API Error Banner */}
        {apiError && (
          <div className="mx-8 mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
            {apiError}
          </div>
        )}

        {/* Form Content */}
        <div className="px-8 py-6 overflow-y-auto flex-1">
          <form id="masterClassForm" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Session Duration Card */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Period
              </label>
              <div className={`bg-gray-50 rounded-xl p-4 ${errors.start_date || errors.end_date ? "border-2 border-red-500" : "border border-gray-200"}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Session Duration</span>
                  <div className="flex items-center gap-3 text-sm">
                    <div>
                      <span className="block text-xs text-gray-500 mb-1">Start</span>
                      <input 
                        type="date" 
                        name="start_date" 
                        value={formData.start_date} 
                        onChange={handleChange} 
                        className="bg-transparent border-none p-0 text-gray-900 font-medium focus:ring-0 cursor-pointer" 
                      />
                    </div>
                    <span className="text-gray-400 mt-4">-</span>
                    <div>
                      <span className="block text-xs text-gray-500 mb-1">End</span>
                      <input 
                        type="date" 
                        name="end_date" 
                        value={formData.end_date} 
                        onChange={handleChange} 
                        className="bg-transparent border-none p-0 text-gray-900 font-medium focus:ring-0 cursor-pointer" 
                      />
                    </div>
                  </div>
                </div>
              </div>
              {(errors.start_date || errors.end_date) && (
                <p className="text-red-500 text-xs mt-2">{errors.start_date || errors.end_date}</p>
              )}
            </div>

            {/* Course Dropdown (JAMB, WAEC, etc) */}
            <div>
              <div className={`flex items-center gap-4 bg-gray-50 rounded-xl p-4 ${errors.course_id ? "border-2 border-red-500" : "border border-gray-200"}`}>
                <BookOpenIcon className="w-6 h-6 text-gray-700" />
                <input 
                  list="course-list"
                  name="course_id" 
                  value={courseSearch} 
                  onChange={handleCourseChange} 
                  placeholder="Select Course (e.g., JAMB, WAEC)"
                  className="flex-1 bg-transparent text-gray-900 font-medium outline-none cursor-pointer"
                />
                <datalist id="course-list">
                  {courses.map(course => (
                    <option key={course.id} value={course.title || course.name} />
                  ))}
                </datalist>
                {/* <ChevronDownIcon className="w-5 h-5 text-gray-400" /> */}
              </div>
              {errors.course_id && <p className="text-red-500 text-xs mt-2">{errors.course_id}</p>}
            </div>

            {/* Subject Dropdown (English, Mathematics, etc) */}
            <div>
              <div className={`flex items-center gap-4 bg-gray-50 rounded-xl p-4 ${errors.subject_id ? "border-2 border-red-500" : "border border-gray-200"}`}>
                <BookOpenIcon className="w-6 h-6 text-gray-700" />
                <input 
                  list="subject-list"
                  name="subject_id" 
                  value={subjectSearch} 
                  onChange={handleSubjectChange}
                  disabled={!formData.course_id}
                  placeholder="Select Subject (e.g., English, Mathematics)"
                  className="flex-1 bg-transparent text-gray-900 font-medium outline-none cursor-pointer disabled:text-gray-400 disabled:cursor-not-allowed"
                />
                <datalist id="subject-list">
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.name} />
                  ))}
                </datalist>
                {/* <ChevronDownIcon className="w-5 h-5 text-gray-400" /> */}
              </div>
              {errors.subject_id && <p className="text-red-500 text-xs mt-2">{errors.subject_id}</p>}
            </div>

            {/* Auto-Generated Title (Read-only display) */}
            <div>
              <div className={`flex items-center gap-4 bg-gray-100 rounded-xl p-4 border border-gray-200`}>
                <div className="w-6" />
                <div className="flex-1">
                  <span className="block text-xs text-gray-500 mb-1">Generated Class Title</span>
                  <p className="text-gray-900 font-bold">
                    {formData.title || "Select course and subject to generate title"}
                  </p>
                </div>
              </div>
            </div>

            {/* Days of Week Selectors */}
            <div>
              <div className="flex items-center gap-4">
                <ClockIcon className="w-6 h-6 text-gray-700" />
                <div className="flex-1 flex gap-2">
                  {weekDays.map(day => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        daySchedules.some(s => s.day === day.value) 
                          ? "bg-blue-300 text-blue-900" 
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
              {errors.days && <p className="text-red-500 text-xs mt-2 ml-10">{errors.days}</p>}
            </div>

            {/* Individual Day Schedule Cards */}
            <div className="space-y-4">
              {daySchedules.map((schedule) => (
                <div key={schedule.day}>
                  <div className="flex items-center gap-4">
                    <div className="w-6" />
                    <div className={`flex-1 bg-gray-50 rounded-xl p-4 ${errors.start_time ? "border-2 border-red-500" : "border border-gray-200"}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="block text-xs text-gray-500 mb-1">Day</span>
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {schedule.day}
                          </span>
                        </div>
                        <div className="flex items-center gap-6">
                          <div>
                            <span className="block text-xs text-gray-500 mb-1 text-right">Start</span>
                            <input 
                              type="time" 
                              value={schedule.start_time} 
                              onChange={(e) => handleTimeChange(schedule.day, "start_time", e.target.value)} 
                              className="bg-transparent border-none p-0 text-sm text-gray-900 font-medium focus:ring-0 cursor-pointer" 
                            />
                          </div>
                          <span className="text-gray-400 mt-4">-</span>
                          <div>
                            <span className="block text-xs text-gray-500 mb-1 text-right">End</span>
                            <input 
                              type="time" 
                              value={schedule.end_time} 
                              onChange={(e) => handleTimeChange(schedule.day, "end_time", e.target.value)} 
                              className="bg-transparent border-none p-0 text-sm text-gray-900 font-medium focus:ring-0 cursor-pointer" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {errors.start_time && <p className="text-red-500 text-xs mt-2 ml-10">{errors.start_time}</p>}
            </div>

            {/* Timezone */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <GlobeAltIcon className="w-6 h-6 text-gray-700" />
              <span>West Africa Standard Time</span>
            </div>

            {/* Tutor */}
            <div>
              <div className={`flex items-center gap-4 bg-gray-50 rounded-xl p-4 ${errors.tutor_id ? "border-2 border-red-500" : "border border-gray-200"}`}>
                <UserGroupIcon className="w-6 h-6 text-gray-700" />
                <input 
                  list="tutor-list"
                  name="tutor_id" 
                  value={tutorSearch} 
                  onChange={(e) => handleStaffChange(e, "tutor_id")} 
                  placeholder="Select tutor"
                  className="flex-1 bg-transparent text-gray-500 outline-none cursor-pointer"
                />
                <datalist id="tutor-list">
                  {staffList.map(s => (
                    <option key={s.id} value={s.name || `${s.firstname} ${s.surname}`} />
                  ))}
                </datalist>
                {/* <ChevronDownIcon className="w-5 h-5 text-gray-400" /> */}
              </div>
              {errors.tutor_id && <p className="text-red-500 text-xs mt-2">{errors.tutor_id}</p>}
            </div>

            {/* Assistant */}
            <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
              <UserGroupIcon className="w-6 h-6 text-gray-700" />
              <input 
                list="assistant-list"
                name="assistant_id" 
                value={assistantSearch} 
                onChange={(e) => handleStaffChange(e, "assistant_id")} 
                placeholder="Select assistant (optional)"
                className="flex-1 bg-transparent text-gray-500 outline-none cursor-pointer"
              />
              <datalist id="assistant-list">
                {staffList.map(s => (
                  <option key={s.id} value={s.name || `${s.firstname} ${s.surname}`} />
                ))}
              </datalist>
              {/* <ChevronDownIcon className="w-5 h-5 text-gray-400" /> */}
            </div>

            {/* Link */}
            <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
              <LinkIcon className="w-6 h-6 text-gray-700" />
              <input 
                type="url" 
                name="link" 
                value={formData.link} 
                onChange={handleChange} 
                placeholder="Add Link" 
                className="flex-1 bg-transparent text-gray-900 outline-none placeholder-gray-400" 
              />
            </div>

            {/* Status */}
            <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
              <UserCircleIcon className="w-6 h-6 text-gray-700" />
              <input 
                list="status-list"
                name="status" 
                value={statusSearch} 
                onChange={handleStatusChange} 
                placeholder="Select status"
                className="flex-1 bg-transparent text-gray-500 outline-none cursor-pointer"
              />
              <datalist id="status-list">
                <option value="active" />
                <option value="inactive" />
              </datalist>
              {/* <ChevronDownIcon className="w-5 h-5 text-gray-400" /> */}
            </div>

            {/* Description */}
            <div>
              <div className="flex items-start gap-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
                <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-gray-700 mt-1" />
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  placeholder="Description (optional)" 
                  rows="3" 
                  className="flex-1 bg-transparent text-gray-900 outline-none placeholder-gray-400 resize-none"
                />
              </div>
            </div>

          </form>
        </div>

        {/* Footer Buttons */}
        <div className="px-8 py-6 bg-white flex items-center gap-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="masterClassForm"
            disabled={loading}
            className="flex-1 py-3.5 bg-[#0F2843] hover:bg-[#0a1b2d] text-white font-bold rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>

      </div>
    </div>
  );
}