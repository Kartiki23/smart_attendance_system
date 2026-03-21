import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  Calendar,
  TrendingUp,
  User,
  Play,
  StopCircle,
  QrCode,
} from "lucide-react";
import { CollegeHeader } from "@/components/CollegeHeader";
import { AttendanceChart } from "@/components/AttendanceChart";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";

interface FacultyClass {
  _id: string;
  name: string;
  department?: string;
  semester?: number;
  studentsCount?: number;
}

interface FacultySubject {
  _id: string;
  name: string;
  code?: string;
}

interface FacultyDashboardItem {
  _id: string;
  class?: FacultyClass;
  subject?: FacultySubject;
}

interface TodayLecture {
  _id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject?: {
    _id: string;
    name: string;
    code?: string;
  };
  class?: {
    _id: string;
    name: string;
    department?: string;
    semester?: number;
  };
}

interface ReportRow {
  studentId: string;
  name: string;
  rollNo: string;
  year: number;
  totalLectures: number;
  attendedLectures: number;
  percentage: number;
}

interface AttendanceHistoryItem {
  _id?: string;
  student?: {
    _id?: string;
    rollNo?: string;
    user?: {
      fullName?: string;
    };
  };
  subject?: {
    _id?: string;
    name?: string;
    code?: string;
  };
  class?: {
    _id?: string;
    name?: string;
    department?: string;
    semester?: number;
  };
  status?: string;
  isQRMarked?: boolean;
  createdAt?: string;
  date?: string;
}

