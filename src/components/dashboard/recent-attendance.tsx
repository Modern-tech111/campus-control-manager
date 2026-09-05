import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { AttendanceStatusBadge } from "@/components/dashboard/badges";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCampusData } from "@/context/campus-data";
import type { AttendanceRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

const reasonArabic: Record<string, string> = {
  Sickness: "مرض",
  "Family reasons": "أسباب عائلية",
  Unexplained: "غير مبرر",
  "Medical appointment": "موعد طبي",
};

export function RecentAttendanceTable({ limit = 6 }: { limit?: number }) {
  const navigate = useNavigate();
  const { attendance, loading } = useCampusData();
  if (loading) return null;
  const rows = attendance.slice(0, limit);

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="h-9 text-xs font-medium">الطالب</TableHead>
          <TableHead className="h-9 text-xs font-medium">الفصل</TableHead>
          <TableHead className="h-9 text-xs font-medium">وقت الدخول</TableHead>
          <TableHead className="h-9 text-xs font-medium">الحالة</TableHead>
          <TableHead className="h-9 text-end text-xs font-medium">السبب</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((record) => (
          <TableRow
            key={record.id}
            className="group cursor-pointer"
            onClick={() => navigate("/dashboard/attendance")}
          >
            <TableCell>
              <div className="flex items-center gap-2.5">
                <Avatar className="size-7 rounded-lg">
                  <AvatarFallback
                    className={cn(
                      "bg-gradient-to-br text-[10px] font-semibold text-white",
                      record.avatar,
                    )}
                  >
                    {record.initials}
                  </AvatarFallback>
                </Avatar>
                <div dir="ltr" className="min-w-0 text-start">
                  <p className="truncate text-[13px] font-medium text-foreground">
                    {record.name}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {record.studentId}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <span dir="ltr" className="text-xs text-muted-foreground">{record.className}</span>
            </TableCell>
            <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
              {record.time}
            </TableCell>
            <TableCell>
              <AttendanceStatusBadge status={record.status} />
            </TableCell>
            <TableCell className="text-end text-xs text-muted-foreground">
              {record.reason ? (reasonArabic[record.reason] ?? record.reason) : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function AttendanceTableFooter() {
  const navigate = useNavigate();
  return (
    <button
      className="flex w-full items-center justify-center gap-1 border-t px-3 py-2.5 text-xs font-medium text-primary transition-colors hover:bg-accent/50"
      onClick={() => navigate("/dashboard/attendance")}
    >
      افتح سجل اليوم <ArrowLeft className="size-3.5" />
    </button>
  );
}
