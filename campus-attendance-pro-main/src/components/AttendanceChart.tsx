import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

interface ChartData {
  name: string;
  attendance: number;
  present?: number;
}

interface AttendanceChartProps {
  data: ChartData[];
  role?: "admin" | "faculty" | "student" | "parent";
  title?: string;
}

const roleColors = {
  admin: { primary: "hsl(245, 58%, 51%)", secondary: "hsl(245, 58%, 85%)" },
  faculty: { primary: "hsl(160, 84%, 39%)", secondary: "hsl(160, 84%, 85%)" },
  student: { primary: "hsl(217, 91%, 60%)", secondary: "hsl(217, 91%, 85%)" },
  parent: { primary: "hsl(38, 92%, 50%)", secondary: "hsl(38, 92%, 85%)" },
};

export function AttendanceChart({
  data = [],
  role = "admin",
  title = "Attendance Overview",
}: AttendanceChartProps) {
  const colors = roleColors[role];

  if (!data || data.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border text-center text-muted-foreground">
        No attendance data available
      </div>
    );
  }

  return (
    <motion.div
      className="bg-card rounded-2xl p-6 border border-border"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="font-display font-semibold text-lg mb-6">{title}</h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id={`gradient-${role}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3} />
                <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
            />

            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />

            <YAxis
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />

            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                boxShadow:
                  "0 4px 6px -1px hsl(var(--foreground) / 0.1)",
              }}
            />

            <Area
              type="monotone"
              dataKey="attendance"
              stroke={colors.primary}
              strokeWidth={2}
              fill={`url(#gradient-${role})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}