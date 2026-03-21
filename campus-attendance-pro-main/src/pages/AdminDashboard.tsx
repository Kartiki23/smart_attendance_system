import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  UserPlus,
  FileText,
  Download,
  Settings,
  Shield,
  BarChart3
} from "lucide-react";

import { CollegeHeader } from "@/components/CollegeHeader";
import { AttendanceChart } from "@/components/AttendanceChart";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalClasses: 0,
    avgAttendance: 0
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchChart();
    fetchRecentActivities();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/stats");
      const data = res.data;

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Stats error:", error);
    }
  };

  const fetchChart = async () => {
    try {
      const res = await api.get("/admin/attendance-chart");
      const data = res.data;

      console.log("Attendance Chart API Response:", data);

      if (data.success) {
        setChartData(data.chartData || []);
      }
    } catch (error) {
      console.error("Chart error:", error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const res = await api.get("/admin/recent-activities");
      const data = res.data;

      console.log("Recent Activities API Response:", data);

      if (data.success) {
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error("Activity error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <CollegeHeader />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
            <div>
              <h1 className="font-display text-3xl font-bold text-primary mb-2">
                Administrator Dashboard
              </h1>

              <p className="text-muted-foreground flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Welcome, {user?.fullName || "Administrator"}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => navigate("/studentDetailsAttendance")}
              >
                <Download className="w-4 h-4" />
                Export Report
              </Button>

              <Button className="bg-primary hover:bg-primary/90 gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card-professional p-6">
            <p className="text-sm text-muted-foreground">Total Students</p>
            <p className="text-2xl font-bold text-primary">{stats.totalStudents}</p>
          </div>

          <div className="card-professional p-6">
            <p className="text-sm text-muted-foreground">Faculty Members</p>
            <p className="text-2xl font-bold text-primary">{stats.totalFaculty}</p>
          </div>

          <div className="card-professional p-6">
            <p className="text-sm text-muted-foreground">Active Classes</p>
            <p className="text-2xl font-bold text-primary">{stats.totalClasses}</p>
          </div>

          <div className="card-professional p-6">
            <p className="text-sm text-muted-foreground">Avg Attendance</p>
            <p className="text-2xl font-bold text-primary">{stats.avgAttendance}%</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div className="lg:col-span-2 space-y-6">
            <AttendanceChart
              data={chartData}
              role="admin"
              title="Institute-wide Attendance Overview"
            />

            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-primary">
                  Management Tools
                </CardTitle>
                <CardDescription>
                  Quick access to system configuration and management
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto py-4 justify-start gap-3 hover:bg-primary/5"
                    onClick={() => navigate("/admin/users")}
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">Manage Users</p>
                      <p className="text-xs text-muted-foreground">
                        View all Students, Faculty, and Parents
                      </p>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto py-4 justify-start gap-3 hover:bg-primary/5"
                    onClick={() => navigate("/admin/timetable/upload")}
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">Manage Classes</p>
                      <p className="text-xs text-muted-foreground">
                        Create, edit, or delete classes
                      </p>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto py-4 justify-start gap-3 hover:bg-primary/5"
                    onClick={() => navigate("/get-subject-admin")}
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">Manage Subjects</p>
                      <p className="text-xs text-muted-foreground">
                        Configure course catalog
                      </p>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto py-4 justify-start gap-3 hover:bg-primary/5"
                    onClick={() => navigate("/studentDetailsAttendance")}
                  >
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">Analytics</p>
                      <p className="text-xs text-muted-foreground">
                        View detailed reports
                      </p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div className="space-y-6">
            <Card className="card-professional">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest actions across the application
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                {activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No recent activities
                  </p>
                ) : (
                  activities.map((activity, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded-lg bg-card/50"
                    >
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.user}
                        {activity.role ? ` • ${activity.role}` : ""}
                      </p>
                      <p className="text-xs text-primary mt-1">{activity.time}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-primary">
                  Quick Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-3 hover:bg-primary/5">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">System Reports</span>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 hover:bg-primary/5">
                  <Settings className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">System Settings</span>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 hover:bg-primary/5">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">User Permissions</span>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h3 className="font-semibold text-primary mb-2">
          🔐 Administrator Panel Active
        </h3>
        <p className="text-sm text-foreground/80">
          ✅ Full system access with comprehensive management tools
          <br />
          👥 Manage users, classes, subjects, and view all attendance records
          <br />
          📊 Export detailed reports and analytics for institutional planning
        </p>
      </motion.div>
    </div>
  );
}