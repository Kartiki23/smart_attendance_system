import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  GraduationCap,
  QrCode,
  ClipboardList,
  Calendar,
  TrendingUp,
  Home,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "./ui/button";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "admin" | "faculty" | "student" | "parent";
  userName?: string;
}

const roleConfig = {
  admin: {
    title: "Admin Portal",
    gradient: "bg-gradient-admin",
    color: "text-admin",
    bg: "bg-admin-muted",
    links: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/get-subject-admin", label: "Subjects", icon: BookOpen },
      { href: "/studentDetailsAttendance", label: "Analytics", icon: BarChart3 },
      { href: "/admin/timetable/upload", label: "Timetable", icon: FileSpreadsheet },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
  faculty: {
    title: "Faculty Portal",
    gradient: "bg-gradient-faculty",
    color: "text-faculty",
    bg: "bg-faculty-muted",
    links: [
      { href: "/faculty", label: "Dashboard", icon: LayoutDashboard },
      { href: "/faculty/sessions", label: "Sessions", icon: Calendar },
      { href: "/faculty/qr", label: "Generate QR", icon: QrCode },
      { href: "/faculty/attendance", label: "Attendance", icon: ClipboardList },
      { href: "/faculty/reports", label: "Reports", icon: BarChart3 },
      { href: "/faculty/profile", label: "Profile", icon: User },
    ],
  },
  student: {
    title: "Student Portal",
    gradient: "bg-gradient-student",
    color: "text-student",
    bg: "bg-student-muted",
    links: [
      { href: "/student", label: "Dashboard", icon: LayoutDashboard },
      { href: "/student/scan", label: "Scan QR", icon: QrCode },
      { href: "/student/attendance", label: "My Attendance", icon: ClipboardList },
      { href: "/student/subjects", label: "Subjects", icon: BookOpen },
      { href: "/student/profile", label: "Profile", icon: User },
    ],
  },
  parent: {
    title: "Parent Portal",
    gradient: "bg-gradient-parent",
    color: "text-parent",
    bg: "bg-parent-muted",
    links: [
      { href: "/parent", label: "Dashboard", icon: LayoutDashboard },
      { href: "/parent/attendance", label: "Attendance", icon: ClipboardList },
      { href: "/parent/trends", label: "Trends", icon: TrendingUp },
      { href: "/parent/reports", label: "Reports", icon: BarChart3 },
      { href: "/parent/profile", label: "Profile", icon: User },
    ],
  },
};

export function DashboardLayout({ children, role, userName = "User" }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  const config = roleConfig[role];

  const displayName = profile?.full_name || userName;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-card border-r border-border transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", config.gradient)}>
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg">{config.title}</h1>
                <p className="text-xs text-muted-foreground">Attendance System</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {config.links.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    isActive
                      ? cn(config.gradient, "text-white shadow-md")
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <link.icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", config.bg)}>
                <User className={cn("w-5 h-5", config.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground capitalize">{role}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => navigate("/")}
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-destructive hover:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-accent rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 lg:flex-none" />

            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-accent rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </button>
              <div className={cn("w-9 h-9 rounded-full flex items-center justify-center", config.gradient)}>
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
