import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GlassTooltip } from "@/components/dashboard/glass-tooltip";
import { useCampusData } from "@/context/campus-data";

export function AttendanceWeeklyBar({ height = 280 }: { height?: number }) {
  const { analytics, loading } = useCampusData();
  if (loading) return null;
  const weeklyAttendance = analytics.weeklyAttendance;
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={weeklyAttendance} margin={{ top: 8, right: 4, bottom: 0, left: -18 }} barGap={2}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--border)"
            strokeOpacity={0.6}
          />
          <XAxis
            dataKey="day"
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
            cursor={{ fill: "var(--muted)", fillOpacity: 0.5 }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value: string) => (
              <span className="text-xs text-muted-foreground">{value}</span>
            )}
            wrapperStyle={{ paddingTop: 8 }}
          />
          <Bar
            dataKey="present"
            name="حاضر"
            stackId="a"
            fill="var(--chart-2)"
            radius={[0, 0, 0, 0]}
            maxBarSize={34}
            animationDuration={900}
          />
          <Bar
            dataKey="late"
            name="متأخر"
            stackId="a"
            fill="var(--chart-4)"
            radius={[0, 0, 0, 0]}
            maxBarSize={34}
            animationDuration={900}
          />
          <Bar
            dataKey="absent"
            name="غائب"
            stackId="a"
            fill="var(--chart-5)"
            radius={[5, 5, 2, 2]}
            maxBarSize={34}
            animationDuration={900}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
