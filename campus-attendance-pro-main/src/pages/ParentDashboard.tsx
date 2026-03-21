import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Bell,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  BookOpen,
  AlertTriangle
} from "lucide-react";

import { CollegeHeader } from "@/components/CollegeHeader";
import { AttendanceChart } from "@/components/AttendanceChart";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/services/api";
import { SubjectStats } from "@/components/SubjectStats";
import NotificationBell from "@/components/NotificationBell";

export default function ParentDashboard() {
  const { user } = useAuth();

  const [student, setStudent] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentError, setStudentError] = useState("");

  // =====================
  // LOAD STUDENT
  // =====================
  const loadStudent = async () => {
    try {
      const res = await api.get("/parents/student");
      const studentData = res.data.data;

      setStudent(studentData);
      setStudentError("");

      if (studentData?._id) {
        await loadDashboard(studentData._id);
      } else {
        setLoading(false);
      }
    } catch (error: any) {
      setStudent(null);
      setStudentError(
        error?.response?.data?.message || "Student not linked"
      );
      setLoading(false);
    }
  };

  // =====================
  // LOAD DASHBOARD
  // =====================
  const loadDashboard = async (studentId: string) => {
    try {
      const [summaryRes, recentRes, chartRes, notifyRes] = await Promise.all([
        api.get(`/parents/attendance-summary/${studentId}`),
        api.get(`/parents/recent-attendance/${studentId}`),
        api.get(`/parents/chart/${studentId}`),
        api.get(`/parents/notifications`)
      ]);

      setSummary(summaryRes.data.data || null);
      setRecentAttendance(recentRes.data.data || []);
      setChartData(chartRes.data.data || []);
      setNotifications(notifyRes.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudent();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CollegeHeader />

      <div className="container mx-auto px-4 py-8">

        {/* HEADER */}
        <motion.div
          className="mb-8 flex justify-between items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              Parent Dashboard
            </h1>

            <p className="text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4" />
              Welcome {user?.fullName}
              {student && (
                <> | Monitoring: {student.user.fullName}</>
              )}
            </p>
          </div>

          {/* 🔔 Notification Bell */}
          <NotificationBell />
        </motion.div>


        {/* ERROR */}
        {studentError ? (
          <Card className="shadow-lg">
            <CardContent className="py-10 text-center">
              <p className="text-red-600 font-medium">{studentError}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Please link this parent to a student
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* ⚠️ LOW ATTENDANCE ALERT */}
            {summary?.percentage < 75 && (
              <motion.div
                className="mb-6 p-4 rounded-lg bg-red-100 border border-red-300 flex items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <AlertTriangle className="text-red-600" />
                <p className="text-red-700 font-medium">
                  Alert: Your child attendance is below 75%
                </p>
              </motion.div>
            )}

            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard icon={<TrendingUp />} title="Attendance" value={`${summary?.percentage ?? 0}%`} />
              <StatCard icon={<CheckCircle2 />} title="Present" value={summary?.present ?? 0} />
              <StatCard icon={<XCircle />} title="Absent" value={summary?.absent ?? 0} />
              <StatCard icon={<BookOpen />} title="Total" value={summary?.total ?? 0} />
            </div>


            {/* MAIN */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* LEFT */}
              <div className="lg:col-span-2 space-y-6">

                <AttendanceChart
                  data={chartData}
                  role="parent"
                  title="Attendance Trend"
                />

                {/* RECENT */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex gap-2">
                      <Clock /> Recent Attendance
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    {recentAttendance.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No attendance data
                      </p>
                    ) : (
                      recentAttendance.map((r, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center border p-3 rounded-lg mb-2 hover:bg-muted/50 transition"
                        >
                          <div>
                            <p className="font-semibold">
                              {r.subject?.name}
                            </p>

                            <p className="text-sm text-muted-foreground">
                              {r.teacher?.user?.fullName}
                              {" • "}
                              {new Date(r.createdAt).toLocaleDateString()}
                            </p>
                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              r.status === "Present"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {r.status}
                          </span>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* SUBJECT */}
                {student && <SubjectStats studentId={student._id} />}

              </div>


              {/* RIGHT */}
              <div className="space-y-6">

                {/* NOTIFICATIONS */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex gap-2">
                      <Bell />Activities
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    {notifications.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No notifications
                      </p>
                    ) : (
                      notifications.map((n, i) => (
                        <div
                          key={i}
                          className="border p-3 rounded-lg mb-2 hover:bg-muted/50 transition"
                        >
                          <p className="text-sm font-medium">
                            {n.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {n.time}
                          </p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* STUDENT INFO */}
                {student && (
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle>Student Info</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-2">
                      <Info label="Name" value={student.user.fullName} />
                      <Info label="Email" value={student.user.email} />
                      <Info label="Class" value={student.class?.name} />
                      <Info label="Department" value={student.class?.department} />
                      <Info label="Semester" value={student.class?.semester} />
                    </CardContent>
                  </Card>
                )}

              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}


// =====================
// REUSABLE
// =====================
function StatCard({ icon, title, value }: any) {
  return (
    <div className="card-professional p-6 flex gap-4 hover:shadow-lg transition">
      <div className="text-primary">{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function Info({ label, value }: any) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value || "N/A"}</p>
    </div>
  );
}