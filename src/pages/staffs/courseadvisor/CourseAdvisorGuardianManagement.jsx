import React from "react";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";

export default function CourseAdvisorGuardianManagement() {
  return (
    <StaffDashboardLayout pagetitle="Guardian Management">
      <div className="p-6">
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
          <h3 className="text-xl font-bold text-[#09314F] mb-4">Manage Guardians</h3>
          <p className="text-gray-500">Guardian management features are coming soon.</p>
        </div>
      </div>
    </StaffDashboardLayout>
  );
}
