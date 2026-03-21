import { useEffect } from "react";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import socket from "@/services/socket"; // ✅ ADD THIS

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Documentation from "./pages/Documentation";
import AttendanceHistory from "./pages/AttendanceHistory";
import ClassSchedule from "./pages/ClassSchedule";
import MyProfile from "./pages/MyProfile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminTimetableUpload from "./pages/AdminTimetableUpload";
import UserManagement from "./pages/UserManagement";
import FacultyDashboard from "./pages/FacultyDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import NotFound from "./pages/NotFound";
import ManageSubjects from "./pages/ManageSubjects";
import SessionHistory from "./pages/SessionHistory";
import StudentDetails from "./pages/StudentDetails";
import LinkStudent from "./pages/LinkStudent";
import GenerateQR from "./pages/GenerateQR";
import ScanQR from "./pages/ScanQR";
import AdminTimetable from "./pages/AdminTimetable";
import StudentAttendance from "./pages/StudentAttendance";
import StudentPerformance from "./pages/StudentPerformance";
import Notification from "./pages/Notification";

const queryClient = new QueryClient();


// ✅ SOCKET WRAPPER COMPONENT
function SocketInitializer() {
  const { user } = useAuth();

  useEffect(() => {
    if (user?._id) {
      console.log("🔌 Registering user to socket:", user._id);

      socket.emit("register", user._id);
    }
  }, [user]);

  return null;
}


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>

          {/* ✅ SOCKET INITIALIZER HERE */}
          <SocketInitializer />

          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/attendance-history" element={<AttendanceHistory />} />
            <Route path="/class-schedule" element={<ClassSchedule />} />
            <Route path="/my-profile" element={<MyProfile />} />
            <Route path="/manage-subject" element={<ManageSubjects />} />
            <Route path="/session-history" element={<SessionHistory />} />
            <Route path="/studentDetailsAttendance" element={<StudentDetails />} />
            <Route path="/link-student" element={<LinkStudent />} />
            <Route path="/generate-qr" element={<GenerateQR />} />
            <Route path="/scan" element={<ScanQR />} />
            <Route path="/get-subject-admin" element={<AdminTimetable />} />
            <Route path="/my-student-attendance" element={<StudentAttendance />} />
            <Route path="/student-performance" element={<StudentPerformance />} />
            <Route path="/notifications" element={<Notification />} />

            {/* Protected Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/timetable/upload"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminTimetableUpload />
                </ProtectedRoute>
              }
            />

            <Route
              path="/faculty/*"
              element={
                <ProtectedRoute allowedRoles={["faculty"]}>
                  <FacultyDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/*"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/parent/*"
              element={
                <ProtectedRoute allowedRoles={["parent"]}>
                  <ParentDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;