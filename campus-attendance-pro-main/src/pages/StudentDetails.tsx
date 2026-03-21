import { StudentDetailsAttendance } from "@/components/StudentDetailsAttendance";
import { useNavigate } from "react-router-dom";

const StudentDetails = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <StudentDetailsAttendance
      />
    </div>
  );
};

export default StudentDetails;

