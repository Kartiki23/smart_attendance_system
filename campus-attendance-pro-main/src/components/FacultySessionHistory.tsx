import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Users
} from "lucide-react";

import api from "@/services/api";
import { DashboardLayout } from "./DashboardLayout";

interface SessionHistory {
  id: string;
  date: string;
  day: string;
  subject: string;
  class: string;
  time: string;
  batch: string;
  type: "theory" | "practical";
  studentCount: number;
  status: "Conducted" | "Missed";
}

export function FacultySessionHistory() {

  const [history, setHistory] = useState<SessionHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/attendance/faculty/history");

        if (res.data.success) {
          setHistory(res.data.data);
        }
      } catch (err) {
        console.error("History error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Loading session history...</div>;
  }

  if (!history.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No session history found.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-professional">
        <DashboardLayout role="faculty">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Session History
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Day</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {history.map((s) => (
              <TableRow key={s.id}>

                {/* DATE */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(s.date).toLocaleDateString()}
                  </div>
                </TableCell>

                <TableCell>{s.day}</TableCell>

                {/* SUBJECT */}
                <TableCell className="font-medium">
                  {s.subject}
                </TableCell>

                <TableCell>{s.class}</TableCell>

                {/* BATCH */}
                <TableCell>
                  <Badge className="bg-blue-100 text-blue-700">
                    {s.batch}
                  </Badge>
                </TableCell>

                {/* TYPE */}
                <TableCell>
                  <Badge
                    className={
                      s.type === "theory"
                        ? "bg-green-100 text-green-700"
                        : "bg-purple-100 text-purple-700"
                    }
                  >
                    {s.type.toUpperCase()}
                  </Badge>
                </TableCell>

                {/* STUDENT COUNT */}
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-gray-500" />
                    {s.studentCount}
                  </div>
                </TableCell>

                {/* TIME */}
                <TableCell className="text-sm text-muted-foreground">
                  {s.time}
                </TableCell>

                {/* STATUS */}
                <TableCell>
                  <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Conducted
                  </Badge>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      </DashboardLayout>
    </Card>
    
  );
}