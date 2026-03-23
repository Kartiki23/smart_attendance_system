import { DashboardLayout } from "@/components/DashboardLayout";
import { FacultyClassReports } from "@/components/FacultyClassReports";
import { FacultySessionHistory } from "@/components/FacultySessionHistory";

const SessionHistory = () => {
  return (
    <div className="p-6">
      <DashboardLayout role="faculty">
      <FacultySessionHistory/>
      </DashboardLayout>
    </div>
  );
};

export default SessionHistory;
