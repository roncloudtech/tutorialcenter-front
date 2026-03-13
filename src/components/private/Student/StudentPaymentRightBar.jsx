// components/private/Student/StudentPaymentRightBar.jsx

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

export default function StudentPaymentRightBar({ onPaymentAdded }) {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({
    course: "",
    department: "",
    subjects: Array(9).fill(""),
    duration: ""
  });
  const [errors, setErrors] = useState({});

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
  const token = localStorage.getItem("student_token");

  const durations = ["Weekly", "Monthly", "Quarterly", "Semi-Annually", "Annually"];

  const fetchEnrolledCourses = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/students/courses`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log("Enrolled courses response:", response.data);
      
      const fetchedCourses = response.data.courses || response.data.data || [];
      setCourses(Array.isArray(fetchedCourses) ? fetchedCourses : []);
    } catch (error) {
      console.error("Failed to fetch enrolled courses:", error);
    }
  }, [API_BASE_URL, token]);

  useEffect(() => {
    fetchEnrolledCourses();
  }, [fetchEnrolledCourses]);

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    const course = courses.find(c => c.id === parseInt(courseId));
    
    setSelectedCourse(course);
    setFormData({
      ...formData,
      course: courseId,
      department: course?.department || "",
      subjects: Array(9).fill("")
    });
  };

  const handleDepartmentChange = (e) => {
    setFormData({
      ...formData,
      department: e.target.value,
      subjects: Array(9).fill("")
    });
  };

  const handleSubjectChange = (index, value) => {
    const newSubjects = [...formData.subjects];
    newSubjects[index] = value;
    setFormData({
      ...formData,
      subjects: newSubjects
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.course) newErrors.course = "Course is required";
    if (!formData.department) newErrors.department = "Department is required";
    
    const selectedSubjects = formData.subjects.filter(s => s !== "");
    if (selectedSubjects.length === 0) {
      newErrors.subjects = "Select at least one subject";
    }
    
    if (!formData.duration) newErrors.duration = "Duration is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const selectedSubjects = formData.subjects.filter(s => s !== "");
      
      const payload = {
        course_id: parseInt(formData.course),
        department: formData.department,
        subjects: selectedSubjects,
        billing_cycle: formData.duration.toLowerCase()
      };

      console.log("Payment payload:", payload);

      // TODO: Replace with actual payment endpoint
      alert("Payment renewal initiated! (TODO: Implement payment gateway)");
      
      setFormData({
        course: "",
        department: "",
        subjects: Array(9).fill(""),
        duration: ""
      });
      setSelectedCourse(null);
      
      if (onPaymentAdded) {
        onPaymentAdded();
      }

    } catch (error) {
      console.error("Payment failed:", error);
      alert(error.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getAvailableSubjects = () => {
    if (!selectedCourse || !formData.department) return [];
    
    return selectedCourse.subjects?.filter(
      s => s.department === formData.department
    ) || [];
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="bg-[#C9A882] text-white px-4 py-3 rounded-lg mb-6">
        <h3 className="font-bold text-center">Add Course</h3>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Course Dropdown */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Course
          </label>
          <select
            value={formData.course}
            onChange={handleCourseChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#09314F] focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
              errors.course ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select Course</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.title || course.name}
              </option>
            ))}
          </select>
          {errors.course && <p className="text-red-500 text-xs mt-1">{errors.course}</p>}
        </div>

        {/* Department Dropdown */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Department
          </label>
          <select
            value={formData.department}
            onChange={handleDepartmentChange}
            disabled={!formData.course}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#09314F] focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
              errors.department ? "border-red-500" : "border-gray-300"
            } disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed`}
          >
            <option value="">Select Department</option>
            <option value="art">Art</option>
            <option value="science">Science</option>
            <option value="commercial">Commercial</option>
          </select>
          {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
        </div>

        {/* Subjects Label */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Subjects
          </label>
        </div>

        {/* 9 Subject Dropdowns */}
        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
          {formData.subjects.map((subject, index) => (
            <select
              key={index}
              value={subject}
              onChange={(e) => handleSubjectChange(index, e.target.value)}
              disabled={!formData.department}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#09314F] focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
            >
              <option value="">Select Subject</option>
              {getAvailableSubjects().map(subj => (
                <option 
                  key={subj.id} 
                  value={subj.id}
                  disabled={formData.subjects.includes(subj.id.toString()) && formData.subjects[index] !== subj.id.toString()}
                >
                  {subj.name}
                </option>
              ))}
            </select>
          ))}
        </div>
        {errors.subjects && <p className="text-red-500 text-xs mt-1">{errors.subjects}</p>}

        {/* Duration Dropdown */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Duration
          </label>
          <select
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#09314F] focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
              errors.duration ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select Duration</option>
            {durations.map(duration => (
              <option key={duration} value={duration}>
                {duration}
              </option>
            ))}
          </select>
          {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration}</p>}
        </div>

        {/* Add Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 rounded-lg font-bold text-white transition-all ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#09314F] hover:bg-opacity-90 active:scale-95"
          }`}
        >
          {loading ? "Processing..." : "Add"}
        </button>
      </form>
    </div>
  );
}
