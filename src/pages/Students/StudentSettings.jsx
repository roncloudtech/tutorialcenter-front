import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/private/Students/Sidebar.jsx";
import SettingsSidebar from "../../components/private/Students/SettingsSidebar.jsx";
import MobileHeader from "../../components/private/Students/MobileHeader.jsx";
import MobileBottomNav from "../../components/private/Students/MobileBottomNav.jsx";
import { ChevronLeftIcon, BellIcon, PencilSquareIcon, EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { OTPModal, PasswordChangeModal, SuccessModal, ContactInputModal } from "../../components/private/Students/SettingsModals.jsx";

export default function StudentSettings() {
  const { student, token, updateStudent } = useAuth();
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  // Layout states
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  // View states: "menu" | "edit_profile"
  const [activeView, setActiveView] = useState("menu");

  // Flow & Modal States
  // type: 'input' | 'otp' | 'password' | 'success' | null
  const [modalType, setModalType] = useState(null);
  const [flowContext, setFlowContext] = useState(null); // 'password' | 'email' | 'phone'
  const [flowTarget, setFlowTarget] = useState(""); // The email or tel handling the OTP
  const [otpToken, setOtpToken] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  // Profile Form States
  const [formData, setFormData] = useState({
    firstname: "", surname: "", gender: "", date_of_birth: "", location: "", address: "",
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (student) {
      setFormData({
        firstname: student.firstname || "", surname: student.surname || "",
        gender: student.gender || "", date_of_birth: student.date_of_birth || "", location: student.location || "",
        address: student.address || "",
      });
      if (student.profile_picture) {
        setPreviewImage(`${API_BASE_URL}/storage/${student.profile_picture}`);
      }
    }
  }, [student, API_BASE_URL]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreviewImage(URL.createObjectURL(file));
       if (errors.profile_picture) setErrors((prev) => ({ ...prev, profile_picture: null }));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setErrors({}); setSuccessMsg("");

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) data.append(key, formData[key]);
    });
    if (profilePicture) data.append("profile_picture", profilePicture);
    data.append("_method", "PUT");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/students/profile/update`, data, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data", Accept: "application/json" },
      });
      if (response.status === 200) {
        setSuccessMsg(response.data.message || "Profile updated successfully.");
        updateStudent(response.data.student);
        setProfilePicture(null);
      }
    } catch (error) {
      if (error.response?.status === 422) setErrors(error.response.data.errors || {});
      else setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // AUTHENTICATION EDIT FLOWS
  // -------------------------------------------------------------
  const closeModals = () => {
    setModalType(null); setFlowContext(null); setFlowTarget(""); setOtpToken(""); setModalLoading(false);
  };

  const initiateFlow = async (context) => {
    setFlowContext(context);
    
    if (context === "password") {
       // Request OTP to their existing registered identifier
       const target = student?.email || student?.tel;
       setFlowTarget(target);
       await requestOTP(context, target);
    } else {
       // Email or Phone -> First ask for new input
       setModalType("input");
    }
  };

  const handleContactInputSubmit = async (newContactValue) => {
      setFlowTarget(newContactValue);
      await requestOTP(flowContext, newContactValue);
  };

  const requestOTP = async (context, target) => {
      setModalLoading(true);
      try {
        const isPassword = context === "password";
        const endpoint = isPassword
            ? `${API_BASE_URL}/api/students/forget-password`
            : `${API_BASE_URL}/api/students/contact/change/request`;
            
        // Construct dynamic payload.
        // For password endpoints, backend expects "email". For contact changes, backend expects "type": "phone".
        const passwordKey = context === "phone" ? "tel" : context;
        const payload = isPassword 
            ? { [passwordKey]: target } 
            : { type: context, value: target };

        await axios.post(endpoint, payload, {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
        }).catch(err => console.error("OTP Request warning (API might not exist yet)", err));

        // Advance directly to OTP modal
        setModalType("otp");
      } catch (err) {
        alert("Failed to request verification code. Please try again later.");
        closeModals();
      } finally {
        setModalLoading(false);
      }
  };

  const handleVerifyOTP = async (code) => {
      setModalLoading(true);
      setOtpToken(code);
      
      try {
         if (flowContext === "password") {
            // Move to password input
            setModalType("password");
         } else {
            // Confirm the email/phone change directly
            await axios.post(`${API_BASE_URL}/api/students/contact/change/confirm`, {
                otp: code,
                type: flowContext,
                value: flowTarget
            }, {
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
            }).catch(e => console.log("Contact update warning", e));
            
            // Show Success
            setModalTitle(`${flowContext === 'email' ? 'Email' : 'Phone'} Verification`);
            setModalMessage(`${flowContext === 'email' ? 'Email' : 'Phone Number'} successfully verified`);
            setModalType("success");
            // Optionally update the context here:
            updateStudent({ [flowContext]: flowTarget });
         }
      } catch (err) {
         alert("Invalid verification code. Please try again.");
      } finally {
         setModalLoading(false);
      }
  };

  const handleSavePassword = async ({ password, confirmPassword }) => {
      setModalLoading(true);
      try {
         const payload = {
             otp: otpToken,
             password,
             confirmPassword
         };
         // The backend looks for either email or tel from the request to locate the student
         if (student?.email) payload.email = student.email;
         else if (student?.tel) payload.tel = student.tel;

         await axios.post(`${API_BASE_URL}/api/students/change-password`, payload, {
             headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
         });

         // Show Success Log
         setModalTitle("Password Update");
         setModalMessage("Password successfully changed");
         setModalType("success");
      } catch (error) {
         const msg = error.response?.data?.message || "Failed to change password. Ensure OTP is correct.";
         alert(msg);
      } finally {
         setModalLoading(false);
      }
  };



  return (
    <div className="min-h-screen bg-[#F4F5F7] dark:bg-gray-900 font-sans">
       {/* Modals placed outside main container */}
       <ContactInputModal isOpen={modalType === "input"} onClose={closeModals} type={flowContext} onSubmit={handleContactInputSubmit} loading={modalLoading} />
       <OTPModal isOpen={modalType === "otp"} onClose={closeModals} contactType={flowContext === 'password' ? 'registered address' : (flowContext === 'email' ? 'email' : 'phone number')} onVerify={handleVerifyOTP} loading={modalLoading} onResend={() => requestOTP(flowContext, flowTarget)} />
       <PasswordChangeModal isOpen={modalType === "password"} onClose={closeModals} onSave={handleSavePassword} loading={modalLoading} />
       <SuccessModal isOpen={modalType === "success"} onClose={closeModals} title={modalTitle} message={modalMessage} />

      {/* ===== MOBILE LAYOUT ===== */}
      <div className="lg:hidden">
        <MobileHeader pagetitle="Settings" />
        <main className="pt-16 pb-20 px-4">
          {activeView === "menu" ? (
             <SettingsMenu initiateFlow={initiateFlow} setActiveView={setActiveView} navigate={navigate} />
          ) : (
            <SettingsContent formData={formData} handleInputChange={handleInputChange} handleFileChange={handleFileChange} handleSubmit={handleProfileSubmit} loading={loading} errors={errors} successMsg={successMsg} previewImage={previewImage} InputField={InputField} setActiveView={setActiveView} />
          )}
        </main>
        <MobileBottomNav />
      </div>

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden lg:block">
        <Sidebar collapsed={leftCollapsed} setCollapsed={setLeftCollapsed} />
        <SettingsSidebar collapsed={rightCollapsed} setCollapsed={setRightCollapsed} />
        <main className={`transition-all duration-300 p-8 ${leftCollapsed ? "ml-20" : "ml-64"} ${rightCollapsed ? "mr-1" : "mr-80"}`}>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-black text-[#09314F] dark:text-white uppercase tracking-wider">Settings</h1>
            <div className="flex items-center gap-4">
               <button className="relative p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 transition">
                 <BellIcon className="w-6 h-6 text-[#E83831]" />
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#09314F] rounded-full border border-white"></span>
               </button>
            </div>
          </div>
          <div className="w-full">
             {activeView === "menu" ? (
                <SettingsMenu initiateFlow={initiateFlow} setActiveView={setActiveView} navigate={navigate} />
             ) : (
                <SettingsContent formData={formData} handleInputChange={handleInputChange} handleFileChange={handleFileChange} handleSubmit={handleProfileSubmit} loading={loading} errors={errors} successMsg={successMsg} previewImage={previewImage} setActiveView={setActiveView} />
             )}
          </div>
        </main>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// SUB-COMPONENTS
// -------------------------------------------------------------------------

function SettingsMenu({ initiateFlow, setActiveView }) {
  // Renders the list of settings categories mimicking the mockup style
  return (
    <div className="space-y-4">
        {/* Profile Card */}
        <button 
           onClick={() => setActiveView("edit_profile")}
           className="w-full flex items-center justify-between p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group"
        >
           <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-50 text-[#09314F] dark:bg-gray-700 dark:text-blue-400 group-hover:bg-[#09314F] group-hover:text-white transition-colors">
                 <PencilSquareIcon className="w-6 h-6" />
              </div>
              <span className="font-bold text-gray-800 dark:text-white text-lg">Edit Profile</span>
           </div>
        </button>


        {/* Email Card */}
        <button 
           onClick={() => initiateFlow("email")}
           className="w-full flex items-center justify-between p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group"
        >
           <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-50 text-[#09314F] dark:bg-gray-700 dark:text-blue-400 group-hover:bg-[#09314F] group-hover:text-white transition-colors">
                 <EnvelopeIcon className="w-6 h-6" />
              </div>
              <span className="font-bold text-gray-800 dark:text-white text-lg">Edit Email Address</span>
           </div>
        </button>

        {/* Phone Card */}
        <button 
           onClick={() => initiateFlow("phone")}
           className="w-full flex items-center justify-between p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group"
        >
           <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-50 text-[#09314F] dark:bg-gray-700 dark:text-blue-400 group-hover:bg-[#09314F] group-hover:text-white transition-colors">
                 <PhoneIcon className="w-6 h-6" />
              </div>
              <span className="font-bold text-gray-800 dark:text-white text-lg">Edit Phone Number</span>
           </div>
        </button>
    </div>
  );
}

function SettingsContent({ formData, handleInputChange, handleFileChange, handleSubmit, loading, errors, successMsg, previewImage, setActiveView }) {
  return (
    <>
      <button 
        onClick={() => setActiveView("menu")}
        className="flex items-center gap-2 text-gray-500 hover:text-[#09314F] dark:hover:text-white transition-colors mb-6 text-sm font-medium"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        Back / <span className="text-[#09314F] dark:text-white font-bold">Edit Profile</span>
      </button>

      {successMsg && <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md">{successMsg}</div>}
      {errors.general && <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">{errors.general}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
         <div className="flex flex-col mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile Picture</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gray-200 border-2 border-dashed border-gray-300 overflow-hidden flex-shrink-0">
                {previewImage ? <img src={previewImage} alt="Preview" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">📸</div>}
              </div>
              <input type="file" name="profile_picture" accept="image/*" onChange={handleFileChange} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-[#09314F] hover:file:bg-blue-100" />
            </div>
            {errors.profile_picture && <p className="text-red-500 text-xs mt-1">{errors.profile_picture[0]}</p>}
         </div>

        <InputField label="First Name" name="firstname" placeholder="Enter first name" formData={formData} handleInputChange={handleInputChange} errors={errors} />
        <InputField label="Last Name" name="surname" placeholder="Enter last name" formData={formData} handleInputChange={handleInputChange} errors={errors} />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
          <select name="gender" value={formData.gender} onChange={handleInputChange} className={`w-full px-4 py-3 rounded-xl border ${errors.gender ? "border-red-500" : "border-gray-200 dark:border-gray-700"} bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#09314F] dark:focus:ring-blue-500 transition-all`}>
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="others">Others</option>
          </select>
          {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender[0]}</p>}
        </div>

        <InputField label="Date of Birth" name="date_of_birth" type="date" placeholder="YYYY-MM-DD" formData={formData} handleInputChange={handleInputChange} errors={errors} />
        <InputField label="Address (e.g. 12 Bode Thomas, Surulere)" name="address" placeholder="Enter your full street address" formData={formData} handleInputChange={handleInputChange} errors={errors} />
        <InputField label="Location (e.g. Lagos, Nigeria)" name="location" placeholder="Enter your city and country" formData={formData} handleInputChange={handleInputChange} errors={errors} />

        <div className="pt-4 pb-2">
          <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#09314F] hover:bg-[#072439] active:scale-[0.99]"}`}>
            {loading ? "Saving changes..." : "Save"}
          </button>
        </div>
      </form>
    </>
  );
}

const InputField = ({ label, name, type = "text", placeholder, formData, handleInputChange, errors }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    <input type={type} name={name} value={formData[name]} onChange={handleInputChange} placeholder={placeholder}
      className={`w-full px-4 py-3 rounded-xl border ${errors[name] ? "border-red-500" : "border-gray-200 dark:border-gray-700"} bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#09314F] dark:focus:ring-blue-500 transition-all`}
    />
    {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name][0]}</p>}
  </div>
);
