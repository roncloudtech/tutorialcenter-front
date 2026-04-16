import React from "react";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import ComingSoon from "../../public/ComingSoon.jsx";

export default function CourseAdvisorComingSoon({ title }) {
  return (
    <StaffDashboardLayout pagetitle={title || "Coming Soon"}>
      <ComingSoon />
    </StaffDashboardLayout>
  );
}
