import { motion } from "framer-motion";
import { CalendarCheck2, Check, ClipboardCheck, Clock3, Search, ShieldAlert, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageError, PageLoader } from "@/components/data-state";
import { useCampusData } from "@/context/campus-data";
import type { AttendanceStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const statusOptions: { value: AttendanceStatus; label: string; icon: typeof Check; active: string; idle: string }[] = [
  {
    value: "present", label: "Present", icon: Check,
    active: "border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    idle: "text-muted-foreground hover:border-emerald-500/30 hover:text-emerald-500",
  },
  {
    value: "late", label: "Late", icon: Clock3,
    active: "border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-400",
    idle: "text-muted-foreground hover:border-amber-500/30 hover:text-amber-500",
  },
  {
    value: "absent", label: "Absent", icon: X,
    active: "border-rose-500/40 bg-rose-500/15 text-rose-600 dark:text-rose-400",
    idle: "text-muted-foreground hover:border-rose-500/30 hover:text-rose-500",
  },
  {
    value: "excused", label: "Excused", icon: ShieldAlert,
    active: "border-lime-500/40 bg-lime-500/15 text-lime-600 dark:text-lime-400",
    idle: "text-muted-foreground hover:border-lime-500/30 hover:text-lime-500",
  },
];

export default function Attendance() {
  const { attendance: records, setAttendanceStatus, loading, error, reload } = useCampusData();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | AttendanceStatus>("all");

  const counts = useMemo(() => {
    return {
      present: records.filter((r) => r.status === "present").length,
      late: records.filter((r) => r.status === "late").length,
      absent: records.filter((r) => r.status === "absent").length,
      excused: records.filter((r) => r.status === "excused").length,
    };
  }, [records]);

  const setStatus = async (id: string, status: AttendanceStatus) => {
    try {
      await setAttendanceStatus(id, status);
      toast.success("Attendance updated", { duration: 1500 });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update attendance");
    }
  };

  const filtered = useMemo(() => {
    return records.filter((record) => {
      const matchesQuery =
        !query ||
        record.name.toLowerCase().includes(query.toLowerCase()) ||
        record.className.toLowerCase().includes(query.toLowerCase());
      const matchesFilter = filter === "all" || record.status === filter;
      return matchesQuery && matchesFilter;
    });
  }, [records, query, filter]);

  if (loading) return <PageLoader />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const summary = [
    { label: "Present", value: counts.present, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Late", value: counts.late, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
    { label: "Absent", value: counts.absent, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10" },
    { label: "Excused", value: counts.excused, color: "text-lime-600 dark:text-lime-400", bg: "bg-lime-500/10" },
  ];

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="mx-auto flex w-full max-w-[1400px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8"
    >
      <PageHeader
        title="Attendance"
        description={`Presence & absence register — ${today}. Tap a status to update it.`}
        actions={
          <div className="flex items-center gap-2">
            <CalendarCheck2 className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Morning register</span>
          </div>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summary.map((stat) => (
          <Card key={stat.label} className="flex items-center gap-3 rounded-2xl border-border/60 p-4 shadow-[0_1px_2px_rgb(0_0_0/0.03)]">
            <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", stat.bg)}>
              <ClipboardCheck className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
              <p className={cn("mt-0.5 text-lg font-bold tracking-tight tabular-nums", stat.color)}>
                {stat.value}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={(value) => setFilter(value as "all" | AttendanceStatus)}>
          <TabsList className="h-9 bg-muted/70">
            <TabsTrigger value="all" className="px-3 text-xs">All</TabsTrigger>
            <TabsTrigger value="present" className="px-3 text-xs">Present</TabsTrigger>
            <TabsTrigger value="late" className="px-3 text-xs">Late</TabsTrigger>
            <TabsTrigger value="absent" className="px-3 text-xs">Absent</TabsTrigger>
            <TabsTrigger value="excused" className="px-3 text-xs">Excused</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search student or class…"
            className="h-10 rounded-xl bg-background pl-9 shadow-none"
          />
        </div>
      </div>

      {/* Register */}
      <div className="grid grid-cols-1 gap-2.5">
        {filtered.map((record, index) => (
          <motion.div
            key={record.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.025, ease: "easeOut" }}
          >
            <Card className="flex flex-col gap-3 rounded-2xl border-border/60 p-3.5 transition-all duration-200 hover:shadow-[0_12px_32px_-16px_rgb(0_0_0/0.15)] sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar className="size-9 rounded-lg">
                  <AvatarFallback className={cn("bg-gradient-to-br text-xs font-semibold text-white", record.avatar)}>
                    {record.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-foreground">{record.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {record.studentId} · {record.className}
                  </p>
                </div>
                <span className="ml-auto shrink-0 text-xs text-muted-foreground tabular-nums sm:ml-4">
                  {record.time}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                {statusOptions.map((option) => {
                  const active = record.status === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setStatus(record.id, option.value)}
                      title={option.label}
                      className={cn(
                        "flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-all duration-150",
                        active ? option.active : cn("border-border/60", option.idle),
                      )}
                    >
                      <option.icon className="size-3.5" />
                      <span className="hidden lg:inline">{option.label}</span>
                    </button>
                  );
                })}
                {record.reason && record.status !== "present" && (
                  <span className="hidden text-[11px] text-muted-foreground md:block">
                    · {record.reason}
                  </span>
                )}
              </div>
            </Card>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <Card className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-14 text-center">
            <ClipboardCheck className="size-6 text-muted-foreground/50" />
            <p className="text-sm font-medium text-foreground">No records found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your search or filter.</p>
          </Card>
        )}
      </div>            <p className="text-xs text-muted-foreground">
              {records.length} students in the register ·{" "}
              {records.length > 0 ? ((counts.present / records.length) * 100).toFixed(1) : "0.0"}%
              present today
            </p>
    </motion.div>
  );
}
