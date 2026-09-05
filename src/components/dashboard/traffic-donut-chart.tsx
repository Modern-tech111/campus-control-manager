import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { GlassTooltip } from "@/components/dashboard/glass-tooltip";
import type { Slice } from "@/lib/types";
import { compact } from "@/lib/format";

export function TrafficDonutChart({
  data,
  centerLabel = "الإجمالي",
  centerValue,
  height = 240,
}: {
  data: Slice[];
  centerLabel?: string;
  centerValue?: string;
  height?: number;
}) {
  const total = data.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <div className="relative w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            content={<GlassTooltip formatter={(value: number) => compact(value)} />}
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="68%"
            outerRadius="92%"
            paddingAngle={3}
            cornerRadius={6}
            stroke="none"
            animationDuration={900}
          >
            {data.map((slice) => (
              <Cell key={slice.name} fill={slice.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Center label */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {centerLabel}
        </span>
        <span dir="ltr" className="mt-0.5 text-2xl font-bold tracking-tight tabular-nums">
          {centerValue ?? compact(total)}
        </span>
      </div>
    </div>
  );
}
