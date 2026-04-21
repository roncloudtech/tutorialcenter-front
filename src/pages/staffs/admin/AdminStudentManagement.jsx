import React, { useState, useEffect, useCallback } from "react";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import AdminStudentViewModal from "../../../components/private/staffs/AdminStudentViewModal.jsx";
import { Icon } from "@iconify/react";
import axios from "axios";
import { 
  MagnifyingGlassIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  UserGroupIcon as UserGroupOutline,
  CheckCircleIcon,
  NoSymbolIcon,
  EyeIcon
} from "@heroicons/react/24/outline";

export default function AdminStudentManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [stats, setStats] = useState([
    { label: "Total Students", value: 0, badge: "New", icon: <UserGroupOutline className="w-6 h-6 text-[#09314F]" /> },
    { label: "Active Students", value: 0, badge: "Online", icon: <CheckCircleIcon className="w-6 h-6 text-[#76D287]" /> },
    { label: "Inactive Students", value: 0, badge: "Offline", icon: <UserGroupOutline className="w-6 h-6 text-[#F5A623]" /> },
    { label: "Suspended", value: 0, badge: null, icon: <NoSymbolIcon className="w-6 h-6 text-[#E83831]" /> },
  ]);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
  const token = localStorage.getItem("staff_token");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const config = {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      };

      const res = await axios.get(`${API_BASE_URL}/api/admin/students/all`, config);
      console.log("[AdminStudentManagement] Fetch results:", res.data);
      const fetchedStudents = res.data?.students || res.data?.data || [];
      const studentsArray = Array.isArray(fetchedStudents) ? fetchedStudents : [];
      
      setStudents(studentsArray);
      calculateStats(studentsArray);
    } catch (error) {
      console.error("Failed to fetch students:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  const calculateStats = (allStudents) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const newStudentsThisMonth = allStudents.filter(s => {
      if (!s.created_at) return false;
      const date = new Date(s.created_at);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const activeCount = allStudents.filter(s => s.account_status === "active").length;
    const inactiveCount = allStudents.filter(s => s.account_status === "inactive").length;
    const suspendedCount = allStudents.filter(s => s.banned === 1 || s.account_status === "suspended").length;

    setStats(prev => [
      { ...prev[0], value: allStudents.length, badge: `+${newStudentsThisMonth.length} New` },
      { ...prev[1], value: activeCount || allStudents.length, badge: "Active" }, 
      { ...prev[2], value: inactiveCount, badge: "Inactive" },
      { ...prev[3], value: suspendedCount, badge: `Suspended` },
    ]);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (studentId) => {
    setSelectedStudentId(studentId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudentId(null);
  };

  // Filter students
  const filteredStudents = students.filter(student => {
    const fullName = `${student.firstname || ''} ${student.surname || ''}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || (student.email && student.email.toLowerCase().includes(query));
  });

  // Pagination
  const itemsPerPage = 10;
  const currentStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusColor = (status, banned) => {
    if (banned === 1) return { bg: "bg-red-50", text: "text-red-600" };
    if (status === "active") return { bg: "bg-green-50", text: "text-green-600" };
    if (status === "inactive") return { bg: "bg-orange-50", text: "text-orange-600" };
    return { bg: "bg-gray-50", text: "text-gray-600" };
  };

  return (
    <StaffDashboardLayout pagetitle="Student Management">
      <div className="p-6 max-w-6xl mx-auto w-full min-h-screen bg-[#F8F9FA]">
        
        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-start relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-center justify-between w-full mb-4">
                <div className="p-2.5 bg-gray-50 rounded-xl group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                {stat.badge && (
                  <div className="px-2 py-1 bg-white border border-gray-100 rounded-lg text-[10px] font-black text-gray-400 uppercase">
                    {stat.badge}
                  </div>
                )}
              </div>
              <h4 className="text-xs font-bold text-gray-400 mb-1 tracking-tight">{stat.label}</h4>
              <div className="text-2xl font-black text-[#0F2843]">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-[#0F2843] focus:ring-2 focus:ring-[#0F2843] focus:border-transparent transition-all placeholder:text-gray-400 shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all disabled:opacity-50"
            >
               <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-xs font-bold text-[#0F2843] px-2">Page {currentPage} of {Math.ceil(filteredStudents.length / itemsPerPage) || 1}</span>
            <button 
              disabled={currentPage === Math.ceil(filteredStudents.length / itemsPerPage) || Math.ceil(filteredStudents.length / itemsPerPage) === 0}
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredStudents.length / itemsPerPage), prev + 1))}
              className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all disabled:opacity-50"
            >
               <ChevronRightIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6 min-h-[400px] flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#B99E7F] text-white">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap">Name</th>
                  <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-center whitespace-nowrap">Status</th>
                  <th className="px-4 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap">Email</th>
                  <th className="px-4 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap">Phone number</th>
                  <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-center whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan="6">
                      <div className="py-20 flex justify-center items-center">
                        <div className="w-8 h-8 border-4 border-[#B99E7F]/30 border-t-[#B99E7F] rounded-full animate-spin"></div>
                      </div>
                    </td>
                  </tr>
                ) : currentStudents.length > 0 ? (
                  currentStudents.map((student) => {
                    const statusColors = getStatusColor(student.account_status, student.banned);
                    const displayName = (student.firstname && student.surname)
                      ? `${student.firstname} ${student.surname}`.trim() 
                      : student.username || "Unknown Student";
                    
                    return (
                      <tr key={student.id} className="hover:bg-gray-50/50 transition-all group">
                        <td className="px-6 py-4 min-w-[200px]">
                          <div className="flex items-center gap-3">
                            {student.profile_picture ? (
                              <img src={`${API_BASE_URL}/storage/${student.profile_picture}`} alt="" className="w-10 h-10 rounded-full border border-gray-100 bg-gray-50 object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-[#0F2843] font-bold text-sm">
                                {displayName?.[0]?.toUpperCase() || "S"}
                              </div>
                            )}
                            <span className="text-sm font-bold text-[#0F2843] truncate block">{displayName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`text-[10px] font-black px-2.5 py-1 uppercase tracking-widest rounded-lg ${statusColors.bg} ${statusColors.text}`}>
                            {student.banned === 1 ? "Suspended" : (student.account_status || "Active")}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-gray-500 max-w-[150px] truncate block" title={student.email}>{student.email || "—"}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-gray-600">{student.tel || student.guardian?.tel || "—"}</span>
                        </td>
                        <td className="px-4 py-4 text-center cursor-pointer">
                           <button 
                             onClick={() => handleOpenModal(student.id)}
                             className="p-2 bg-gray-50 text-gray-400 hover:text-[#0F2843] hover:bg-gray-100 rounded-xl transition-all active:scale-95 inline-flex items-center justify-center"
                           >
                              <EyeIcon className="w-5 h-5" />
                           </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6">
                      <div className="py-20 flex flex-col items-center justify-center text-center">
                         <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <UserGroupOutline className="w-8 h-8 text-gray-300" />
                         </div>
                         <h3 className="text-lg font-bold text-[#0F2843] mb-1">No Students Found</h3>
                         <p className="text-sm text-gray-400">
                           {searchQuery ? "Try adjusting your search query." : "There are no students registered yet."}
                         </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
            <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
               <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-30"
               >
                  <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
               </button>
               
               {Array.from({ length: Math.ceil(filteredStudents.length / itemsPerPage) || 1 }, (_, i) => i + 1).map((num) => {
                 // Simple pagination logic to show max 5 pages around current
                 if (Math.ceil(filteredStudents.length / itemsPerPage) > 5) {
                   if (num !== 1 && num !== Math.ceil(filteredStudents.length / itemsPerPage) && Math.abs(num - currentPage) > 1) {
                     if (num === 2 || num === Math.ceil(filteredStudents.length / itemsPerPage) - 1) return <span key={num} className="px-2 text-gray-400">...</span>;
                     return null;
                   }
                 }
                 
                 return (
                 <button 
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={`min-w-[40px] h-10 rounded-lg text-xs font-black transition-all shadow-sm ${
                    currentPage === num 
                      ? "bg-[#B99E7F] text-white" 
                      : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
                  }`}
                 >
                   {num}
                 </button>
               )})}
               
               <button 
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredStudents.length / itemsPerPage), prev + 1))}
                  disabled={currentPage === Math.ceil(filteredStudents.length / itemsPerPage) || Math.ceil(filteredStudents.length / itemsPerPage) === 0}
                  className="p-2.5 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-30"
               >
                  <ChevronRightIcon className="w-4 h-4 text-gray-600" />
               </button>
            </div>
            
            <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
               <div className="flex items-center gap-2 px-3 border-r border-gray-100">
                  <span className="text-[10px] font-black text-[#B99E7F] px-2 py-1 bg-[#B99E7F]/10 rounded-md">{itemsPerPage}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">/ page</span>
               </div>
               <div className="p-1 px-2 opacity-50">
                  <Icon icon="mdi:chevron-down" className="w-4 h-4 text-gray-400" />
               </div>
            </div>
        </div>
      </div>
      
      {/* Student View Modal */}
      {isModalOpen && selectedStudentId && (
        <AdminStudentViewModal 
          studentId={selectedStudentId}
          onClose={handleCloseModal}
        />
      )}
    </StaffDashboardLayout>
  );
}
