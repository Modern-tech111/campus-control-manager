import { motion } from "framer-motion";
import { CalendarCheck2, ClipboardCheck, Download, GraduationCap, TriangleAlert, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AbsenceReasons } from "@/components/dashboard/absence-reasons";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { AttendanceTrendLine } from "@/components/dashboard/attendance-trend-line";
import { AttendanceWeeklyBar } from "@/components/dashboard/attendance-weekly-bar";
import { ChartCard } from "@/components/dashboard/chart-card";
import { EnrollmentAreaChart } from "@/components/dashboard/enrollment-area-chart";
import { AttendanceTableFooter, RecentAttendanceTable } from "@/components/dashboard/recent-attendance";
import { StatCard } from "@/components/dashboard/stat-card";
import { TopClasses } from "@/components/dashboard/top-classes";
import { useAuth } from "@/hooks/use-auth";
import { useCampusData } from "@/context/campus-data";
import { percent } from "@/lib/format";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

export default function Overview() {
  const { user } = useAuth();
  const { students, staff, attendance } = useCampusData();
  const firstName = String(user?.name || "زائر").split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "صباح الخير" : hour < 18 ? "مساء الخير" : "مساء الخير";

  const presentToday = attendance.filter((r) => r.status === "present").length;
  const absentToday = attendance.filter((r) => r.status === "absent").length;
  const attendanceRate = attendance.length
    ? (presentToday / attendance.length) * 100
    : 0;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto flex w-full max-w-[1400px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
              weekday: "long",
              month: "long",
              day: "numeric",
            }).format(new Date())}
          </p>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight sm:text-3xl">
            {greeting}، <span dir="ltr">{firstName}</span> 🎓
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            إليك ملخص اليوم في كامبوس كونترول.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="today">
            <SelectTrigger className="h-9 w-36 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">اليوم</SelectItem>
              <SelectItem value="week">هذا الأسبوع</SelectItem>
              <SelectItem value="month">هذا الشهر</SelectItem>
              <SelectItem value="term">هذا الفصل</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-9 gap-1.5 text-sm">
                <Download className="size-4" /> تصدير
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem>تصدير كـ PDF</DropdownMenuItem>
              <DropdownMenuItem>تصدير كـ CSV</DropdownMenuItem>
              <DropdownMenuItem>إرسال ملخص يومي بالبريد</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* KPI row */}
      <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="إجمالي الطلاب"
          value={students.length.toLocaleString("en-US")}
          delta={0}
          icon={GraduationCap}
          hint="مقارنة بالفصل الماضي"
        />
        <StatCard
          label="أعضاء هيئة التدريس"
          value={staff.length.toLocaleString("en-US")}
          delta={0}
          icon={Users}
          iconClass="bg-lime-500/10 text-lime-600 dark:text-lime-400"
          hint="مقارنة بالفصل الماضي"
        />
        <StatCard
          label="الحضور اليوم"
          value={percent(attendanceRate)}
          delta={0}
          icon={ClipboardCheck}
          iconClass="bg-emerald-500/10 text-emerald-500"
          hint="مقارنة بالأمس"
        />
        <StatCard
          label="الغياب اليوم"
          value={absentToday.toLocaleString("en-US")}
          delta={0}
          icon={TriangleAlert}
          iconClass="bg-amber-500/10 text-amber-500"
          hint="مقارنة بالأمس"
        />
      </motion.div>

      {/* Enrollment + absence reasons */}
      <motion.div variants={item} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="اتجاه التسجيل"
          description="المسجلون مقابل النشطون"
          className="lg:col-span-2"
          action={
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[var(--chart-1)]" /> المسجلون
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[var(--chart-2)]" /> النشطون
              </span>
            </div>
          }
        >
          <EnrollmentAreaChart />
        </ChartCard>

        <ChartCard title="أسباب الغياب" description="لماذا غاب الطلاب عن الحصص هذا الشهر">
          <AbsenceReasons />
        </ChartCard>
      </motion.div>

      {/* Attendance register + activity */}
      <motion.div variants={item} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="حضور اليوم"
          description="آخر السجلات من السجل الصباحي"
          className="lg:col-span-2"
          contentClassName="p-0 overflow-hidden"
        >
          <div className="px-4 pt-2">
            <RecentAttendanceTable limit={6} />
          </div>
          <AttendanceTableFooter />
        </ChartCard>

        <ChartCard title="النشاط الأخير" description="ما يحدث في المدرسة" contentClassName="pt-0">
          <div className="px-4 pt-3 pb-2">
            <ActivityTimeline limit={6} />
          </div>
        </ChartCard>
      </motion.div>

      {/* Weekly attendance + rate + top classes */}
      <motion.div variants={item} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="الحضور هذا الأسبوع"
          description="حاضر، متأخر وغائب حسب اليوم"
          action={
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[var(--chart-2)]" /> حاضر
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[var(--chart-4)]" /> متأخر
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[var(--chart-5)]" /> غائب
              </span>
            </div>
          }
        >
          <AttendanceWeeklyBar height={232} />
        </ChartCard>

        <ChartCard
          title="نسبة الحضور"
          description="اتجاه 12 شهراً مقابل هدف المدرسة 95%"
          action={<CalendarCheck2 className="size-4 text-muted-foreground" />}
        >
          <AttendanceTrendLine height={232} />
        </ChartCard>

        <ChartCard title="أفضل الفصول" description="أفضل حضور حسب الفصل">
          <TopClasses limit={5} />
        </ChartCard>
      </motion.div>
    </motion.div>
  );
}
