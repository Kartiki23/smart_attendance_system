import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: "present" | "absent" | "late" | "pending";
  studentName: string;
  subject: string;
  time: string;
}

interface RecentActivityProps {
  activities: Activity[];
  title?: string;
}

const statusConfig = {
  present: {
    icon: CheckCircle2,
    color: "text-faculty",
    bg: "bg-faculty-muted",
    label: "Present",
  },
  absent: {
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    label: "Absent",
  },
  late: {
    icon: Clock,
    color: "text-parent",
    bg: "bg-parent-muted",
    label: "Late",
  },
  pending: {
    icon: AlertCircle,
    color: "text-muted-foreground",
    bg: "bg-muted",
    label: "Pending",
  },
};

export function RecentActivity({ activities, title = "Recent Activity" }: RecentActivityProps) {
  return (
    <motion.div
      className="bg-card rounded-2xl p-6 border border-border"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="font-display font-semibold text-lg mb-6">{title}</h3>

      <div className="space-y-4">
        {activities.map((activity, index) => {
          const config = statusConfig[activity.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={activity.id}
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                  config.bg
                )}
              >
                <Icon className={cn("w-5 h-5", config.color)} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{activity.studentName}</p>
                <p className="text-xs text-muted-foreground">{activity.subject}</p>
              </div>

              <div className="text-right">
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-1 rounded-full",
                    config.bg,
                    config.color
                  )}
                >
                  {config.label}
                </span>
                <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
