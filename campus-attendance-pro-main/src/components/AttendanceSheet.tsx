import { useEffect, useState } from "react";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";

export default function AttendanceSheet({ classId }: any) {

  const [tables, setTables] = useState<any[]>([]);
  const [batch, setBatch] = useState("All");

  useEffect(() => {

    const fetchSheet = async () => {
      try {
        const res = await api.get(
          `/faculty/attendance-sheet/${classId}?batch=${batch}`
        );

        setTables(res.data.tables || []);

      } catch (err) {
        console.error(err);
      }
    };

    if (classId) {
      fetchSheet();
    }

  }, [classId, batch]);

  // ======================
  // EXPORT EXCEL
  // ======================
  const exportToExcel = () => {

    tables.forEach((table) => {

      const sheetData = [
        ["Enrollment No", "Roll No", "Student Name", ...table.dates, "Total"]
      ];

      table.data.forEach((student: any) => {
        const row = [
          student.enrollmentNo,
          student.rollNo,
          student.name,
          ...table.dates.map((d: string) => student.attendance[d]),
          student.totalPresent
        ];
        sheetData.push(row);
      });

      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      const wb = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(wb, ws, table.subjectName);
      XLSX.writeFile(wb, `${table.subjectName}_attendance.xlsx`);
    });

  };

  return (
    <div className="space-y-6">

      {/* FILTER */}
      <div className="flex gap-3">
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

      {/* SUBJECT TABLES */}
      {tables.map((table, index) => (
        <div key={index} className="border rounded p-4 shadow">

          <h2 className="text-xl font-bold mb-4 text-blue-600">
            {table.subjectName}
          </h2>

          <div className="overflow-auto">
            <table className="min-w-full border text-sm">

              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Enrollment No</th>
                  <th className="border p-2">Roll No</th>
                  <th className="border p-2">Student Name</th>

                  {table.dates.map((d: string) => (
                    <th key={d} className="border p-2">
                      {new Date(d).toLocaleDateString()}
                    </th>
                  ))}

                  <th className="border p-2 bg-blue-100">Total</th>
                </tr>
              </thead>

              <tbody>
                {table.data.map((student: any) => (
                  <tr key={student.studentId}>
                    <td className="border p-2">{student.enrollmentNo}</td>
                    <td className="border p-2">{student.rollNo}</td>
                    <td className="border p-2">{student.name}</td>

                    {table.dates.map((d: string) => (
                      <td
                        key={d}
                        className={`border p-2 text-center font-bold ${
                          student.attendance[d] === "A"
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {student.attendance[d]}
                      </td>
                    ))}

                    <td className="border p-2 text-center text-blue-600 font-bold">
                      {student.totalPresent}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>

        </div>
      ))}

    </div>
  );
}