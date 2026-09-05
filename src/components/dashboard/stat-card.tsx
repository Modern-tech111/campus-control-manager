import { useId } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { signedPercent } from "@/lib/format";

function Sparkline({ data }: { data: number[] }) {
  const gradientId = useId().replace(/:/g, "");
  const width = 96;
  const height = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);

  const points = data.map((value, i) => {
    const x = i * step;
    const y = height - 3 - ((value - min) / range) * (height - 6);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const areaPath = `M0,${height} L${points.join(" L")} L${width},${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="size-full"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke="var(--chart-1)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  iconClass,
  spark,
  hint,
}: {
  label: string;
  value: string;
  delta: number;
  icon: LucideIcon;
  iconClass?: string;
  spark?: number[];
  hint?: string;
}) {
  const positive = delta >= 0;

  return (
    <Card className="group relative overflow-hidden rounded-2xl border-border/60 p-5 shadow-[0_1px_2px_rgb(0_0_0/0.03),0_16px_40px_-24px_rgb(0_0_0/0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgb(0_0_0/0.04),0_24px_48px_-20px_rgb(0_0_0/0.18)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
          <p className="mt-1.5 text-[1.7rem] leading-none font-bold tracking-tight">
            <span dir="ltr" className="tabular-nums">
              {value}
            </span>
          </p>
        </div>
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/50",
            iconClass ?? "bg-primary/10 text-primary",
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span
          dir="ltr"
          className={cn(
            "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums",
            positive
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/10 text-rose-600 dark:text-rose-400",
          )}
        >
          {positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
          {signedPercent(delta)}
        </span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>

      {spark && (
        <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-9 opacity-80">
          <Sparkline data={spark} />
        </div>
      )}
    </Card>
  );
}
