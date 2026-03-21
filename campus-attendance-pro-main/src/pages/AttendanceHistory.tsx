import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, CheckCircle2, XCircle, Filter } from "lucide-react";
import { CollegeHeader } from "@/components/CollegeHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import axios from "axios";
import api from "@/services/api";

interface Attendance {
    _id: string;
    subject: {
        name: string;
        code: string;
    };
    status: string;
    date: string;
}

export default function AttendanceHistory() {

    const navigate = useNavigate();

    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch attendance from backend
    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {

        try {

            const token = localStorage.getItem("token");

            const res = await api.get(
                "/attendance/history",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setAttendance(res.data.data);

        } catch (error) {

            console.error("Error fetching attendance", error);

        } finally {

            setLoading(false);

        }
    };

    // Summary calculations
    const totalPresent = attendance.filter(a => a.status === "Present").length;
    const totalAbsent = attendance.filter(a => a.status === "Absent").length;
    const totalClasses = attendance.length;

    const attendancePercentage =
        totalClasses > 0 ? ((totalPresent / totalClasses) * 100).toFixed(1) : "0";

    if (loading) {
        return <div className="p-10 text-center">Loading attendance...</div>;
    }

    return (
        <div className="min-h-screen bg-background">

            <CollegeHeader />

            <div className="container mx-auto px-4 py-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >

                    <Button
                        variant="ghost"
                        onClick={() => navigate("/student")}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>

                    <h1 className="font-display text-3xl font-bold text-primary mb-2">
                        Attendance History
                    </h1>

                    <p className="text-muted-foreground">
                        View your complete attendance record
                    </p>

                </motion.div>

                {/* Summary Cards */}
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >

                    <Card className="card-professional">
                        <CardContent className="pt-6">

                            <div className="flex items-center gap-4">

                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">Total Present</p>
                                    <p className="text-2xl font-bold text-primary">{totalPresent}</p>
                                </div>

                            </div>

                        </CardContent>
                    </Card>


                    <Card className="card-professional">
                        <CardContent className="pt-6">

                            <div className="flex items-center gap-4">

                                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                    <XCircle className="w-6 h-6 text-red-600" />
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">Total Absent</p>
                                    <p className="text-2xl font-bold text-primary">{totalAbsent}</p>
                                </div>

                            </div>

                        </CardContent>
                    </Card>


                    <Card className="card-professional">
                        <CardContent className="pt-6">

                            <div className="flex items-center gap-4">

                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-blue-600" />
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">Attendance %</p>
                                    <p className="text-2xl font-bold text-primary">
                                        {attendancePercentage}%
                                    </p>
                                </div>

                            </div>

                        </CardContent>
                    </Card>

                </motion.div>


                {/* Attendance List */}
                <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >

                    {attendance.map((item) => (

                        <Card key={item._id} className="card-professional">

                            <CardContent className="p-4">

                                <div className="flex items-center justify-between">

                                    <div className="flex items-center gap-4">

                                        <Clock className="w-5 h-5 text-muted-foreground" />

                                        <div>
                                            <p className="font-semibold">
                                                {item.subject?.name}
                                            </p>

                                            <p className="text-sm text-muted-foreground">
                                                {new Date(item.date).toLocaleDateString()}
                                            </p>
                                        </div>

                                    </div>

                                    <span
                                        className={`px-4 py-1 rounded-full text-sm font-medium ${
                                            item.status === "Present"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                        }`}
                                    >
                                        {item.status}
                                    </span>

                                </div>

                            </CardContent>

                        </Card>

                    ))}

                </motion.div>


                {/* Export Button */}
                <div className="mt-8 flex justify-center">

                    <Button variant="outline" className="gap-2">
                        <Filter className="w-4 h-4" />
                        Export Attendance Report
                    </Button>

                </div>

            </div>

        </div>
    );
}