import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import { BookOpen, User } from "lucide-react";
import api from "../services/api";
import { SubjectDetailModal } from "./SubjectDetailModal";

interface SubjectStat {
  id: string;
  name: string;
  code: string;
  teacher: string;
  totalLectures: number;
  presentCount: number;
  percentage: number;
}

interface SubjectStatsProps {
  studentId?: string;
}

export function SubjectStats({ studentId }: SubjectStatsProps) {
  const [stats, setStats] = useState<SubjectStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<SubjectStat | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        const response = await api.get("/attendance/stats");

        if (response.data.success) {
          setStats(response.data.data || []);
        } else {
          setStats([]);
        }
      } catch (error) {
        console.error("Failed to fetch subject stats", error);
        setStats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [studentId]);

  if (loading) {
    return <div className="p-4 text-center">Loading subjects...</div>;
  }

  if (stats.length === 0) {
    return (
      <Card className="mb-8">
        <CardContent className="p-6 text-center text-muted-foreground">
          No subjects found.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <div className="container mx-auto px-4 py-8">
    <h1 className="text-2xl font-bold mb-6 ">
          📊 My Attendance Dashboard
        </h1>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedSubject(stat)}
            className="cursor-pointer"
          >
            <Card className="card-professional h-full hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>

                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      stat.percentage >= 75
                        ? "bg-green-100 text-green-700"
                        : stat.percentage >= 60
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {stat.percentage}% Attendance
                  </div>
                </div>

                <h3 className="font-bold text-lg text-foreground mb-1">
                  {stat.name}
                </h3>

                <p className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
                  <User className="w-3 h-3" />
                  {stat.teacher}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">Lectures</p>
                    <p className="font-semibold">{stat.totalLectures}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Attended</p>
                    <p
                      className="font-semibold data-[low=true]:text-red-500"
                      data-low={stat.percentage < 75}
                    >
                      {stat.presentCount}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {selectedSubject && (
        <SubjectDetailModal
          subject={selectedSubject}
          isOpen={!!selectedSubject}
          onClose={() => setSelectedSubject(null)}
        />
      )}
      </div>
    </>
  );
}