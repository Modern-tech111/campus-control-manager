import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GlassTooltip } from "@/components/dashboard/glass-tooltip";
import { useCampusData } from "@/context/campus-data";

export function EnrollmentAreaChart({
  data,
  height = 300,
}: {
  data?: { month: string; enrolled: number; active: number }[];
  height?: number;
}) {
  const { analytics, loading } = useCampusData();
  if (loading) return null;
  const source = data ?? analytics.enrollmentTrend;
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={source} margin={{ top: 8, right: 4, bottom: 0, left: -8 }}>
          <defs>
            <linearGradient id="gradEnrolled" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.32} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradActive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.26} />
              <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--border)"
            strokeOpacity={0.6}
          />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            dy={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            width={44}
          />
          <Tooltip
            content={<GlassTooltip formatter={(value: number) => value.toLocaleString()} />}
            cursor={{ stroke: "var(--chart-1)", strokeOpacity: 0.35, strokeDasharray: "4 4" }}
          />
          <Area
            type="monotone"
            dataKey="enrolled"
            name="المسجلون"
            stroke="var(--chart-1)"
            strokeWidth={2.25}
            fill="url(#gradEnrolled)"
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--background)" }}
            animationDuration={900}
          />
          <Area
            type="monotone"
            dataKey="active"
            name="النشطون"
            stroke="var(--chart-2)"
            strokeWidth={2}
            fill="url(#gradActive)"
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--background)" }}
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
