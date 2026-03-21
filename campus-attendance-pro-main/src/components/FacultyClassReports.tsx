import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, TrendingUp, AlertCircle } from "lucide-react";
import api from "@/services/api";
import { FacultyClassDetailModal } from "./FacultyClassDetailModal";

// Interface matching the new backend response
interface FacultySubjectStats {
    subjectId: string;
    subjectName: string;
    classId: string;
    className: string;
    totalStudents: number;
    lecturesConducted: number;
    avgAttendance: number;
}

export function FacultyClassReports() {
    const [stats, setStats] = useState<FacultySubjectStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSub, setSelectedSub] = useState<FacultySubjectStats | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/attendance/faculty/stats');
                if (response.data.success) {
                    setStats(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch faculty class reports", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="p-4 text-center">Loading class reports...</div>;

    if (stats.length === 0) {
        return (
            <Card className="mb-6">
                <CardContent className="p-6 text-center text-muted-foreground">
                    No classes found. Ensure you are assigned to subjects in the timetable.
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                {stats.map((stat) => (
                    <motion.div
                        key={`${stat.subjectId}-${stat.classId}`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedSub(stat)}
                        className="cursor-pointer"
                    >
                        <Card className="card-professional h-full hover:shadow-lg transition-shadow border-t-4 border-t-primary">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-primary/10 p-2 rounded-lg">
                                        <BookOpen className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs font-bold ${stat.avgAttendance >= 75 ? 'bg-green-100 text-green-700' :
                                            stat.avgAttendance >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {stat.avgAttendance}% Avg
                                    </div>
                                </div>

                                <h3 className="font-bold text-lg text-foreground mb-1">{stat.className}</h3>
                                <p className="text-sm text-muted-foreground mb-4">{stat.subjectName}</p>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Users className="w-3 h-3" /> Students
                                        </span>
                                        <span className="font-semibold text-lg">{stat.totalStudents}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" /> Lectures
                                        </span>
                                        <span className="font-semibold text-lg">{stat.lecturesConducted}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {selectedSub && (
                <FacultyClassDetailModal
                    subjectName={selectedSub.subjectName}
                    className={selectedSub.className}
                    subjectId={selectedSub.subjectId}
                    classId={selectedSub.classId}
                    isOpen={!!selectedSub}
                    onClose={() => setSelectedSub(null)}
                />
            )}
        </>
    );
}
