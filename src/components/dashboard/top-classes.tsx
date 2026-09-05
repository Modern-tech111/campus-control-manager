import { BookOpen } from "lucide-react";
import { useCampusData } from "@/context/campus-data";
import type { SchoolClass } from "@/lib/types";
import { percent } from "@/lib/format";
import { cn } from "@/lib/utils";

function toneFor(rate: number) {
  if (rate >= 95) return "from-emerald-500 to-teal-500";
  if (rate >= 93) return "from-lime-400 to-lime-500";
  if (rate >= 91) return "from-amber-500 to-orange-500";
  return "from-rose-500 to-pink-500";
}

export function TopClasses({ items, limit }: { items?: SchoolClass[]; limit?: number }) {
  const { classes, loading } = useCampusData();
  if (loading) return null;
  const source = items ?? classes;
  const rows = (limit ? source.slice(0, limit) : source).sort(
    (a, b) => b.attendance - a.attendance,
  );

  return (
    <ul className="space-y-4">
      {rows.map((schoolClass, index) => (
        <li key={schoolClass.id}>
          <div className="flex items-center justify-between gap-3 text-[13px]">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-semibold text-muted-foreground tabular-nums">
                {index + 1}
              </span>
              <span dir="ltr" className="min-w-0 text-start">
                <span className="block truncate font-medium text-foreground">
                  {schoolClass.name}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  <BookOpen className="me-1 inline size-3 -translate-y-px" />
                  {schoolClass.subject}
                </span>
              </span>
            </div>
            <span dir="ltr" className="shrink-0 font-semibold text-foreground tabular-nums">
              {percent(schoolClass.attendance)}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full bg-gradient-to-r transition-[width] duration-700", toneFor(schoolClass.attendance))}
              style={{ width: `${schoolClass.attendance}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
