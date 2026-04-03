import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GoogleMeetSessions from '../../components/private/Students/GoogleMeetSessions';

export default function StudentMeetWrapper() {
  const location = useLocation();
  const navigate = useNavigate();
  const { student, loading } = useAuth();
  
  const [sessionDetails, setSessionDetails] = useState(null);

  useEffect(() => {
    if (loading) return;

    // Check if we arrived via routing state with the necessary details
    const state = location.state;
    if (!state || !state.class_link || !state.class_schedule_id) {
        // Fallback or unauthorized approach if accessed directly without props
        navigate('/student/class-schedule', { replace: true });
        return;
    }

    // student ID can be accessed directly from context or fallback to localStorage
    const storedStudentInfo = localStorage.getItem("student_info") || localStorage.getItem("studentdata");
    let studentId = student?.id;
    if (!studentId && storedStudentInfo) {
       try {
           const parsed = JSON.parse(storedStudentInfo);
           studentId = parsed.id || parsed.student_id || parsed.data?.id;
       } catch (e) {}
    }

    if (!studentId) {
        console.error("No student ID available for tracking.");
        navigate('/student/login', { replace: true });
        return;
    }

    setSessionDetails({
      class_link: state.class_link,
      class_schedule_id: state.class_schedule_id,
      studentId: studentId
    });
  }, [location, navigate, student, loading]);

  if (loading || !sessionDetails) {
      return (
          <div className="w-screen h-screen flex items-center justify-center bg-gray-900 text-white">
              <span className="font-bold tracking-widest text-[#BB9E7F] animate-pulse">Loading secure session...</span>
          </div>
      );
  }

  return (
    <GoogleMeetSessions 
      class_link={sessionDetails.class_link}
      class_schedule_id={sessionDetails.class_schedule_id}
      studentId={sessionDetails.studentId}
    />
  );
}
