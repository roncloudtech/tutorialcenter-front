import About from "./pages/public/About.jsx";
import Home from "./pages/public/Home.jsx";
import Career from "./pages/public/Career.jsx"
import Login from "./pages/public/Login.jsx";
import SignUp from "./pages/public/SignUp.jsx";
import { Route, Routes } from "react-router-dom";
import StudentRegistration from "./pages/public/StudentSignUp/StudentRegistration.jsx";
import StudentPhoneVerification from "./pages/public/StudentSignUp/StudentPhoneVerification.jsx";
import StudentEmailVerification from "./pages/public/StudentSignUp/StudentEmailVerification.jsx";
import StudentBiodata from "./pages/public/StudentSignUp/StudentBiodata.jsx";
import StudentTrainingSelection from "./pages/public/StudentSignUp/StudentTrainingSelection.jsx";
// import StudentTrainingDuration from "./pages/public/StudentSignUp/StudentTrainingDuration.jsx";
// import StudentPaymentSelection from "./pages/public/StudentSignUp/StudentPaymentSelection.jsx";
import { StudentSubjectSelection } from "./pages/public/StudentSignUp/StudentSubjectSelection.jsx";
import { StudentPaymentSuccessScreen } from "./pages/public/StudentSignUp/StudentPaymentSuccessScreen.jsx";

import { GuardianRegistration } from "./pages/public/GuardianSignup/GuardianRegistration.jsx";
import GuardianPhoneVerification from "./pages/public/GuardianSignup/GuardianPhoneVerification.jsx";
import GuardianEmailVerification from "./pages/public/GuardianSignup/GuardianEmailVerification.jsx";
import GuardianAddStudents from "./pages/public/GuardianSignup/GuardianAddStudents.jsx";
import AddedStudentOTP from "./pages/public/GuardianSignup/AddedStudentOTP.jsx";
import GuardianAddedStudentBiodata from "./pages/public/GuardianSignup/GuardianAddedStudentBiodata.jsx";
import GuardianTrainingSelection from "./pages/public/GuardianSignup/GuardianTrainingSelection.jsx";
import GuardianSubjectSelection from "./pages/public/GuardianSignup/GuardianSubjectSelection.jsx";
import GuardianTrainingDuration from "./pages/public/GuardianSignup/GuardianTrainingDuration.jsx";
import GuardianTrainingPayment from "./pages/public/GuardianSignup/GuardianTrainingPayment.jsx";

import { StudentTrainingDuration } from "./pages/public/StudentSignUp/StudentTrainingDuration.jsx";
import { StudentTrainingPayment } from "./pages/public/StudentSignUp/StudentTrainingPayment.jsx";
import StudentLogin from "./pages/public/StudentLogin.jsx";
import StudentDashboard from "./pages/students/StudentDashboard.jsx";
import ComingSoon from "./pages/public/ComingSoon.jsx";
import Unauthorized from "./pages/public/Unauthorized.jsx";
import NotFound from "./pages/public/NotFound.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import StaffLogin from "./pages/public/StaffLogin.jsx";
import StudentCalendar from "./pages/students/StudentCalendar.jsx";
import StaffDashboard from "./pages/staff/StaffDashboard.jsx";
import StaffManagement from "./pages/staff/StaffManagement.jsx";
import StaffMasterClassList from "./pages/staff/StaffMasterClassList.jsx";
import StudentPaymentHistory from "./pages/students/StudentPaymentDisplay.jsx"


function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/career" element={<Career/>} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/comingsoon" element={<ComingSoon />} />
        <Route path="/staff/login" element={<StaffLogin />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Guardian Registration Routes */}
        <Route path="/register/guardian" element={<GuardianRegistration />} />
        <Route path="/register/guardian/phone/verify" element={<GuardianPhoneVerification />} />
        <Route path="/register/guardian/email/verify" element={<GuardianEmailVerification />} />
        <Route path="/register/guardian/addstudent" element={<GuardianAddStudents />} />
        <Route path="/register/guardian/student/otp-verification" element={<AddedStudentOTP />} />
        <Route path="/register/guardian/student/biodata" element={<GuardianAddedStudentBiodata />} />
        <Route path="/register/guardian/training/selection" element={<GuardianTrainingSelection />} />
        <Route path="/register/guardian/subject/selection" element={<GuardianSubjectSelection />} />
        <Route path="/register/guardian/training/duration" element={<GuardianTrainingDuration />} />
        <Route path="/register/guardian/training/payment" element={<GuardianTrainingPayment />} />

        {/* Student Public Registration Routes */}
        <Route path="/student/login" element={<StudentLogin />} />
        {/* <Route path="/student/dashboard" element={<StudentDashboard/> }/> */}
        <Route path="/register/student" element={<StudentRegistration />} />
        <Route path="/register/student/biodata" element={<StudentBiodata />} />
        <Route path="/register/student/phone/verify" element={<StudentPhoneVerification />} />
        <Route path="/register/student/email/verify" element={<StudentEmailVerification />} />
        <Route path="/register/student/training/selection" element={<StudentTrainingSelection />} />
        <Route path="/register/student/subject/selection" element={<StudentSubjectSelection />} />
        <Route path="/register/student/training/duration" element={<StudentTrainingDuration />} />
        <Route path="/register/student/training/payment" element={<StudentTrainingPayment />} />
        <Route path="/register/student/training/payment/success" element={<StudentPaymentSuccessScreen />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/calendar" element={<StudentCalendar />} />
          <Route path="/student/payment-history" element={<StudentPaymentHistory />} />

          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/manage-staffs" element={<StaffManagement />} />
          <Route path="/staff/master-class" element={<StaffMasterClassList />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
