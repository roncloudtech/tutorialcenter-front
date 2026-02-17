import ProgressCard from "../../components/private/ProgressCard";
import DashboardLayout from "../../components/private/DashboardLayout";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

export default function StudentDashboard() {
  

  return (
    <DashboardLayout>
      <h1 className="text-xl font-semibold mb-6 dark:text-white">Dashboard</h1>

      {/* <div className="grid grid-cols-2 gap-6"> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">

        <ProgressCard
          title="JAMB"
          subjects={["English", "Mathematics", "Chemistry", "Physics"]}
        />
        <ProgressCard
          title="GCE"
          subjects={[
            "English",
            "Mathematics",
            "Chemistry",
            "Physics",
            "Agriculture",
            "Geography",
            "Biology",
            "Further Mathematics",
            "Yoruba",
          ]}
        />
        <ProgressCard
          title="WAEC"
          subjects={[
            "English",
            "Mathematics",
            "Chemistry",
            "Physics",
            "Agriculture",
          ]}
        />
        <ProgressCard
          title="NECO"
          subjects={[
            "English",
            "Mathematics",
            "Chemistry",
            "Physics",
            "Agriculture",
          ]}
        />
      </div>
    </DashboardLayout>
  );
}
