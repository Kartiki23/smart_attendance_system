import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  ShieldCheck,
  Users,
  Heart,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  User,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Role = "admin" | "faculty" | "student" | "parent";

const roles = [
  { id: "admin" as Role, label: "Admin", icon: ShieldCheck },
  { id: "faculty" as Role, label: "Faculty", icon: GraduationCap },
  { id: "student" as Role, label: "Student", icon: Users },
  { id: "parent" as Role, label: "Parent", icon: Heart },
];

const roleStyles = {
  admin: {
    gradient: "bg-gradient-admin",
    bg: "bg-admin-muted",
    border: "border-admin",
    ring: "ring-admin",
  },
  faculty: {
    gradient: "bg-gradient-faculty",
    bg: "bg-faculty-muted",
    border: "border-faculty",
    ring: "ring-faculty",
  },
  student: {
    gradient: "bg-gradient-student",
    bg: "bg-student-muted",
    border: "border-student",
    ring: "ring-student",
  },
  parent: {
    gradient: "bg-gradient-parent",
    bg: "bg-parent-muted",
    border: "border-parent",
    ring: "ring-parent",
  },
};

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { user, role, signIn, signUp, loading } = useAuth();

  const styles = roleStyles[selectedRole];

  // Redirect if already logged in
  useEffect(() => {
    if (user && role && !loading) {
      navigate(`/${role}`);
    }
  }, [user, role, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password. Please try again.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Welcome back!");
        }
      } else {
        if (!fullName.trim()) {
          toast.error("Please enter your full name");
          setIsSubmitting(false);
          return;
        }

        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Please sign in.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Account created! You can now sign in.");
          setIsLogin(true);
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 lg:px-16 py-12">
        <motion.div
          className="max-w-md w-full mx-auto"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {/* Back button */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </button>

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-full flex items-center justify-center p-1">
              <img
                src="/college-logo.png"
                alt="Government Polytechnic Awasari Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-primary">
                Government Polytechnic, Awasari (Kh.)
              </h1>
              <p className="text-xs text-muted-foreground">
                {isLogin ? "Login to Attendance System" : "Register New Account"}
              </p>
            </div>
          </div>

          {/* Role Selection - Only for Login */}
          {isLogin && (
            <div className="mb-6">
              <Label className="text-sm font-semibold mb-3 block text-foreground">Select Your Role</Label>
              <div className="grid grid-cols-4 gap-2">
                {roles.map((role) => {
                  const isSelected = selectedRole === role.id;
                  const roleStyle = roleStyles[role.id];

                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                        isSelected
                          ? cn(roleStyle.bg, roleStyle.border, "ring-2", roleStyle.ring, "ring-offset-2")
                          : "border-border hover:border-muted-foreground/30"
                      )}
                    >
                      <role.icon
                        className={cn(
                          "w-5 h-5",
                          isSelected ? "text-foreground" : "text-muted-foreground"
                        )}
                      />
                      <span
                        className={cn(
                          "text-xs font-medium",
                          isSelected ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {role.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-11 h-12"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold">Enrollment ID / Staff ID</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.id@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-semibold">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 h-12"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-border" />
                  <span className="text-sm text-muted-foreground">Remember me</span>
                </label>
                <button type="button" className="text-sm text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              variant={isLogin ? selectedRole : "default"}
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isLogin ? (
                `Sign In as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-medium hover:underline"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-xl">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Note:</strong> New accounts are assigned the "Student" role by default.
              Contact an administrator to request a different role.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />

        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-primary-foreground">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
              <GraduationCap className="w-12 h-12" />
            </div>
            <h2 className="font-display text-3xl font-bold mb-4">
              College Attendance Management
            </h2>
            <p className="text-primary-foreground/80 max-w-sm">
              Professional attendance tracking system for Government Polytechnic institutes
            </p>

            {/* Feature highlights */}
            <div className="mt-12 space-y-4 text-left">
              {[
                "QR Code + GPS Verification",
                "Real-time Attendance Tracking",
                "Comprehensive Reports & Analytics",
              ].map((feature, index) => (
                <motion.div
                  key={feature}
                  className="flex items-center gap-3 bg-white/10 rounded-xl p-4 backdrop-blur-sm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
