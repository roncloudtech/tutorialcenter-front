// pages/Admin/MasterClass/MasterClassList.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import StaffDashboardLayout from "../../components/private/staffs/DashboardLayout.jsx";
import CreateMasterClassModal from "../../components/private/staffs/MasterclassModal.jsx";
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";

export default function MasterClassList() {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Today");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
  const token = localStorage.getItem("staff_token");
  console.log("EXACT TOKEN:", token);

  // --- FETCHING LOGIC ---
  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      // 🛡️ THE FIX: Removed /create. GET requests usually go to the base /classes endpoint to list them.
      const response = await axios.post(`${API_BASE_URL}/api/admin/classes/create`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      
      console.log("SUCCESS API Response:", response.data); 
      
      const fetchedClasses = response.data.data || response.data.classes;
      
      if (Array.isArray(fetchedClasses)) {
        setClasses(fetchedClasses);
      } else {
        setClasses([]);
      }

    } catch (error) {
      console.error("Endpoint failed:", error.response?.status, error.response?.data);
      setClasses([]); 
      setToast({
        type: "error",
        message: "Failed to load classes."
      });
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  // Fetch classes on component mount
  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // --- FILTERING LOGIC ---
  const filteredClasses = useMemo(() => {
    if (!Array.isArray(classes)) {
      console.warn("Expected 'classes' to be an array, but got:", classes);
      return []; 
    }

    let filtered = classes;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(cls => {
        const titleMatch = cls.title?.toLowerCase().includes(searchQuery.toLowerCase());
        const descMatch = cls.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return titleMatch || descMatch;
      });
    }

    // Filter by tab (Today/Other)
    if (activeTab === "Today") {
      filtered = filtered.filter(cls => {
        return cls.schedules?.some(schedule => {
          const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
          return schedule.day_of_week === dayOfWeek;
        });
      });
    }

    return filtered;
  }, [classes, searchQuery, activeTab]);

  // --- HANDLERS ---
  const handleExportStudents = () => {
    console.log("Exporting students...");
  };

  // --- RENDER ---
  return (
    <StaffDashboardLayout>
      {/* Toast Notification */}
      {toast && (
        <div 
          className={`fixed top-5 right-5 z-50 px-6 py-4 rounded-2xl shadow-2xl text-white transition-all duration-500 ${
            toast.type === "success" ? "bg-[#76D287]" : "bg-[#E83831]"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-1 bg-white/20 rounded-full">
              {toast.type === "success" ? "✓" : "✕"}
            </div>
            <p className="font-bold text-sm">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Create Class Modal */}
      {showCreateModal && (
        <CreateMasterClassModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchClasses();
            setToast({
              type: "success",
              message: "Master class created successfully!"
            });
          }}
        />
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-[#09314F]">MASTER CLASS</h1>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#09314F] to-[#E83831] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              <PlusIcon className="w-5 h-5" />
              Schedule Master Class
            </button>

            <button
              onClick={handleExportStudents}
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#09314F] text-[#09314F] font-bold rounded-xl hover:bg-gray-50 transition-all active:scale-95"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              Students
            </button>
          </div>
        </div>

        {/* Search and Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-96">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by class"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#09314F] focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            {["Today", "Other"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg font-bold transition-all ${
                  activeTab === tab
                    ? "bg-white text-[#09314F] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Classes List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#09314F] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading classes...</p>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No classes found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-6 py-3 bg-[#09314F] text-white font-bold rounded-xl hover:bg-opacity-90"
            >
              Create Your First Class
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredClasses.map(cls => (
              <div
                key={cls.id}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => navigate(`/admin/classes/${cls.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg uppercase">
                        MC
                      </span>
                      <h3 className="text-xl font-black text-[#09314F]">
                        {cls.title}
                      </h3>
                    </div>

                    <p className="text-gray-600 mb-4">{cls.description}</p>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <UserGroupIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          Instructors Assigned
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {new Date(cls.start_date).toLocaleDateString()} - {new Date(cls.end_date).toLocaleDateString()}
                        </span>
                      </div>

                      {cls.schedules && cls.schedules[0] && (
                        <div className="flex items-center gap-2">
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {cls.schedules[0].start_time}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`px-4 py-2 rounded-lg font-bold text-sm ${
                    cls.status === 'active' 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {cls.status === 'active' ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StaffDashboardLayout>
  );
}