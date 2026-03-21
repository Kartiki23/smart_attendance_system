import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, MapPin, User, BookOpen, Loader2 } from "lucide-react";
import api from "@/services/api";
import { format } from "date-fns";

interface ScheduleItem {
  _id: string;
  subject: {
    name: string;
    code: string;
  };
  teacher?: {
    user?: {
      fullName: string;
    };
  };
  class?: {
    name: string;
  };
  startTime: string;
  endTime: string;
  day: string;
}

interface DailyScheduleProps {
  role: "student" | "faculty";
  classId?: string;
}

export function DailySchedule({ role, classId }: DailyScheduleProps) {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.append("role", role);

        console.log("Fetching daily schedule...");
        console.log("Role:", role);
        console.log("Calling URL:", `/timetable/daily?${params.toString()}`);

        const response = await api.get(`/timetable/daily?${params.toString()}`);

        console.log("Daily schedule response:", response.data);

        if (response.data.success) {
          setSchedule(response.data.data || []);
        } else {
          setSchedule([]);
        }
      } catch (err: any) {
        console.error("Daily schedule fetch error:", err);
        console.error("Server response:", err?.response?.data);
        setError(err?.response?.data?.message || "Could not load schedule.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [role, classId]);

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive text-sm p-4">{error}</div>;
  }

  if (schedule.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No classes scheduled for today.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            Today's Schedule
          </div>
          <Badge variant="outline">{format(new Date(), "EEEE")}</Badge>
        </CardTitle>
        <CardDescription>
          {role === "student" ? "Your upcoming classes" : "Your teaching schedule"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {schedule.map((item) => (
            <div
              key={item._id}
              className="flex items-start gap-4 p-3 rounded-lg border bg-card/50 hover:bg-accent/50 transition-colors"
            >
              <div className="flex flex-col items-center justify-center min-w-[3.5rem] py-1 px-2 bg-primary/10 rounded text-primary font-medium text-sm">
                <span>{item.startTime}</span>
                <span className="text-xs opacity-70">to</span>
                <span>{item.endTime}</span>
              </div>

              <div className="flex-1 space-y-1">
                <h4 className="font-semibold text-base leading-none">{item.subject?.name}</h4>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-3 w-3" />
                  <span>{item.subject?.code}</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1.5">
                  {role === "student" && (
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      <span>{item.teacher?.user?.fullName || "Unknown Staff"}</span>
                    </div>
                  )}

                  {role === "faculty" && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{item.class?.name || "No Class"}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}