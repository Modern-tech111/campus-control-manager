import { motion } from "framer-motion";
import { CalendarX2, Clock3, Percent, Radar } from "lucide-react";
import { AbsenceReasons } from "@/components/dashboard/absence-reasons";
import { AttendanceTrendLine } from "@/components/dashboard/attendance-trend-line";
import { AttendanceWeeklyBar } from "@/components/dashboard/attendance-weekly-bar";
import { ChartCard } from "@/components/dashboard/chart-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { TrafficDonutChart } from "@/components/dashboard/traffic-donut-chart";
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
import { percent } from "@/lib/format";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

export default function Analytics() {
  const { classes, students, analytics, loading, error, reload } = useCampusData();
  const gradeDistribution = analytics.gradeDistribution;

  if (loading) return <PageLoader />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const avgAttendance = classes.length
    ? classes.reduce((sum, c) => sum + c.attendance, 0) / classes.length
    : 0;
  const weeklyAbsent = analytics.weeklyAttendance.reduce(
    (sum, d) => sum + d.absent,
    0,
  );
  const gradeTotal = gradeDistribution.reduce((sum, g) => sum + g.value, 0);
  const regularity =
    analytics.attendanceRateTrend.length > 0
      ? analytics.attendanceRateTrend[analytics.attendanceRateTrend.length - 1].rate
      : 0;
  const atRisk = students.filter((s) => s.status === "at-risk").length;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto flex w-full max-w-[1400px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8"
    >
      <motion.div variants={item}>
        <PageHeader
          title="التحليلات"
          description="رؤى الحضور والانتظام والتسجيل في جميع أنحاء المدرسة."
          actions={
            <Select defaultValue="term">
              <SelectTrigger className="h-9 w-36 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">هذا الشهر</SelectItem>
                <SelectItem value="term">هذا الفصل</SelectItem>
                <SelectItem value="year">هذا العام</SelectItem>
              </SelectContent>
            </Select>
          }
        />
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="متوسط الحضور" value={percent(avgAttendance)} delta={0} icon={Percent} hint="مقارنة بالفصل الماضي" />
        <StatCard label="الغياب الأسبوعي" value={weeklyAbsent.toLocaleString("en-US")} delta={0} icon={CalendarX2} iconClass="bg-rose-500/10 text-rose-500" hint="مقارنة بالأسبوع الماضي" />
        <StatCard label="الانتظام" value={percent(regularity)} delta={0} icon={Clock3} iconClass="bg-lime-500/10 text-lime-600 dark:text-lime-400" hint="مقارنة بالفصل الماضي" />
        <StatCard label="الطلاب المعرضون للخطر" value={atRisk.toLocaleString("en-US")} delta={0} icon={Radar} iconClass="bg-amber-500/10 text-amber-500" hint="مقارنة بالفصل الماضي" />
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="اتجاه نسبة الحضور"
          description="النسبة الشهرية مقابل هدف المدرسة 95%"
          className="lg:col-span-2"
          action={
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[var(--chart-1)]" /> نسبة الحضور
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[var(--chart-3)]" /> الهدف
              </span>
            </div>
          }
        >
          <AttendanceTrendLine height={300} />
        </ChartCard>

        <ChartCard title="الطلاب حسب الصف" description="توزيع التسجيل">
          <TrafficDonutChart data={gradeDistribution} centerLabel="الطلاب" centerValue={gradeTotal.toLocaleString("en-US")} />
          <div className="mt-2 space-y-2">
            {gradeDistribution.map((grade) => (
              <div key={grade.name} className="flex items-center justify-between text-[13px]">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="size-2 rounded-full" style={{ background: grade.color }} />
                  {grade.name}
                </span>
                <span dir="ltr" className="font-semibold tabular-nums">
                  {grade.value} · {gradeTotal > 0 ? ((grade.value / gradeTotal) * 100).toFixed(1) : "0.0"}%
                </span>
              </div>
            ))}
          </div>
        </ChartCard>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="الحضور اليومي"
          description="حاضر، متأخر وغائب حسب يوم المدرسة"
          action={
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[var(--chart-2)]" /> حاضر</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[var(--chart-4)]" /> متأخر</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[var(--chart-5)]" /> غائب</span>
            </div>
          }
        >
          <AttendanceWeeklyBar height={290} />
        </ChartCard>

        <ChartCard title="أسباب الغياب" description="تفصيل أيام الغياب هذا الشهر">
          <AbsenceReasons />
        </ChartCard>

        <ChartCard title="الحضور حسب الفصل" description="أداء الفصول هذا الفصل" contentClassName="p-0 overflow-hidden">
          <div className="px-4 pt-2">
            <table className="w-full text-start text-[13px]">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="pb-2.5 font-medium">الفصل</th>
                  <th className="pb-2.5 text-end font-medium">الطلاب</th>
                  <th className="pb-2.5 text-end font-medium">النسبة</th>
                </tr>
              </thead>
              <tbody>
                {[...classes]
                  .sort((a, b) => b.attendance - a.attendance)
                  .map((schoolClass) => (
                    <tr key={schoolClass.id} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5">
                        <span dir="ltr" className="inline-block font-medium text-foreground">
                          {schoolClass.name}
                        </span>
                      </td>
                      <td dir="ltr" className="py-2.5 text-end text-muted-foreground tabular-nums">
                        {schoolClass.students}
                      </td>
                      <td dir="ltr" className="py-2.5 text-end font-semibold tabular-nums">
                        {percent(schoolClass.attendance)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </motion.div>
    </motion.div>
  );
}
