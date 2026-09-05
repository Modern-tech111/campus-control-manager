import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GlassTooltip } from "@/components/dashboard/glass-tooltip";
import { useCampusData } from "@/context/campus-data";
import { percent } from "@/lib/format";

export function AttendanceTrendLine({ height = 280 }: { height?: number }) {
  const { analytics, loading } = useCampusData();
  if (loading) return null;
  const attendanceRateTrend = analytics.attendanceRateTrend;
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={attendanceRateTrend} margin={{ top: 8, right: 4, bottom: 0, left: -18 }}>
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
            domain={[88, 98]}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            tickFormatter={(value: number) => `${value}%`}
            width={44}
          />
          <Tooltip
            content={<GlassTooltip formatter={(value: number) => percent(value)} />}
            cursor={{ stroke: "var(--chart-1)", strokeOpacity: 0.35, strokeDasharray: "4 4" }}
          />
          <ReferenceLine
            y={95}
            stroke="var(--chart-3)"
            strokeDasharray="5 5"
            strokeOpacity={0.7}
            label={{
              value: "الهدف 95%",
              position: "insideBottomRight",
              fill: "var(--muted-foreground)",
              fontSize: 11,
            }}
          />
          <Line
            type="monotone"
            dataKey="rate"
            name="نسبة الحضور"
            stroke="var(--chart-1)"
            strokeWidth={2.5}
            dot={{ r: 2.5, strokeWidth: 2, stroke: "var(--background)", fill: "var(--chart-1)" }}
            activeDot={{ r: 4.5, strokeWidth: 2, stroke: "var(--background)" }}
            animationDuration={900}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