export default function FacultyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState<FacultyDashboardItem[]>([]);
  const [todaySubjects, setTodaySubjects] = useState<TodayLecture[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [report, setReport] = useState<ReportRow[]>([]);
  const [sessionActive, setSessionActive] = useState(false);
  const [attendanceChartData, setAttendanceChartData] = useState<any[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceHistoryItem[]>([]);
  const [todayLoading, setTodayLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSummary, setReportSummary] = useState({
    totalStudents: 0,
    subjectName: "",
    className: "",
  });

  // ✅ History filters
  const [historyClassFilter, setHistoryClassFilter] = useState("all");
  const [historySubjectFilter, setHistorySubjectFilter] = useState("all");

  // ✅ FETCH FACULTY SUBJECT/CLASS DATA
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get("/faculty/dashboard");
        const data = res.data?.data || [];
        setSubjects(data);

        if (data.length > 0) {
          if (!selectedClass) {
            setSelectedClass(data[0]?.class?._id || "");
          }
          if (!selectedSubject) {
            setSelectedSubject(data[0]?.subject?._id || "");
          }
        }
      } catch (err) {
        console.error("Faculty dashboard fetch error:", err);
      }
    };

    fetchSubjects();
  }, []);

  // ✅ FETCH TODAY SUBJECTS
  useEffect(() => {
    const fetchTodaySubjects = async () => {
      try {
        setTodayLoading(true);
        const res = await api.get("/faculty/today-subjects");
        const data = res.data?.data || [];
        setTodaySubjects(data);
      } catch (err) {
        console.error("Today subjects fetch error:", err);
        setTodaySubjects([]);
      } finally {
        setTodayLoading(false);
      }
    };

    fetchTodaySubjects();
  }, []);

  // ✅ FETCH ATTENDANCE HISTORY
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.get("/attendance/faculty-attendance");
        setAttendanceHistory(res.data?.attendance || []);
      } catch (err) {
        console.error("Faculty attendance history error:", err);
      }
    };

    fetchAttendance();
  }, []);

  const uniqueClasses = [
    ...new Map(subjects.map((item) => [item.class?._id, item])).values(),
  ].filter((item) => item.class?._id);

  const filteredSubjects = [
    ...new Map(
      subjects
        .filter((s) => s.class?._id === selectedClass)
        .map((item) => [item.subject?._id, item])
    ).values(),
  ].filter((item) => item.subject?._id);

  useEffect(() => {
    if (!selectedClass) return;
    const firstSubjectForClass = filteredSubjects[0]?.subject?._id || "";
    setSelectedSubject(firstSubjectForClass);
  }, [selectedClass]);

  const handleFetchReport = async () => {
    if (!selectedClass || !selectedSubject) {
      alert("Please select class and subject");
      return;
    }

    try {
      setReportLoading(true);

      const res = await api.get(`/faculty/report/${selectedSubject}/${selectedClass}`);
      const data = res.data?.data || [];
      const summary = res.data?.summary || {
        totalStudents: 0,
        subjectName: "",
        className: "",
      };

      setReport(data);
      setReportSummary(summary);

      const chart = data.map((s: ReportRow) => ({
        name: s.name,
        attendance: s.percentage,
        present: s.attendedLectures,
      }));

      setAttendanceChartData(chart);
    } catch (err) {
      console.error("Report fetch error:", err);
      setReport([]);
      setAttendanceChartData([]);
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClass && selectedSubject) {
      handleFetchReport();
    }
  }, [selectedClass, selectedSubject]);

  const avgAttendance =
    report.length > 0
      ? Math.round(report.reduce((sum, item) => sum + item.percentage, 0) / report.length)
      : 0;

  // ✅ History filter class options from attendanceHistory
  const historyClassOptions = useMemo(() => {
    return [
      ...new Map(
        attendanceHistory
          .filter((item) => item.class?._id)
          .map((item) => [item.class!._id, item.class])
      ).values(),
    ];
  }, [attendanceHistory]);

  // ✅ History filter subject options based on selected history class
  const historySubjectOptions = useMemo(() => {
    const filtered = historyClassFilter === "all"
      ? attendanceHistory
      : attendanceHistory.filter((item) => item.class?._id === historyClassFilter);

    return [
      ...new Map(
        filtered
          .filter((item) => item.subject?._id)
          .map((item) => [item.subject!._id, item.subject])
      ).values(),
    ];
  }, [attendanceHistory, historyClassFilter]);

  // ✅ Reset subject when class changes
  useEffect(() => {
    setHistorySubjectFilter("all");
  }, [historyClassFilter]);

  // ✅ Final filtered history data
  const filteredAttendanceHistory = useMemo(() => {
    return attendanceHistory.filter((item) => {
      const classMatch =
        historyClassFilter === "all" || item.class?._id === historyClassFilter;

      const subjectMatch =
        historySubjectFilter === "all" || item.subject?._id === historySubjectFilter;

      return classMatch && subjectMatch;
    });
  }, [attendanceHistory, historyClassFilter, historySubjectFilter]);

  return (
    <div className="min-h-screen bg-background">
      <CollegeHeader />

      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-3xl font-bold text-primary mb-2">
            Welcome, {user?.fullName || "Faculty"}
          </h1>

          <p className="text-muted-foreground flex items-center gap-2">
            <User className="w-4 h-4" />
            Faculty Dashboard
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6 mt-6">
          <StatCard title="My Classes" value={uniqueClasses.length} icon={<BookOpen />} />
          <StatCard title="Total Students" value={reportSummary.totalStudents} icon={<Users />} />
          <StatCard title="Sessions Today" value={todaySubjects.length} icon={<Calendar />} />
          <StatCard title="Avg Attendance" value={`${avgAttendance}%`} icon={<TrendingUp />} />
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>📅 Today's Lectures</CardTitle>
            <CardDescription>Your timetable for today</CardDescription>
          </CardHeader>

          <CardContent>
            {todayLoading ? (
              <p className="text-gray-500">Loading today's lectures...</p>
            ) : todaySubjects.length === 0 ? (
              <p className="text-gray-500">No lectures today 🎉</p>
            ) : (
              todaySubjects.map((t) => (
                <div key={t._id} className="border p-3 rounded mb-2">
                  <p className="font-semibold text-blue-600">
                    {t.subject?.name || "No Subject"}
                  </p>
                  <p className="text-sm text-gray-500">{t.class?.name || "No Class"}</p>
                  <p className="text-sm">
                    {t.startTime} - {t.endTime}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.day}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Lecture Management</CardTitle>
            <CardDescription>Select class and subject to view attendance report</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueClasses.map((s: any) => (
                    <SelectItem key={s.class?._id} value={s.class?._id}>
                      {s.class?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubjects.map((s: any) => (
                    <SelectItem key={s.subject?._id} value={s.subject?._id}>
                      {s.subject?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 flex-wrap">
              {!sessionActive ? (
                <Button onClick={() => setSessionActive(true)} className="bg-green-600 text-white">
                  <Play className="w-4 h-4 mr-2" />
                  Start Session
                </Button>
              ) : (
                <Button onClick={() => setSessionActive(false)} className="bg-red-600 text-white">
                  <StopCircle className="w-4 h-4 mr-2" />
                  End Session
                </Button>
              )}

              <Button onClick={() => navigate("/generate-qr")}>
                <QrCode className="w-4 h-4 mr-2" />
                QR
              </Button>

              <Button onClick={handleFetchReport}>
                {reportLoading ? "Loading..." : "Fetch Subject Report"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="chart" className="mt-6">
          <TabsList>
            <TabsTrigger value="chart">Attendance Chart</TabsTrigger>
            <TabsTrigger value="report">Subject Report</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="chart">
            <Card>
              <CardHeader>
                <CardTitle>Subject-wise Attendance Chart</CardTitle>
                <CardDescription>
                  {reportSummary.subjectName && reportSummary.className
                    ? `${reportSummary.subjectName} - ${reportSummary.className}`
                    : "Select class and subject to view chart"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AttendanceChart data={attendanceChartData} role="faculty" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="report">
            <Card>
              <CardHeader>
                <CardTitle>Subject Attendance Report</CardTitle>
                <CardDescription>
                  {reportSummary.subjectName && reportSummary.className
                    ? `${reportSummary.subjectName} - ${reportSummary.className}`
                    : "No subject selected"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reportLoading ? (
                  <p>Loading report...</p>
                ) : report.length === 0 ? (
                  <p>No attendance data found for selected class and subject.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border text-sm">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border p-2 text-left">Roll No</th>
                          <th className="border p-2 text-left">Student Name</th>
                          <th className="border p-2 text-left">Year</th>
                          <th className="border p-2 text-left">Total Lectures</th>
                          <th className="border p-2 text-left">Present</th>
                          <th className="border p-2 text-left">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.map((student) => (
                          <tr key={student.studentId}>
                            <td className="border p-2">{student.rollNo}</td>
                            <td className="border p-2">{student.name}</td>
                            <td className="border p-2">{student.year}</td>
                            <td className="border p-2">{student.totalLectures}</td>
                            <td className="border p-2">{student.attendedLectures}</td>
                            <td className="border p-2 font-medium">{student.percentage}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Attendance History</CardTitle>
                <CardDescription>Filter attendance by class and subject</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Select value={historyClassFilter} onValueChange={setHistoryClassFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by Class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {historyClassOptions.map((cls: any) => (
                        <SelectItem key={cls._id} value={cls._id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={historySubjectFilter} onValueChange={setHistorySubjectFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {historySubjectOptions.map((sub: any) => (
                        <SelectItem key={sub._id} value={sub._id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {filteredAttendanceHistory.length === 0 ? (
                  <p>No attendance data found for selected filters.</p>
                ) : (
                  filteredAttendanceHistory.map((a, i) => (
                    <div key={a._id || i} className="border p-4 rounded-lg mb-2">
                      <p>
                        <b>Student:</b> {a.student?.user?.fullName || "N/A"}
                      </p>
                      <p>
                        <b>Roll No:</b> {a.student?.rollNo || "N/A"}
                      </p>
                      <p>
                        <b>Class:</b> {a.class?.name || "N/A"}
                      </p>
                      <p>
                        <b>Subject:</b> {a.subject?.name || "N/A"}
                      </p>
                      <p>
                        <b>Status:</b> {a.status || (a.isQRMarked ? "Present" : "Absent")}
                      </p>
                      <p>
                        <b>Date:</b>{" "}
                        {a.createdAt
                          ? new Date(a.createdAt).toLocaleString()
                          : a.date
                          ? new Date(a.date).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="p-4 bg-white shadow rounded-xl flex items-center gap-4">
      <div className="bg-gray-100 p-2 rounded">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}