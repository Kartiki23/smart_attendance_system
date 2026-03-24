import { useEffect, useState } from "react";
import api from "@/services/api";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";

export default function AttendanceSheet({ classId, subjectId }: any) {

  const [data, setData] = useState<any[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [batch, setBatch] = useState("All");

  useEffect(() => {

    console.log("FETCHING SHEET...");
    console.log("Class ID:", classId);
    console.log("Subject ID:", subjectId);

    const fetchSheet = async () => {
      try {
        const res = await api.get(
          `/faculty/attendance-sheet/${subjectId}/${classId}?batch=${batch}`
        );

        console.log("Response:", res.data);

        setData(res.data.data || []);
        setDates(res.data.dates || []);

      } catch (err) {
        console.error("Attendance Sheet Error:", err);
      }
    };

    if (classId && subjectId) {
      fetchSheet();
    }

  }, [classId, subjectId, batch]);

  const getColumnColor = (date: string) => {
    if (!data.length) return "";

    let presentCount = 0;

    data.forEach((student) => {
      if (student.attendance[date] !== "A") {
        presentCount++;
      }
    });

    const percentage = (presentCount / data.length) * 100;

    if (percentage >= 75) return "bg-green-100";
    if (percentage >= 50) return "bg-yellow-100";
    return "bg-red-100";
  };

  const exportToExcel = () => {
    const sheetData = [
      ["Enrollment No", "Roll No", "Student Name", ...dates, "Total"]
    ];

    data.forEach((student) => {
      const row = [
        student.studentId,
        student.enrollmentNo,
        student.rollNo,
        student.name,
        ...dates.map(d => student.attendance[d] || "-"),
        student.totalPresent
      ];
      sheetData.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");

    XLSX.writeFile(wb, "attendance_sheet.xlsx");
  };

  return (
    <div className="space-y-4">

      {/* FILTER + EXPORT */}
      <div className="flex gap-3 flex-wrap">

        <select
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="All">All</option>
          <option value="C1">C1</option>
          <option value="C2">C2</option>
          <option value="C3">C3</option>
        </select>

        <Button onClick={exportToExcel}>
          Export Excel
        </Button>

      </div>

      {/* TABLE */}
      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm border-collapse">

          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Enrollment No</th>
              <th className="border p-2">Roll No</th>
              <th className="border p-2">Student Name</th>

              {dates.map((d) => (
                <th key={d} className={`border p-2 ${getColumnColor(d)}`}>
                  {new Date(d).toLocaleDateString()}
                </th>
              ))}

              <th className="border p-2 bg-blue-100">Total</th>
            </tr>
          </thead>

          <tbody>
            {data.map((student) => (
              <tr key={student.studentId}>
                <td className="border p-2">{student.enrollmentNo}</td>
                <td className="border p-2">{student.rollNo}</td>
                <td className="border p-2">{student.name}</td>

                {dates.map((d) => {
                  const value = student.attendance[d];

                  return (
                    <td
                      key={d}
                      className={`border p-2 text-center font-medium
                        ${value === "A" ? "text-red-600" : "text-green-600"}
                      `}
                    >
                      {value || "-"}
                    </td>
                  );
                })}

                <td className="border p-2 text-center font-bold text-blue-600">
                  {student.totalPresent}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
}