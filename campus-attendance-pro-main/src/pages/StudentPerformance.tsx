import FacultySubjects from "@/components/FacultySubjectStats";
import { SubjectStats } from "../components/SubjectStats";
import { DashboardLayout } from "@/components/DashboardLayout";



const StudentPerformance = () => {
  return (
    <div className="p-6">
      <DashboardLayout role="student">
      <SubjectStats/>
      </DashboardLayout>
    </div>
  );
};

export default StudentPerformance;