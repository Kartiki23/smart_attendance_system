import { useParams } from "react-router-dom";
import AttendanceSheet from "@/components/AttendanceSheet";

export default function AttendanceSheetPage() {
  const { classId } = useParams();

  
  console.log("Class ID:", classId);

  if (!classId) {
    return (
      <div className="p-6 text-red-600">
        Missing Subject or Class ID
      </div>
    );
  }

  return (
    <div className="p-6">
      <AttendanceSheet classId={classId} />
    </div>
  );
}