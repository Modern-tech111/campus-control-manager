import { useCampusData } from "@/context/campus-data";

export function AbsenceReasons() {
  const { analytics, attendance, loading } = useCampusData();
  if (loading) return null;
  const absenceReasons = analytics.absenceReasons;
  const total = absenceReasons.reduce((sum, s) => sum + s.value, 0);
  const absentToday = attendance.filter((r) => r.status === "absent").length;

  return (
    <ul className="space-y-3.5">
      {absenceReasons.map((reason) => (
        <li key={reason.name}>
          <div className="flex items-center justify-between text-[13px]">
            <span className="flex items-center gap-2 font-medium text-foreground">
              <span className="size-2.5 rounded-full" style={{ background: reason.color }} />
              {reason.name}
            </span>
            <span dir="ltr" className="font-semibold text-foreground tabular-nums">
              {reason.value}%
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-[width] duration-700"
              style={{ width: `${(reason.value / total) * 100}%`, background: reason.color }}
            />
          </div>
        </li>
      ))}            <li className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
              <span>{absentToday} حالة غياب اليوم</span>
            </li>
    </ul>
  );
}
