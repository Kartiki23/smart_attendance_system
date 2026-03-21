import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Users,
  GraduationCap,
  Heart,
  QrCode,
  MapPin,
  BarChart3,
  ClipboardCheck,
  FileText,
  ArrowRight,
} from "lucide-react";
import { RoleCard } from "@/components/RoleCard";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: QrCode,
    title: "QR Code Marking",
    description: "Secure QR code-based attendance marking system",
  },
  {
    icon: MapPin,
    title: "GPS Verification",
    description: "Location-based validation to prevent proxy attendance",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Real-time reports and attendance statistics",
  },
  {
    icon: FileText,
    title: "Export Reports",
    description: "Generate official attendance reports in Excel/PDF",
  },
];

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Professional Header */}
      <motion.header
        className="bg-primary text-primary-foreground py-4 shadow-md"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-4"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <motion.div
                className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg p-1"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src="/college-logo.png"
                  alt="Government Polytechnic Awasari Logo"
                  className="w-full h-full object-contain"
                />
              </motion.div>
              <div>
                <h1 className="font-display font-bold text-lg md:text-xl text-white">
                  Government Polytechnic, Awasari (Kh.)
                </h1>
                <p className="text-xs md:text-sm text-blue-100">
                  Computer Engineering Department
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Button
                variant="secondary"
                onClick={() => navigate("/login")}
                className="font-medium transition-transform hover:scale-105"
              >
                Login
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-md text-sm font-medium text-primary mb-6 border border-primary/20"
            >
              <ShieldCheck className="w-4 h-4" />
              Official College Attendance Management
            </motion.div>

            <motion.h2
              className="font-display text-3xl md:text-5xl font-bold mb-6 leading-tight text-primary"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
            >
              College Attendance Management System
            </motion.h2>

            <motion.p
              className="text-base md:text-lg text-foreground/80 max-w-2xl mx-auto mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              A professional digital attendance solution for tracking student
              attendance using QR codes and GPS verification. Designed for
              comprehensive deployment across all departments and semesters.
            </motion.p>

            <motion.div
              className="flex flex-wrap justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="lg"
                  onClick={() => navigate("/login")}
                  className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 transition-all"
                >
                  Access System
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/documentation")}
                  className="border-primary text-primary hover:bg-primary/10 font-semibold px-8 transition-all"
                >
                  View Documentation
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="font-display text-2xl md:text-3xl font-bold text-primary mb-3">
              System Features
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools for efficient attendance management and
              tracking
            </p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                whileHover={{
                  y: -8,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                  transition: { duration: 0.3 }
                }}
                className="card-professional p-6 text-center transition-all duration-300"
              >
                <motion.div
                  className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="w-7 h-7 text-primary" />
                </motion.div>
                <h4 className="font-semibold text-base mb-2 text-foreground">
                  {feature.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Role Selection Section */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="font-display text-2xl md:text-3xl font-bold text-primary mb-3">
              Select Your Role
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose your portal to access role-specific features and functionalities
            </p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={scaleIn} whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
              <RoleCard
                role="admin"
                title="Administrator"
                description="Manage users, classes, subjects, and view comprehensive reports"
                icon={ShieldCheck}
                onClick={() => navigate("/login")}
              />
            </motion.div>

            <motion.div variants={scaleIn} whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
              <RoleCard
                role="faculty"
                title="Faculty"
                description="Generate QR codes, start lectures, and track attendance"
                icon={GraduationCap}
                onClick={() => navigate("/login")}
              />
            </motion.div>

            <motion.div variants={scaleIn} whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
              <RoleCard
                role="student"
                title="Student"
                description="Mark attendance by scanning QR codes and view your records"
                icon={Users}
                onClick={() => navigate("/login")}
              />
            </motion.div>

            <motion.div variants={scaleIn} whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
              <RoleCard
                role="parent"
                title="Parent"
                description="Monitor your child's attendance and receive notifications"
                icon={Heart}
                onClick={() => navigate("/login")}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        className="py-8 border-t border-border bg-card"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <motion.div
              className="flex items-center gap-3"
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <ClipboardCheck className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-foreground">
                  College Attendance System
                </h4>
                <p className="text-xs text-muted-foreground">
                  Final Year Diploma Project 2025-26
                </p>
              </div>
            </motion.div>

            <motion.div
              className="text-center md:text-right"
              initial={{ x: 20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <p className="text-sm text-muted-foreground">
                Government Polytechnic, Awasari (Kh.)
              </p>
              <p className="text-xs text-muted-foreground">
                Computer Engineering Department
              </p>
            </motion.div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}

