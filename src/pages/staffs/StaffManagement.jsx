import StaffDashboardLayout from "../../components/private/staffs/DashboardLayout.jsx";

export default function StaffManagement() {
  return (
    <StaffDashboardLayout>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Manage Staffs
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          This is a placeholder for the staff management page. You can add staff
          lists, filters, and actions here.
        </p>
      </div>
    </StaffDashboardLayout>
  );
}
