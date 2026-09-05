import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AttendanceStatus, StudentStatus, StaffRole, StaffStatus, TaskPriority } from "@/lib/types";

const tone = {
  emerald: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  lime: "border-lime-500/25 bg-lime-500/10 text-lime-600 dark:text-lime-400",
  amber: "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  violet: "border-violet-500/25 bg-violet-500/10 text-violet-600 dark:text-violet-400",
  rose: "border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  cyan: "border-cyan-500/25 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  slate: "border-border bg-muted text-muted-foreground",
} as const;

const dot = {
  emerald: "bg-emerald-500",
  lime: "bg-lime-500",
  amber: "bg-amber-500",
  violet: "bg-violet-500",
  rose: "bg-rose-500",
  cyan: "bg-cyan-500",
  slate: "bg-muted-foreground/50",
} as const;

type Tone = keyof typeof tone;

function DotBadge({
  toneKey,
  children,
}: {
  toneKey: Tone;
  children: React.ReactNode;
}) {
  return (
    <Badge variant="outline" className={cn("gap-1.5 px-2 py-0.5 font-medium", tone[toneKey])}>
      <span className={cn("size-1.5 rounded-full", dot[toneKey])} />
      {children}
    </Badge>
  );
}

const attendanceMap: Record<AttendanceStatus, { label: string; tone: Tone }> = {
  present: { label: "حاضر", tone: "emerald" },
  late: { label: "متأخر", tone: "amber" },
  absent: { label: "غائب", tone: "rose" },
  excused: { label: "معذور", tone: "violet" },
};

export function AttendanceStatusBadge({ status }: { status: AttendanceStatus }) {
  const { label, tone: t } = attendanceMap[status];
  return <DotBadge toneKey={t}>{label}</DotBadge>;
}

const studentMap: Record<StudentStatus, { label: string; tone: Tone }> = {
  active: { label: "نشط", tone: "emerald" },
  new: { label: "جديد", tone: "lime" },
  "at-risk": { label: "معرض للخطر", tone: "amber" },
  inactive: { label: "غير نشط", tone: "slate" },
};

export function StudentStatusBadge({ status }: { status: StudentStatus }) {
  const { label, tone: t } = studentMap[status];
  return <DotBadge toneKey={t}>{label}</DotBadge>;
}

const staffRoleMap: Record<StaffRole, { label: string; tone: Tone }> = {
  principal: { label: "مدير", tone: "violet" },
  teacher: { label: "معلم", tone: "lime" },
  admin: { label: "إداري", tone: "cyan" },
  counselor: { label: "مرشد", tone: "emerald" },
  librarian: { label: "أمين مكتبة", tone: "amber" },
  support: { label: "دعم", tone: "slate" },
};

export function StaffRoleBadge({ role }: { role: StaffRole }) {
  const { label, tone: t } = staffRoleMap[role];
  return <DotBadge toneKey={t}>{label}</DotBadge>;
}

const staffStatusMap: Record<StaffStatus, { label: string; tone: Tone }> = {
  active: { label: "نشط", tone: "emerald" },
  "on-leave": { label: "في إجازة", tone: "amber" },
  new: { label: "جديد", tone: "lime" },
};

export function StaffStatusBadge({ status }: { status: StaffStatus }) {
  const { label, tone: t } = staffStatusMap[status];
  return <DotBadge toneKey={t}>{label}</DotBadge>;
}

const priorityMap: Record<TaskPriority, { label: string; tone: Tone }> = {
  high: { label: "مرتفع", tone: "rose" },
  medium: { label: "متوسط", tone: "amber" },
  low: { label: "منخفض", tone: "slate" },
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const { label, tone: t } = priorityMap[priority];
  return <DotBadge toneKey={t}>{label}</DotBadge>;
}
