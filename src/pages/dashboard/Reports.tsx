import { motion } from "framer-motion";
import { Download, FileBarChart } from "lucide-react";
import { AbsenceReasons } from "@/components/dashboard/absence-reasons";
import { AttendanceTrendLine } from "@/components/dashboard/attendance-trend-line";
import { ChartCard } from "@/components/dashboard/chart-card";
import { EnrollmentAreaChart } from "@/components/dashboard/enrollment-area-chart";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/layout/page-header";
import { PageError, PageLoader } from "@/components/data-state";
import { useCampusData } from "@/context/campus-data";
import { currency, fullDate, percent } from "@/lib/format";
import { cn } from "@/lib/utils";

const feeTone = {
  paid: "text-emerald-600 dark:text-emerald-400",
  pending: "text-amber-600 dark:text-amber-400",
  overdue: "text-rose-600 dark:text-rose-400",
};

export default function Reports() {
  const { classes, fees, attendance, loading, error, reload } = useCampusData();

  if (loading) return <PageLoader />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const avgAttendance = classes.length
    ? classes.reduce((sum, c) => sum + c.attendance, 0) / classes.length
    : 0;
  const absences = attendance.filter((r) => r.status === "absent").length;
  const collected = fees
    .filter((tx) => tx.status === "paid")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const pending = fees
    .filter((tx) => tx.status !== "paid")
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="mx-auto flex w-full max-w-[1400px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8"
    >
      <PageHeader
        title="Reports"
        description="Attendance performance and fee collection for the current term."
        actions={
          <>
            <Select defaultValue="term1">
              <SelectTrigger className="h-9 w-40 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="term1">Term 1 · 2026</SelectItem>
                <SelectItem value="term2">Term 2 · 2025</SelectItem>
                <SelectItem value="term3">Term 3 · 2025</SelectItem>
              </SelectContent>
            </Select>
            <Button className="h-9 gap-1.5 text-sm">
              <Download className="size-4" /> Download
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Avg. attendance", value: percent(avgAttendance), delta: "—" },
          { label: "Absences today", value: absences.toLocaleString("en-US"), delta: "—" },
          { label: "Fees collected", value: currency(collected), delta: "—" },
          { label: "Fees outstanding", value: currency(pending), delta: "—" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border/60 bg-card p-4 shadow-[0_1px_2px_rgb(0_0_0/0.03)]">
            <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-xl font-bold tracking-tight tabular-nums">{stat.value}</p>
            <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">{stat.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Attendance rate"
          description="Monthly trend vs the 95% school target"
          action={
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[var(--chart-1)]" /> Attendance rate</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[var(--chart-3)]" /> Target</span>
            </div>
          }
        >
          <AttendanceTrendLine height={300} />
        </ChartCard>

        <ChartCard
          title="Enrollment growth"
          description="Enrolled vs active students over 12 months"
          action={
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[var(--chart-1)]" /> Enrolled</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[var(--chart-2)]" /> Active</span>
            </div>
          }
        >
          <EnrollmentAreaChart height={300} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Absence reasons" description="Why students missed class">
          <AbsenceReasons />
        </ChartCard>

        <ChartCard
          title="Fee collection"
          description="Recent tuition payments and invoices"
          className="lg:col-span-2"
          contentClassName="p-0 overflow-hidden"
        >
          <div className="overflow-x-auto px-4 pt-2">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="pb-2.5 font-medium">Invoice</th>
                  <th className="pb-2.5 font-medium">Student</th>
                  <th className="pb-2.5 font-medium">Method</th>
                  <th className="pb-2.5 font-medium">Date</th>
                  <th className="pb-2.5 text-right font-medium">Amount</th>
                  <th className="pb-2.5 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((tx) => (
                  <tr key={tx.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 font-mono text-xs font-semibold text-foreground">{tx.id}</td>
                    <td className="py-3 font-medium text-foreground">{tx.student}</td>
                    <td className="py-3 text-muted-foreground">{tx.method}</td>
                    <td className="py-3 text-muted-foreground tabular-nums">{fullDate(tx.date)}</td>
                    <td className="py-3 text-right font-semibold tabular-nums">
                      {tx.amount === 0 ? "—" : currency(tx.amount)}
                    </td>
                    <td className={cn("py-3 text-right font-medium capitalize tabular-nums", feeTone[tx.status])}>
                      {tx.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <FileBarChart className="size-3.5" /> Reports refresh automatically every 15 minutes.
      </p>
    </motion.div>
  );
}
