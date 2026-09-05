import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, GraduationCap, Search, TriangleAlert, UserPlus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { StudentStatusBadge } from "@/components/dashboard/badges";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/page-header";
import { PageError, PageLoader } from "@/components/data-state";
import { useCampusData } from "@/context/campus-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { percent } from "@/lib/format";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

function attendanceTone(rate: number) {
  if (rate >= 95) return "bg-emerald-500";
  if (rate >= 90) return "bg-lime-500";
  if (rate >= 85) return "bg-amber-500";
  return "bg-rose-500";
}

export default function Students() {
  const { students, loading, error, reload } = useCampusData();
  const [query, setQuery] = useState("");
  const [grade, setGrade] = useState("all");
  const [page, setPage] = useState(1);

  const grades = [
    "all",
    ...Array.from(new Set(students.map((s) => String(s.grade)))).sort(),
  ];

  const filtered = useMemo(() => {
    return students.filter((student) => {
      const matchesQuery =
        !query ||
        student.name.toLowerCase().includes(query.toLowerCase()) ||
        student.id.toLowerCase().includes(query.toLowerCase()) ||
        student.guardian.toLowerCase().includes(query.toLowerCase());
      const matchesGrade = grade === "all" || String(student.grade) === grade;
      return matchesQuery && matchesGrade;
    });
  }, [query, grade]);

  if (loading) return <PageLoader />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const avgAttendance = students.length
    ? students.reduce((sum, s) => sum + s.attendance, 0) / students.length
    : 0;

  const summary = [
    { label: "Total students", value: students.length.toLocaleString("en-US"), icon: GraduationCap, iconClass: "bg-lime-500/10 text-lime-600 dark:text-lime-400" },
    { label: "New this term", value: students.filter((s) => s.status === "new").length.toLocaleString("en-US"), icon: UserPlus, iconClass: "bg-cyan-500/10 text-cyan-500" },
    { label: "Avg. attendance", value: percent(avgAttendance), icon: Users, iconClass: "bg-emerald-500/10 text-emerald-500" },
    { label: "At risk", value: students.filter((s) => s.status === "at-risk").length.toLocaleString("en-US"), icon: TriangleAlert, iconClass: "bg-amber-500/10 text-amber-500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="mx-auto flex w-full max-w-[1400px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8"
    >
      <PageHeader
        title="Students"
        description="Student roster, attendance performance and guardian contacts."
        actions={
          <Button className="gap-1.5 text-sm">
            <UserPlus className="size-4" /> Enroll student
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summary.map((stat) => (
          <Card key={stat.label} className="flex items-center gap-3 rounded-2xl border-border/60 p-4 shadow-[0_1px_2px_rgb(0_0_0/0.03)]">
            <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", stat.iconClass)}>
              <stat.icon className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-muted-foreground">{stat.label}</p>
              <p className="mt-0.5 text-lg font-bold tracking-tight tabular-nums">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => { setQuery(event.target.value); setPage(1); }}
            placeholder="Search by name, ID or guardian…"
            className="h-10 rounded-xl bg-background pl-9 shadow-none"
          />
        </div>
        <Select value={grade} onValueChange={(value) => { setGrade(value); setPage(1); }}>
          <SelectTrigger className="h-10 w-44 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {grades.map((g) => (
              <SelectItem key={g} value={g}>
                {g === "all" ? "All grades" : `Grade ${g}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="overflow-hidden rounded-2xl border-border/60 shadow-[0_1px_2px_rgb(0_0_0/0.03),0_16px_40px_-24px_rgb(0_0_0/0.14)]">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="h-10 text-xs font-medium">Student</TableHead>
              <TableHead className="h-10 text-xs font-medium">Class</TableHead>
              <TableHead className="h-10 text-xs font-medium">Guardian</TableHead>
              <TableHead className="h-10 w-[20%] text-xs font-medium">Attendance</TableHead>
              <TableHead className="h-10 text-xs font-medium">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((student) => (
              <TableRow key={student.id} className="group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9 rounded-lg">
                      <AvatarFallback className={cn("bg-gradient-to-br text-xs font-semibold text-white", student.avatar)}>
                        {student.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-foreground">{student.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{student.id} · {student.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-[13px] text-muted-foreground">{student.className}</TableCell>
                <TableCell>
                  <p className="text-[13px] font-medium text-foreground">{student.guardian}</p>
                  <p className="text-xs text-muted-foreground">{student.phone}</p>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="h-1.5 w-full max-w-28 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full", attendanceTone(student.attendance))}
                        style={{ width: `${student.attendance}%` }}
                      />
                    </div>
                    <span className="w-10 shrink-0 text-right text-xs font-semibold tabular-nums">
                      {percent(student.attendance, 0)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <StudentStatusBadge status={student.status} />
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                  No students match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, filtered.length)}
            </span>{" "}
            of <span className="font-medium text-foreground">{filtered.length}</span> students
          </p>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="icon" className="size-8" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} aria-label="Previous page">
              <ChevronLeft className="size-4" />
            </Button>
            <span className="px-1 text-xs font-medium text-muted-foreground tabular-nums">
              {currentPage} / {pages}
            </span>
            <Button variant="outline" size="icon" className="size-8" disabled={currentPage >= pages} onClick={() => setPage(currentPage + 1)} aria-label="Next page">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
