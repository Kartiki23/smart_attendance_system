import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleCardProps {
  role: "admin" | "faculty" | "student" | "parent";
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
}

const roleStyles = {
  admin: {
    gradient: "bg-gradient-admin",
    bg: "bg-admin-muted",
    border: "border-admin/20",
    text: "text-admin",
  },
  faculty: {
    gradient: "bg-gradient-faculty",
    bg: "bg-faculty-muted",
    border: "border-faculty/20",
    text: "text-faculty",
  },
  student: {
    gradient: "bg-gradient-student",
    bg: "bg-student-muted",
    border: "border-student/20",
    text: "text-student",
  },
  parent: {
    gradient: "bg-gradient-parent",
    bg: "bg-parent-muted",
    border: "border-parent/20",
    text: "text-parent",
  },
};

export function RoleCard({ role, title, description, icon: Icon, onClick }: RoleCardProps) {
  const styles = roleStyles[role];

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "relative group w-full p-6 rounded-2xl border-2 transition-all duration-300",
        "hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
        styles.bg,
        styles.border,
        "text-left overflow-hidden"
      )}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Gradient overlay on hover */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300",
          styles.gradient
        )}
      />

      {/* Icon */}
      <div
        className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center mb-4",
          styles.gradient
        )}
      >
        <Icon className="w-7 h-7 text-white" />
      </div>

      {/* Content */}
      <h3 className={cn("text-xl font-display font-semibold mb-2", styles.text)}>
        {title}
      </h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>

      {/* Arrow indicator */}
      <div
        className={cn(
          "absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0 translate-x-2",
          styles.text
        )}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </motion.button>
  );
}
