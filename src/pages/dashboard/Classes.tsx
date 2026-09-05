import { motion } from "framer-motion";
import { BookOpen, DoorOpen, Plus, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { PageError, PageLoader } from "@/components/data-state";
import { useCampusData } from "@/context/campus-data";
import { percent } from "@/lib/format";
import { cn } from "@/lib/utils";

function attendanceTone(rate: number) {
  if (rate >= 95) return "from-emerald-500 to-teal-500";
  if (rate >= 93) return "from-lime-400 to-lime-500";
  if (rate >= 91) return "from-amber-500 to-orange-500";
  return "from-rose-500 to-pink-500";
}

export default function Classes() {
  const { classes, loading, error, reload } = useCampusData();

  if (loading) return <PageLoader />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const avgAttendance = classes.length
    ? classes.reduce((sum, c) => sum + c.attendance, 0) / classes.length
    : 0;
  const totalSeats = classes.reduce((sum, c) => sum + c.students, 0);
  const fillingRate = classes.length
    ? (classes.reduce((sum, c) => sum + Math.min(c.students / 34, 1), 0) /
        classes.length) *
      100
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="mx-auto flex w-full max-w-[1400px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8"
    >
      <PageHeader
        title="Classes"
        description="Homerooms, teachers and attendance at a glance."
        actions={
          <Button className="gap-1.5 text-sm">
            <Plus className="size-4" /> New class
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Active classes", value: String(classes.length) },
          { label: "Avg. attendance", value: percent(avgAttendance) },
          { label: "Total seats", value: totalSeats.toLocaleString("en-US") },
          { label: "Filling rate", value: percent(fillingRate, 0) },
        ].map((stat) => (
          <Card key={stat.label} className="rounded-2xl border-border/60 p-4">
            <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-xl font-bold tracking-tight tabular-nums">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {classes.map((schoolClass, index) => (
          <motion.div
            key={schoolClass.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.04, ease: "easeOut" }}
          >
            <Card className="group overflow-hidden rounded-2xl border-border/60 shadow-[0_1px_2px_rgb(0_0_0/0.03),0_16px_40px_-24px_rgb(0_0_0/0.14)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-20px_rgb(0_0_0/0.2)]">
              {/* Header */}
              <div className="relative flex items-center justify-between bg-gradient-to-br from-lime-400/10 via-slate-500/10 to-transparent px-4 pt-4 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-lime-400 to-lime-500 text-primary-foreground shadow-lg shadow-lime-500/25">
                    <BookOpen className="size-4.5" />
                  </span>
                  <div>
                    <h3 className="text-[15px] font-semibold tracking-tight">{schoolClass.name}</h3>
                    <p className="text-xs text-muted-foreground">{schoolClass.subject}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    "rounded-full bg-gradient-to-r px-2.5 py-1 text-xs font-bold text-primary-foreground tabular-nums",
                    attendanceTone(schoolClass.attendance),
                  )}
                >
                  {percent(schoolClass.attendance)}
                </span>
              </div>

              <div className="space-y-3 px-4 pb-4">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <UserRound className="size-3.5" /> {schoolClass.teacher}
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <DoorOpen className="size-3.5" /> {schoolClass.room}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Class size</span>
                    <span className="font-medium text-foreground tabular-nums">
                      {schoolClass.students} students
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full bg-gradient-to-r transition-[width] duration-700",
                        attendanceTone(schoolClass.attendance),
                      )}
                      style={{ width: `${(schoolClass.students / 34) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border/50 pt-3 text-xs">
                  <span className="text-muted-foreground">Attendance rate</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full bg-gradient-to-r",
                          attendanceTone(schoolClass.attendance),
                        )}
                        style={{ width: `${schoolClass.attendance}%` }}
                      />
                    </div>
                    <span className="w-11 text-right font-semibold text-foreground tabular-nums">
                      {percent(schoolClass.attendance, 0)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
