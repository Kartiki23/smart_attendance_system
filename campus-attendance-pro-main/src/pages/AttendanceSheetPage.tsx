import { useParams } from "react-router-dom";
import AttendanceSheet from "@/components/AttendanceSheet";

export default function AttendanceSheetPage() {
  const { subjectId, classId } = useParams();

  console.log("Subject ID:", subjectId);
  console.log("Class ID:", classId);

  if (!subjectId || !classId) {
    return (
      <div className="p-6 text-red-600">
        Missing Subject or Class ID
      </div>
    );
  }

  return (
    <div className="p-6">
      <AttendanceSheet subjectId={subjectId} classId={classId} />
    </div>
  );
}