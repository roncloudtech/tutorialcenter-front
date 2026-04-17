import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {  
  ChevronLeftIcon
} from "@heroicons/react/24/outline";
import SubjectSelectionModal from "./SubjectSelectionModal";
import ReviewSelectionModal from "./ReviewSelectionModal";
import TrainingDurationModal from "./TrainingDurationModal";
import PaymentMethodModal from "./PaymentMethodModal";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

export default function AddTraining({ onBack, onSuccess }) {
  const [courses, setCourses] = useState([]);
  const [activeEnrollments, setActiveEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [currentStep, setCurrentStep] = useState("selection"); // selection, subjects, review, duration, payment
  
  // Modal Data
  const [subjectsByCourse, setSubjectsByCourse] = useState({});
  const [selectedSubjects, setSelectedSubjects] = useState({});
  const [selectedDurations, setSelectedDurations] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [processing, setProcessing] = useState(false);
  
  const token = localStorage.getItem("student_token");

  // Student Context
  const student = useMemo(() => {
    try {
      const storedData = JSON.parse(localStorage.getItem("studentdata"));
      const storedInfo = JSON.parse(localStorage.getItem("student_info"));
      return storedInfo || storedData?.data || storedInfo?.data || null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [allCoursesRes, activeRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/courses`),
          axios.get(`${API_BASE_URL}/api/students/courses`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const allCourses = allCoursesRes.data.data || allCoursesRes.data.courses || [];
        const enrolled = activeRes.data.courses || activeRes.data.data || [];
        
        // Extract IDs of active/ongoing courses
        const activeIds = enrolled
          .filter(e => e.status?.toLowerCase() !== 'cancelled' && e.status?.toLowerCase() !== 'removed')
          .map(e => Number(e.course_id));

        setCourses(allCourses);
        setActiveEnrollments(activeIds);
      } catch (err) {
        console.error("Failed to fetch courses", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const toggleCourseSelection = (course) => {
    setSelectedCourses(prev => {
      const isSelected = prev.find(c => c.id === course.id);
      if (isSelected) {
        return prev.filter(c => c.id !== course.id);
      }
      return [...prev, course];
    });
  };

  const handlePaymentSuccess = async (response) => {
    if (!student || !selectedCourses.length) return;
    setProcessing(true);

    try {
      const studentId = student.id;
      
      // Sequential Enrollment/Payment Logic
      for (const course of selectedCourses) {
        const duration = selectedDurations[course.id];
        
        // 1. Course Enrollment
        const enrollRes = await axios.post(`${API_BASE_URL}/api/course/enrollment`, {
          student_id: studentId,
          course_id: course.id,
          billing_cycle: duration.duration
        });
        const enrollmentId = enrollRes.data.enrollment.id;

        // 2. Subject Enrollment
        const subjectIds = selectedSubjects[course.id] || [];
        for (const subId of subjectIds) {
          await axios.post(`${API_BASE_URL}/api/subject/enrollment`, {
            student_id: studentId,
            course_enrollment_id: enrollmentId,
            subject_id: subId
          });
        }

        // 3. Payment Record
        await axios.post(`${API_BASE_URL}/api/payments`, {
          student_id: studentId,
          course_enrollment_id: enrollmentId,
          amount: duration.price,
          billing_cycle: duration.duration,
          payment_method: "card",
          gateway: selectedPaymentMethod,
          status: "successful",
          gateway_reference: response?.reference || `ADD-${Date.now()}-${course.id}`,
          paid_at: new Date().toISOString(),
          email: student?.email
        });
      }

      if (onSuccess) {
        onSuccess("Training added successfully!");
      } else {
        onBack(); // Return to main view
      }
    } catch (err) {
      console.error("Enrollment failed", err);
      alert("Something went wrong during enrollment. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden pt-4">

      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-8 group w-fit"
      >
        <ChevronLeftIcon className="w-4 h-4 text-gray-500 group-hover:text-[#0F2843] transition-colors" />
        <span className="text-sm text-gray-500 group-hover:text-[#0F2843] transition-colors">
          Back / <span className="font-bold text-[#0F2843]">Add Training</span>
        </span>
      </button>

      <div className="flex-1 bg-white rounded-[32px] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-50 overflow-y-auto custom-scrollbar">
        <p className="text-sm text-gray-500 mb-8 max-w-md">
          Select the examinations you're about to write, you have the option of selection more than 1 examination.
        </p>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#09314F]/10 border-t-[#09314F] rounded-full animate-spin mb-4" />
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest animate-pulse">Loading available courses...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {courses.map((course) => {
              const isSelected = selectedCourses.find(c => c.id === course.id);
              const isEnrolled = activeEnrollments.includes(Number(course.id));

              return (
                <button
                  key={course.id}
                  disabled={isEnrolled}
                  onClick={() => toggleCourseSelection(course)}
                  className={`relative h-24 rounded-xl border-none transition-all duration-300 text-center flex items-center justify-center group ${
                    isEnrolled
                      ? "bg-gray-100 cursor-not-allowed opacity-50"
                      : isSelected 
                        ? "bg-[#76D287] shadow-lg scale-[1.02]" 
                        : "bg-[#D1D5DB] hover:bg-gray-300"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center w-full px-4">
                    <span className={`text-sm font-black uppercase tracking-widest transition-colors ${isEnrolled ? "text-gray-300" : "text-[#0F2843]"}`}>
                      {course.title}
                    </span>
                    {isEnrolled && (
                      <span className="mt-1 text-[8px] font-black uppercase text-gray-400">
                        Enrolled
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {selectedCourses.length > 0 && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setCurrentStep("subjects")}
              className="w-full py-5 px-10 rounded-xl font-black text-lg text-white bg-[#0F2843] shadow-xl hover:shadow-[#0F284344] transition-all hover:scale-[1.01] active:scale-[0.98]"
            >
              Continue
            </button>
          </div>
        )}
      </div>

      {/* Shared Modals */}
      <SubjectSelectionModal
        isOpen={currentStep === "subjects"}
        onClose={() => setCurrentStep("selection")}
        selectedCourses={selectedCourses}
        department={student?.department || "science"}
        onContinue={(subs, allSubs) => {
          setSelectedSubjects(subs);
          setSubjectsByCourse(allSubs);
          setCurrentStep("review");
        }}
      />

      <ReviewSelectionModal
        isOpen={currentStep === "review"}
        onClose={() => setCurrentStep("selection")}
        selectedCourses={selectedCourses}
        selectedSubjects={selectedSubjects}
        subjectsByCourse={subjectsByCourse}
        onEdit={() => setCurrentStep("subjects")}
        onContinue={() => setCurrentStep("duration")}
      />

      <TrainingDurationModal
        isOpen={currentStep === "duration"}
        onClose={() => setCurrentStep("selection")}
        selectedCourses={selectedCourses}
        onContinue={(durs, total) => {
          setSelectedDurations(durs);
          setTotalAmount(total);
          setCurrentStep("payment");
        }}
      />

      <PaymentMethodModal
        isOpen={currentStep === "payment"}
        onClose={() => setCurrentStep("selection")}
        amount={totalAmount}
        email={student?.email}
        selectedMethod={selectedPaymentMethod}
        setSelectedMethod={setSelectedPaymentMethod}
        loading={processing}
        onContinue={handlePaymentSuccess}
      />
    </div>
  );
}
