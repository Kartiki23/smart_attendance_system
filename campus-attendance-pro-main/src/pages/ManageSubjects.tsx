
import FacultySubjects from "@/components/FacultySubjectStats";
import { SubjectStats } from "../components/SubjectStats";



const ManageSubjects = () => {
  return (
    <div className="p-6">
      <SubjectStats studentId={""} />
      <FacultySubjects/>
    </div>
  );
};

export default ManageSubjects;
