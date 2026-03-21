import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    BookOpen,
    QrCode,
    MapPin,
    Users,
    Calendar,
    Shield,
    CheckCircle,
    Download,
    Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Documentation() {
    const navigate = useNavigate();

    const features = [
        {
            icon: QrCode,
            title: "QR Code Attendance",
            description: "Faculty generates time-limited QR codes for each lecture. Students scan to mark attendance instantly.",
            steps: [
                "Faculty starts a lecture session from dashboard",
                "System generates unique QR code",
                "Students scan QR using their mobile devices",
                "Attendance is marked automatically"
            ]
        },
        {
            icon: MapPin,
            title: "GPS Verification",
            description: "Location-based verification ensures students are physically present in the classroom.",
            steps: [
                "System captures student's GPS location",
                "Compares with classroom coordinates",
                "Validates within acceptable radius",
                "Prevents proxy attendance"
            ]
        },
        {
            icon: Users,
            title: "Multi-Role Access",
            description: "Four distinct user roles with specific permissions and dashboards.",
            steps: [
                "Administrator: Full system access and management",
                "Faculty: Lecture management and attendance tracking",
                "Student: Mark attendance and view records",
                "Parent: Monitor child's attendance"
            ]
        },
        {
            icon: Calendar,
            title: "Real-Time Reporting",
            description: "Comprehensive attendance reports and analytics available instantly.",
            steps: [
                "View live attendance statistics",
                "Generate custom reports by date range",
                "Export to Excel or PDF format",
                "Track attendance trends over time"
            ]
        }
    ];

    const userGuides = [
        {
            role: "Student",
            color: "blue",
            steps: [
                "Login with your enrollment ID and password",
                "Navigate to Student Dashboard",
                "When lecture starts, click 'Scan QR Code'",
                "Point camera at faculty's QR code",
                "Wait for GPS verification",
                "Attendance marked successfully"
            ]
        },
        {
            role: "Faculty",
            color: "green",
            steps: [
                "Login with your staff ID and password",
                "Select class and subject from dropdowns",
                "Click 'Start Lecture Session'",
                "System generates QR code automatically",
                "Display QR code to students",
                "Monitor real-time attendance list",
                "End session when lecture completes"
            ]
        },
        {
            role: "Administrator",
            color: "purple",
            steps: [
                "Access admin panel with credentials",
                "Manage users (add/edit/delete)",
                "Configure classes and subjects",
                "View system-wide statistics",
                "Generate comprehensive reports",
                "Export data for institutional records"
            ]
        },
        {
            role: "Parent",
            color: "orange",
            steps: [
                "Login with parent credentials",
                "View child's attendance dashboard",
                "Check daily/weekly/monthly attendance",
                "Receive notifications for absences",
                "Download attendance reports",
                "Contact faculty if needed"
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-primary text-primary-foreground py-6 shadow-md">
                <div className="container mx-auto px-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/")}
                        className="text-white hover:bg-white/10 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Button>

                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white rounded-full p-2">
                            <img
                                src="/college-logo.png"
                                alt="Government Polytechnic Awasari Logo"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div>
                            <h1 className="font-display text-3xl font-bold text-white mb-1">
                                System Documentation
                            </h1>
                            <p className="text-blue-100">
                                College Attendance Management System - User Guide
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {/* Introduction */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <Card className="card-professional">
                        <CardHeader>
                            <CardTitle className="text-2xl text-primary">About the System</CardTitle>
                            <CardDescription>
                                Professional attendance management solution for Government Polytechnic, Awasari (Kh.)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-foreground/80">
                                The College Attendance Management System is a comprehensive digital solution designed
                                specifically for Government Polytechnic institutes. It combines QR code technology with
                                GPS verification to ensure accurate, real-time attendance tracking across all departments
                                and semesters.
                            </p>
                            <div className="grid md:grid-cols-2 gap-4 mt-6">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                                    <div>
                                        <p className="font-semibold">No Proxy Attendance</p>
                                        <p className="text-sm text-muted-foreground">GPS verification prevents fraudulent marking</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                                    <div>
                                        <p className="font-semibold">Real-Time Tracking</p>
                                        <p className="text-sm text-muted-foreground">Instant attendance updates and notifications</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                                    <div>
                                        <p className="font-semibold">Paperless Solution</p>
                                        <p className="text-sm text-muted-foreground">Eco-friendly digital record keeping</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                                    <div>
                                        <p className="font-semibold">Multi-Role Access</p>
                                        <p className="text-sm text-muted-foreground">Custom dashboards for each user type</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Features */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-12"
                >
                    <h2 className="font-display text-2xl font-bold text-primary mb-6">Key Features</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {features.map((feature, index) => (
                            <Card key={index} className="card-professional">
                                <CardHeader>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                            <feature.icon className="w-6 h-6 text-primary" />
                                        </div>
                                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                                    </div>
                                    <CardDescription>{feature.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {feature.steps.map((step, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm">
                                                <span className="text-primary font-semibold">{idx + 1}.</span>
                                                <span className="text-foreground/80">{step}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </motion.div>

                {/* User Guides */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-12"
                >
                    <h2 className="font-display text-2xl font-bold text-primary mb-6">User Guides</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {userGuides.map((guide, index) => (
                            <Card key={index} className="card-professional">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Shield className="w-5 h-5" />
                                        {guide.role} Guide
                                    </CardTitle>
                                    <CardDescription>Step-by-step instructions for {guide.role.toLowerCase()}s</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ol className="space-y-3">
                                        {guide.steps.map((step, idx) => (
                                            <li key={idx} className="flex items-start gap-3">
                                                <span className={`flex-shrink-0 w-6 h-6 rounded-full bg-${guide.color}-100 text-${guide.color}-600 flex items-center justify-center text-xs font-semibold`}>
                                                    {idx + 1}
                                                </span>
                                                <span className="text-sm text-foreground/80 pt-0.5">{step}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </motion.div>

                {/* System Requirements */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-12"
                >
                    <Card className="card-professional">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Settings className="w-5 h-5" />
                                System Requirements
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                    <h4 className="font-semibold text-primary mb-3">For Students</h4>
                                    <ul className="space-y-2 text-sm text-foreground/80">
                                        <li>• Smartphone with camera</li>
                                        <li>• GPS enabled</li>
                                        <li>• Internet connection</li>
                                        <li>• Valid enrollment ID</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-primary mb-3">For Faculty</h4>
                                    <ul className="space-y-2 text-sm text-foreground/80">
                                        <li>• Computer or tablet</li>
                                        <li>• Display for QR code</li>
                                        <li>• Internet connection</li>
                                        <li>• Valid staff credentials</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-primary mb-3">For Admin</h4>
                                    <ul className="space-y-2 text-sm text-foreground/80">
                                        <li>• Desktop computer</li>
                                        <li>• Modern web browser</li>
                                        <li>• Stable internet</li>
                                        <li>• Admin credentials</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Support */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="card-professional bg-blue-50 border-blue-200">
                        <CardHeader>
                            <CardTitle className="text-xl text-primary">Need Help?</CardTitle>
                            <CardDescription>Contact support for assistance</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <p className="font-semibold mb-2">Technical Support</p>
                                    <p className="text-sm text-foreground/80">
                                        Email: support@polytechnic-awasari.edu<br />
                                        Phone: +91-XXXX-XXXXXX<br />
                                        Available: Mon-Fri, 9 AM - 5 PM
                                    </p>
                                </div>
                                <div>
                                    <p className="font-semibold mb-2">Administrator</p>
                                    <p className="text-sm text-foreground/80">
                                        Office: Computer Engineering Department<br />
                                        Email: admin@polytechnic-awasari.edu<br />
                                        Ext: 101
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <Button className="gap-2">
                                    <Download className="w-4 h-4" />
                                    Download PDF Guide
                                </Button>
                                <Button variant="outline" onClick={() => navigate("/login")}>
                                    Go to Login
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
