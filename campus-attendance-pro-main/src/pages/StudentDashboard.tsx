import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  QrCode,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Calendar,
  History,
  User,
  AlertTriangle
} from "lucide-react";

import api from "@/services/api";
import { CollegeHeader } from "@/components/CollegeHeader";
import { QRScannerModal } from "@/components/QRScannerModal";
import { AttendanceChart } from "@/components/AttendanceChart";
import { DailySchedule } from "@/components/DailySchedule";
import NotificationBell from "@/components/NotificationBell";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [qrScannerOpen, setQrScannerOpen] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    percentage: 0
  });

  const [student, setStudent] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);

  // =========================
  // FETCH DATA
  // =========================
  useEffect(() => {
    const loadData = async () => {
      try {
        const dashboardRes = await api.get("/students/dashboard");
        const data = dashboardRes.data?.data;

        setStudent(data?.student || null);
        setStats(
          data?.stats || {
            total: 0,
            present: 0,
            absent: 0,
            percentage: 0
          }
        );
        setAttendance(data?.attendance || []);
      } catch (error: any) {
        console.error("Dashboard error:", error?.response?.data);
      }
    };

    loadData();
  }, []);

  const chartData = [
    { name: "Present", attendance: stats.present },
    { name: "Absent", attendance: stats.absent }
  ];

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen bg-background">
      <CollegeHeader />

      <div className="container mx-auto px-4 py-8">

        {/* HEADER */}
        <motion.div
          className="mb-8 flex justify-between items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              Welcome, {user?.fullName || "Student"}
            </h1>

            <p className="text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4" />
              {student?.class?.department || "Department"} |
              Semester {student?.class?.semester || "N/A"} |
              Roll No: {student?.rollNo || "N/A"}
            </p>
          </div>

          {/* 🔔 Notification Bell */}
          <NotificationBell />
        </motion.div>


        {/* ⚠️ LOW ATTENDANCE ALERT */}
        {stats.percentage < 75 && (
          <motion.div
            className="mb-6 p-4 rounded-lg bg-red-100 border border-red-300 flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AlertTriangle className="text-red-600" />
            <p className="text-red-700 font-medium">
              Warning: Your attendance is below 75%! Please improve it.
            </p>
          </motion.div>
        )}


        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<TrendingUp className="text-green-600" />}
            title="Overall Attendance"
            value={stats.percentage + "%"}
          />

          <StatCard
            icon={<CheckCircle2 className="text-blue-600" />}
            title="Classes Attended"
            value={stats.present}
          />

          <StatCard
            icon={<BookOpen className="text-purple-600" />}
            title="Total Classes"
            value={stats.total}
          />

          <StatCard
            icon={<Calendar className="text-orange-600" />}
            title="Classes Missed"
            value={stats.absent}
          />
        </div>


        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* CHART */}
          <div className="lg:col-span-2">
            <AttendanceChart
              data={chartData}
              role="student"
              title="Attendance Overview"
            />
          </div>

          {/* ACTIONS */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Access features</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">

              <Button
                variant="outline"
                className="w-full justify-start gap-3 hover:bg-primary/10"
                onClick={() => navigate("/scan")}
              >
                <QrCode className="w-5 h-5 text-primary" />
                Mark Attendance
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 hover:bg-primary/10"
                onClick={() => navigate("/my-student-attendance")}
              >
                <History className="w-5 h-5 text-primary" />
                View History
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 hover:bg-primary/10"
                onClick={() => navigate("/student-performance")}
              >
                <BookOpen className="w-5 h-5 text-primary" />
                Subject Performance
              </Button>

            </CardContent>
          </Card>

        </div>


        {/* SCHEDULE */}
        <div className="mt-8">
          <DailySchedule role="student" />
        </div>

      </div>

      {/* QR MODAL */}
      <QRScannerModal
        isOpen={qrScannerOpen}
        onClose={() => setQrScannerOpen(false)}
      />
    </div>
  );
}


// =========================
// STAT CARD
// =========================
function StatCard({ icon, title, value }: any) {
  return (
    <div className="card-professional p-6 flex gap-4 hover:shadow-lg transition">
      {icon}
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}