import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  role?: "admin" | "faculty" | "student" | "parent";
}

const roleStyles = {
  admin: "bg-gradient-admin",
  faculty: "bg-gradient-faculty",
  student: "bg-gradient-student",
  parent: "bg-gradient-parent",
};

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  role = "admin",
}: StatCardProps) {
  return (
    <motion.div
      className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-display font-bold mt-2 text-foreground">
            {value}
          </p>
          {change && (
            <p
              className={cn(
                "text-sm mt-2 font-medium",
                changeType === "positive" && "text-faculty",
                changeType === "negative" && "text-destructive",
                changeType === "neutral" && "text-muted-foreground"
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            roleStyles[role]
          )}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
}
