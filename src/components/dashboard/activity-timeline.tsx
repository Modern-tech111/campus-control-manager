import { AlertTriangle, CreditCard, Sparkles, UserPlus, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCampusData } from "@/context/campus-data";
import type { Activity } from "@/lib/types";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

const typeConfig: Record<Activity["type"], { icon: LucideIcon; class: string }> = {
  enroll: { icon: UserPlus, class: "bg-lime-500/10 text-lime-600 dark:text-lime-400" },
  user: { icon: Users, class: "bg-cyan-500/10 text-cyan-500" },
  payment: { icon: CreditCard, class: "bg-emerald-500/10 text-emerald-500" },
  alert: { icon: AlertTriangle, class: "bg-amber-500/10 text-amber-500" },
  system: { icon: Sparkles, class: "bg-lime-500/10 text-lime-600 dark:text-lime-400" },
};

export function ActivityTimeline({ items, limit }: { items?: Activity[]; limit?: number }) {
  const { activities, loading } = useCampusData();
  if (loading) return null;
  const source = items ?? activities;
  const rows = limit ? source.slice(0, limit) : source;

  return (
    <ol className="relative space-y-5 before:absolute before:top-1 before:bottom-1 before:start-[15px] before:w-px before:bg-border">
      {rows.map((item) => {
        const config = typeConfig[item.type];
        const Icon = config.icon;
        return (
          <li key={item.id} className="relative flex gap-3.5">
            <div
              className={cn(
                "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-border/60",
                config.class,
              )}
            >
              <Icon className="size-3.5" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[13px] font-medium text-foreground">{item.title}</p>
                <time dir="ltr" className="shrink-0 text-[11px] text-muted-foreground">
                  {timeAgo(item.time)}
                </time>
              </div>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{item.detail}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
