import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  BookOpenIcon,
  // CalendarIcon,
  ClockIcon,
  ChevronDownIcon,
  // GlobeAltIcon,
  UserGroupIcon,
  LinkIcon,
  UserCircleIcon,
  ChatBubbleBottomCenterTextIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function CreateMasterClassModal({ onClose, onSuccess }) {
  /* =============================
     CONSTANTS
  ============================= */

  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  const token = localStorage.getItem("staff_token");

  const weekDays = [
    { label: "Su", value: "sunday" },
    { label: "Mo", value: "monday" },
    { label: "Tu", value: "tuesday" },
    { label: "We", value: "wednesday" },
    { label: "Th", value: "thursday" },
    { label: "Fr", value: "friday" },
    { label: "Sa", value: "saturday" },
  ];

  /* =============================
     STATE
  ============================= */

  const [loading, setLoading] = useState(false);

  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [tutors, setTutors] = useState([]);
  const [assistants, setAssistants] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [courseSearch, setCourseSearch] = useState("");
  const [subjectSearch, setSubjectSearch] = useState("");
  const [tutorSearch, setTutorSearch] = useState("");
  const [assistantSearch, setAssistantSearch] = useState("");

  const [selectedTutors, setSelectedTutors] = useState([]);
  const [selectedAssistants, setSelectedAssistants] = useState([]);

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);

  const [formData, setFormData] = useState({
    course_id: "",
    subject_id: "",
    title: "",
    start_date: "",
    end_date: "",
    tutor_ids: [],
    assistant_ids: [],
    link: "",
    status: "active",
    description: "",
  });

  const [daySchedules, setDaySchedules] = useState([
    { day: "monday", start_time: "12:00", end_time: "12:30" },
  ]);

  /* =============================
     API CALLS
  ============================= */

  const fetchCourses = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/courses`);
      const fetched = res.data?.courses || res.data?.data || [];
      setCourses(fetched);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    }
  }, [API_BASE_URL]);

  const fetchSubjects = useCallback(async (courseId) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/courses/${courseId}/subjects`,
      );
      const fetched = res.data?.subjects || res.data?.data || [];
      setSubjects(fetched);
      console.log(
        `Fetched ${fetched.length} subjects for course ID ${courseId}`,
      );
      console.log("Subjects:", fetched);
    } catch (error) {
      console.error("Failed to fetch subjects", error);
      setSubjects([]);
    }
  }, [API_BASE_URL]);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/staffs/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetched = res.data?.staffs || res.data?.data || [];

      setTutors(fetched.filter((s) => s.role === "tutor"));
      setAssistants(fetched.filter((s) => s.role === "advisor"));
    } catch (error) {
      console.error("Failed to fetch staff", error);
    }
  }, [API_BASE_URL, token]);

  /* =============================
     EFFECTS
  ============================= */

  useEffect(() => {
    fetchCourses();
    fetchStaff();
  }, [fetchCourses, fetchStaff]);

  useEffect(() => {
    if (formData.course_id) {
      fetchSubjects(formData.course_id);
    } else {
      setSubjects([]);
    }
  }, [formData.course_id, fetchSubjects]);

  /* =============================
     INPUT HANDLERS
  ============================= */

  const handleCourseChange = (e) => {
    const value = e.target.value;
    setCourseSearch(value);

    const course = courses.find((c) => (c.title || c.name) === value);

    if (!course) {
      setSelectedCourse(null);
      setSubjects([]);
      setFormData((prev) => ({
        ...prev,
        course_id: "",
        subject_id: "",
      }));
      return;
    }

    setSelectedCourse(course);

    setFormData((prev) => ({
      ...prev,
      course_id: course.id,
      subject_id: "",
    }));

    setSubjectSearch("");
    setSelectedSubject(null);
  };

  const handleSubjectChange = (e) => {
    const value = e.target.value;
    setSubjectSearch(value);

    const subject = subjects.find((s) => s.name === value);

    if (!subject) {
      setSelectedSubject(null);
      setFormData((prev) => ({
        ...prev,
        subject_id: "",
      }));
      return;
    }

    setSelectedSubject(subject);

    const autoTitle = `${selectedCourse?.title || selectedCourse?.name} - ${subject.name}`;

    setFormData((prev) => ({
      ...prev,
      subject_id: subject.id,
      title: autoTitle,
    }));
  };

  const handleStaffChange = (e, field) => {
    const value = e.target.value;

    if (field === "tutor_ids") setTutorSearch(value);
    else setAssistantSearch(value);

    const staffList = field === "tutor_ids" ? tutors : assistants;

    const staff = staffList.find(
      (s) => `${s.firstname} ${s.surname}` === value || s.name === value,
    );

    if (staff) {
      const idsKey = field;
      const selectedKey =
        field === "tutor_ids" ? selectedTutors : selectedAssistants;
      const setSelected =
        field === "tutor_ids" ? setSelectedTutors : setSelectedAssistants;

      // Avoid duplicates
      if (!formData[idsKey].includes(staff.id)) {
        setFormData((prev) => ({
          ...prev,
          [idsKey]: [...prev[idsKey], staff.id],
        }));
        setSelected([...selectedKey, staff]);
      }

      // Clear search after selection
      if (field === "tutor_ids") setTutorSearch("");
      else setAssistantSearch("");
    }
  };

  const removeStaff = (id, field) => {
    const idsKey = field;
    const setSelected =
      field === "tutor_ids" ? setSelectedTutors : setSelectedAssistants;

    setFormData((prev) => ({
      ...prev,
      [idsKey]: prev[idsKey].filter((staffId) => staffId !== id),
    }));

    setSelected((prev) => prev.filter((staff) => staff.id !== id));
  };


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  /* =============================
     SCHEDULE HANDLERS
  ============================= */

  const toggleDay = (dayValue) => {
    const existingIndex = daySchedules.findIndex((s) => s.day === dayValue);

    if (existingIndex !== -1) {
      setDaySchedules(daySchedules.filter((s) => s.day !== dayValue));
    } else {
      setDaySchedules([
        ...daySchedules,
        {
          day: dayValue,
          start_time: "12:00",
          end_time: "12:30",
        },
      ]);
    }

    if (errors.days) {
      setErrors({ ...errors, days: null });
    }
  };

  const handleTimeChange = (day, field, value) => {
    setDaySchedules((prev) =>
      prev.map((s) => (s.day === day ? { ...s, [field]: value } : s)),
    );
  };

  /* =============================
     HELPERS
  ============================= */

  const calculateDuration = (start, end) => {
    if (!start || !end) return 60;

    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);

    let diff = endH * 60 + endM - (startH * 60 + startM);

    return diff > 0 ? diff : 60;
  };

  /* =============================
     FORM VALIDATION
  ============================= */

  const validateForm = () => {
    const newErrors = {};

    if (!formData.course_id) newErrors.course_id = "Course is required";

    if (!formData.subject_id) newErrors.subject_id = "Subject is required";

    if (!formData.title?.trim()) newErrors.title = "Title is required";

    if (!formData.start_date) newErrors.start_date = "Start date required";

    if (!formData.end_date) newErrors.end_date = "End date required";

    if (!formData.link) newErrors.link = "End date required";

    if (formData.tutor_ids.length === 0)
      newErrors.tutor_ids = "At least one tutor is required";

    if (daySchedules.length === 0) newErrors.days = "Select schedule days";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* =============================
     SUBMIT
  ============================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setApiError(null);

    try {
      /* =============================
       BUILD STAFF ARRAY
    ============================= */

      const staffs = [
        ...formData.tutor_ids.map((id) => ({
          staff_id: Number(id),
          role: "lead",
        })),
        ...formData.assistant_ids.map((id) => ({
          staff_id: Number(id),
          role: "assistant",
        })),
      ];

      if (staffs.length === 0) {
        setApiError("Please assign at least one staff member.");
        setLoading(false);
        return;
      }

      /* =============================
       BUILD SCHEDULE ARRAY
    ============================= */

      const schedules = daySchedules
        .filter((s) => s.day && s.start_time && s.end_time)
        .map((s) => ({
          day_of_week: s.day.toLowerCase(),
          start_time: s.start_time,
          duration_minutes: Number(calculateDuration(s.start_time, s.end_time)),
        }));

      if (schedules.length === 0) {
        setApiError("Please add at least one schedule.");
        setLoading(false);
        return;
      }

      /* =============================
       BUILD FINAL PAYLOAD
    ============================= */
      const payload = {
        subject_id: Number(formData.subject_id),
        title: formData.title.trim(),
        description: formData.description || "No description",
        status: formData.status,
        class_link: formData.link, // ✅ ADD THIS
        start_date: formData.start_date,
        end_date: formData.end_date,
        staffs,
        schedules,
      };
      /* =============================
       API REQUEST
    ============================= */

      const res = await axios.post(
        `${API_BASE_URL}/api/admin/classes/create`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (res.status === 201 || res.status === 200) {
        onSuccess(res.data);
      }
    } catch (error) {
      console.log("FULL ERROR RESPONSE:", error.response);

      if (error.response?.data?.errors) {
        console.log("VALIDATION ERRORS:", error.response.data.errors);

        const formatted = {};

        Object.entries(error.response.data.errors).forEach(([k, v]) => {
          formatted[k] = v[0];
        });

        setErrors(formatted);
      } else {
        setApiError(error.response?.data?.message || "Server error");
      }
    } finally {
      setLoading(false);
    }
  };
  /* =============================
     UI
  ============================= */

  return (
   <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
  {/* Backdrop */}
  <div 
    className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
    onClick={onClose}
  />
  
  {/* Modal Container */}
  <div className="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
    
    {/* Header - Fixed */}
    <div className="flex-shrink-0 px-8 py-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Schedule Master Class
      </h2>
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
      >
        <XMarkIcon className="w-5 h-5 text-gray-500" />
      </button>
    </div>

    {/* Global API Error Banner */}
    {apiError && (
      <div className="flex-shrink-0 mx-8 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-sm">
        {apiError}
      </div>
    )}

    {/* Scrollable Form Content */}
    <div className="flex-1 overflow-y-auto px-8 py-6">
      <form
        id="masterClassForm"
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* PERIOD Section */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            PERIOD
          </label>
          
          {/* Session Duration */}
          <div className={`bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 border ${
            errors.start_date || errors.end_date 
              ? "border-red-300" 
              : "border-gray-200 dark:border-gray-700"
          }`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Session Duration
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <span className="block text-xs text-gray-500 mb-1">Start</span>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <span className="text-gray-400 mt-6">-</span>
              <div className="flex-1">
                <span className="block text-xs text-gray-500 mb-1">End</span>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          {(errors.start_date || errors.end_date) && (
            <p className="text-red-500 text-xs mt-2">{errors.start_date || errors.end_date}</p>
          )}
        </div>

        {/* Course Selection */}
        <div>
          <div className={`flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-2xl px-5 py-4 border ${
            errors.course_id ? "border-red-300" : "border-gray-200 dark:border-gray-700"
          }`}>
            <BookOpenIcon className="w-5 h-5 text-gray-400" />
            <input
              list="course-list"
              name="course_id"
              value={courseSearch}
              onChange={handleCourseChange}
              placeholder="JAMB"
              className="flex-1 bg-transparent text-gray-900 dark:text-white font-medium outline-none placeholder:text-gray-400"
            />
            <datalist id="course-list">
              {courses.map((course) => (
                <option key={course.id} value={course.title || course.name} />
              ))}
            </datalist>
          </div>
          {errors.course_id && <p className="text-red-500 text-xs mt-2">{errors.course_id}</p>}
        </div>

        {/* Subject Selection */}
        <div>
          <div className={`flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-2xl px-5 py-4 border ${
            errors.subject_id ? "border-red-300" : "border-gray-200 dark:border-gray-700"
          } ${!formData.course_id && 'opacity-50'}`}>
            <BookOpenIcon className="w-5 h-5 text-gray-400" />
            <input
              list="subject-list"
              name="subject_id"
              value={subjectSearch}
              onChange={handleSubjectChange}
              disabled={!formData.course_id}
              placeholder="Geography"
              className="flex-1 bg-transparent text-gray-900 dark:text-white font-medium outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
            />
            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
            <datalist id="subject-list">
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.name} />
              ))}
            </datalist>
          </div>
          {errors.subject_id && <p className="text-red-500 text-xs mt-2">{errors.subject_id}</p>}
        </div>

        {/* Generated Class Title */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
          <span className="block text-xs text-gray-500 mb-2">Generated Class Title</span>
          <p className="text-base font-semibold text-gray-900 dark:text-white">
            {selectedSubject 
              ? `${selectedCourse?.title || selectedCourse?.name} - ${selectedSubject.name}` 
              : "JAMB - Geography"
            }
          </p>
        </div>

        {/* Weekly Schedule */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-gray-900 dark:text-white" />
              <span className="text-sm font-medium text-gray-500">West Africa Standard Time</span>
            </div>
          </div>
          
          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day) => {
              const isActive = daySchedules.some((s) => s.day === day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`py-3 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-blue-400 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>

          {/* Time Slots Table */}
          {daySchedules.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-3 gap-4 mb-3 text-xs font-medium text-gray-500">
                <span>Day</span>
                <span className="text-center">Start</span>
                <span className="text-center">End</span>
              </div>
              {daySchedules.map((schedule) => (
                <div 
                  key={schedule.day}
                  className="grid grid-cols-3 gap-4 items-center py-2"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {schedule.day}
                  </span>
                  <input
                    type="time"
                    value={schedule.start_time}
                    onChange={(e) => handleTimeChange(schedule.day, "start_time", e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="time"
                    value={schedule.end_time}
                    onChange={(e) => handleTimeChange(schedule.day, "end_time", e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          )}
          {errors.days && <p className="text-red-500 text-xs mt-2">{errors.days}</p>}
        </div>

        {/* Tutors */}
        <div>
          <div className={`flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-2xl px-5 py-4 border ${
            errors.tutor_ids ? "border-red-300" : "border-gray-200 dark:border-gray-700"
          }`}>
            <UserGroupIcon className="w-5 h-5 text-gray-400" />
            <input
              list="tutor-list"
              value={tutorSearch}
              onChange={(e) => handleStaffChange(e, "tutor_ids")}
              placeholder="Search and select tutors"
              className="flex-1 bg-transparent text-sm text-gray-500 italic outline-none placeholder:text-gray-400"
            />
            <datalist id="tutor-list">
              {tutors.map((s) => (
                <option key={s.id} value={s.name || `${s.firstname} ${s.surname}`} />
              ))}
            </datalist>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedTutors.map((s) => (
              <div key={s.id} className="flex items-center gap-2 px-4 py-2 bg-[#0a1d3a] text-white text-sm rounded-full">
                {s.name || `${s.firstname} ${s.surname}`}
                <button type="button" onClick={() => removeStaff(s.id, "tutor_ids")}>
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          {errors.tutor_ids && <p className="text-red-500 text-xs mt-2">{errors.tutor_ids}</p>}
        </div>

        {/* Assistants */}
        <div>
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-2xl px-5 py-4 border border-gray-200 dark:border-gray-700">
            <UserGroupIcon className="w-5 h-5 text-gray-400" />
            <input
              list="assistant-list"
              value={assistantSearch}
              onChange={(e) => handleStaffChange(e, "assistant_ids")}
              placeholder="Search and select assistants (optional)"
              className="flex-1 bg-transparent text-sm text-gray-500 italic outline-none placeholder:text-gray-400"
            />
            <datalist id="assistant-list">
              {assistants.map((s) => (
                <option key={s.id} value={s.name || `${s.firstname} ${s.surname}`} />
              ))}
            </datalist>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedAssistants.map((s) => (
              <div key={s.id} className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white text-sm rounded-full">
                {s.name || `${s.firstname} ${s.surname}`}
                <button type="button" onClick={() => removeStaff(s.id, "assistant_ids")}>
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Meeting Link */}
        <div>
          <div className={`flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-2xl px-5 py-4 border ${
            errors.link ? "border-red-300" : "border-gray-200 dark:border-gray-700"
          }`}>
            <LinkIcon className="w-5 h-5 text-gray-400" />
            <input
              type="url"
              name="link"
              value={formData.link}
              onChange={handleChange}
              placeholder="https://meet.google.com/ans-baxj-eyc"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>
          {errors.link && <p className="text-red-500 text-xs mt-2">{errors.link}</p>}
        </div>

        {/* Status */}
        <div>
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-2xl px-5 py-4 border border-gray-200 dark:border-gray-700">
            <UserCircleIcon className="w-5 h-5 text-gray-400" />
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="flex-1 bg-transparent text-sm outline-none cursor-pointer border-none focus:ring-0"
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800 rounded-2xl px-5 py-4 border border-gray-200 dark:border-gray-700">
            <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-gray-400 mt-1" />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description (optional)"
              rows="3"
              className="flex-1 bg-transparent text-sm text-gray-500 italic outline-none placeholder:text-gray-400 resize-none"
            />
          </div>
        </div>
      </form>
    </div>

    {/* Footer - Fixed */}
    <div className="flex-shrink-0 px-8 py-6 bg-white dark:bg-gray-900 flex items-center gap-4 border-t border-gray-200 dark:border-gray-800">
      <button
        type="button"
        onClick={onClose}
        disabled={loading}
        className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-xl transition-all hover:bg-red-600 disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="masterClassForm"
        disabled={loading}
        className={`flex-1 py-3 bg-[#0a1d3a] text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
          loading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#081627]"
        }`}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Saving...
          </>
        ) : (
          "Save"
        )}
      </button>
    </div>
  </div>
</div>
  );
}