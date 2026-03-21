import { useEffect, useState } from "react";
import api from "@/services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DashboardLayout } from "./DashboardLayout";

interface AttendanceSummaryRow {
  studentId: string;
  studentName: string;
  email: string;
  rollNo: string;
  department: string;
  className: string;
  semester: string | number;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  totalClasses: number;
  attendedClasses: number;
  missedClasses: number;
  percentage: number;
}

interface ClassItem {
  _id: string;
  name: string;
  department?: string;
  semester?: number;
}

interface SubjectItem {
  _id: string;
  name: string;
  code?: string;
  department?: string;
  semester?: number;
}

export function StudentDetailsAttendance() {
  const [rows, setRows] = useState<AttendanceSummaryRow[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);

  const [department, setDepartment] = useState("all");
  const [classId, setClassId] = useState("all");
  const [subjectId, setSubjectId] = useState("all");

  const [loading, setLoading] = useState(false);

  const fetchSummary = async (
    selectedDepartment = department,
    selectedClassId = classId,
    selectedSubjectId = subjectId
  ) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append("department", selectedDepartment);
      params.append("classId", selectedClassId);
      params.append("subjectId", selectedSubjectId);

      const res = await api.get(`/admin/attendance-summary?${params.toString()}`);

      if (res.data.success) {
        setRows(res.data.data || []);
        setDepartments(res.data.filters?.departments || []);
        setClasses(res.data.filters?.classes || []);
        setSubjects(res.data.filters?.subjects || []);
      }
    } catch (error) {
      console.error("Attendance summary fetch error:", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary("all", "all", "all");
  }, []);

  useEffect(() => {
    fetchSummary(department, classId, subjectId);
  }, [department, classId, subjectId]);

  const filteredClasses = classes.filter((cls) => {
    if (department === "all") return true;
    return cls.department === department;
  });

  const filteredSubjects = subjects.filter((sub) => {
    if (department === "all") return true;
    return sub.department === department;
  });

  const exportData = rows.map((row) => ({
    Student: row.studentName,
    Email: row.email,
    "Roll No": row.rollNo,
    Department: row.department,
    Class: row.className,
    Semester: row.semester,
    Subject: row.subjectName,
    "Subject Code": row.subjectCode,
    Attended: row.attendedClasses,
    Missed: row.missedClasses,
    Total: row.totalClasses,
    Percentage: `${row.percentage}%`
  }));

  const getFileName = () => {
    const dept = department === "all" ? "AllDepartments" : department;
    const cls =
      classId === "all"
        ? "AllClasses"
        : classes.find((c) => c._id === classId)?.name || "Class";
    const sub =
      subjectId === "all"
        ? "AllSubjects"
        : subjects.find((s) => s._id === subjectId)?.code || "Subject";

    return `AttendanceSummary_${dept}_${cls}_${sub}`;
  };

  const exportCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${getFileName()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Summary");
    XLSX.writeFile(workbook, `${getFileName()}.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF("landscape");

    doc.setFontSize(14);
    doc.text("Admin Attendance Summary", 14, 15);

    doc.setFontSize(10);
    doc.text(
      `Department: ${department === "all" ? "All" : department} | Class: ${
        classId === "all"
          ? "All"
          : classes.find((c) => c._id === classId)?.name || "All"
      } | Subject: ${
        subjectId === "all"
          ? "All"
          : subjects.find((s) => s._id === subjectId)?.name || "All"
      }`,
      14,
      22
    );

    autoTable(doc, {
      startY: 28,
      head: [
        [
          "Student",
          "Roll No",
          "Department",
          "Class",
          "Semester",
          "Subject",
          "Code",
          "Attended",
          "Missed",
          "Total",
          "Percentage"
        ]
      ],
      body: rows.map((row) => [
        row.studentName,
        row.rollNo,
        row.department,
        row.className,
        String(row.semester),
        row.subjectName,
        row.subjectCode,
        String(row.attendedClasses),
        String(row.missedClasses),
        String(row.totalClasses),
        `${row.percentage}%`
      ]),
      styles: {
        fontSize: 8
      },
      headStyles: {
        fillColor: [41, 128, 185]
      }
    });

    doc.save(`${getFileName()}.pdf`);
  };

  return (
    <DashboardLayout role="admin">
    <Card className="card-professional">
      <CardHeader>
        <CardTitle>All Student Attendance</CardTitle>
        <CardDescription>
          View attendance department wise, class wise and subject wise
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Select
            value={department}
            onValueChange={(value) => {
              setDepartment(value);
              setClassId("all");
              setSubjectId("all");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={classId} onValueChange={setClassId}>
            <SelectTrigger>
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {filteredClasses.map((cls) => (
                <SelectItem key={cls._id} value={cls._id}>
                  {cls.name}
                  {cls.semester ? ` - Sem ${cls.semester}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={subjectId} onValueChange={setSubjectId}>
            <SelectTrigger>
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {filteredSubjects.map((sub) => (
                <SelectItem key={sub._id} value={sub._id}>
                  {sub.name} {sub.code ? `(${sub.code})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <Button variant="outline" onClick={exportCSV} disabled={rows.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>

          <Button variant="outline" onClick={exportExcel} disabled={rows.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>

          <Button variant="outline" onClick={exportPDF} disabled={rows.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading attendance data...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No attendance data found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border text-sm rounded-lg overflow-hidden">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3">Student</th>
                  <th className="text-left p-3">Roll No</th>
                  <th className="text-left p-3">Department</th>
                  <th className="text-left p-3">Class</th>
                  <th className="text-left p-3">Subject</th>
                  <th className="text-left p-3">Attended</th>
                  <th className="text-left p-3">Missed</th>
                  <th className="text-left p-3">Total</th>
                  <th className="text-left p-3">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={`${row.studentId}-${row.subjectId}-${index}`}
                    className="border-t"
                  >
                    <td className="p-3">
                      <div className="font-medium">{row.studentName}</div>
                      <div className="text-xs text-muted-foreground">{row.email}</div>
                    </td>
                    <td className="p-3">{row.rollNo}</td>
                    <td className="p-3">{row.department}</td>
                    <td className="p-3">
                      {row.className}
                      {row.semester ? ` (Sem ${row.semester})` : ""}
                    </td>
                    <td className="p-3">
                      <div>{row.subjectName}</div>
                      <div className="text-xs text-muted-foreground">
                        {row.subjectCode}
                      </div>
                    </td>
                    <td className="p-3">{row.attendedClasses}</td>
                    <td className="p-3">{row.missedClasses}</td>
                    <td className="p-3">{row.totalClasses}</td>
                    <td className="p-3 font-semibold">{row.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
    </DashboardLayout>
  );
}