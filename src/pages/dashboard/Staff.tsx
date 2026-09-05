import { motion } from "framer-motion";
import { Briefcase, Search, UserPlus, UserRound, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { StaffRoleBadge, StaffStatusBadge } from "@/components/dashboard/badges";
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
import type { StaffRole } from "@/lib/types";
import { percent, fullDate } from "@/lib/format";
import { cn } from "@/lib/utils";

function attendanceTone(rate: number) {
  if (rate >= 95) return "bg-emerald-500";
  if (rate >= 90) return "bg-lime-500";
  return "bg-amber-500";
}

export default function Staff() {
  const { staff, loading, error, reload } = useCampusData();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"all" | StaffRole>("all");

  const roles: ("all" | StaffRole)[] = [
    "all", "principal", "teacher", "admin", "counselor", "librarian", "support",
  ];

  const filtered = useMemo(() => {
    return staff.filter((member) => {
      const matchesQuery =
        !query ||
        member.name.toLowerCase().includes(query.toLowerCase()) ||
        member.department.toLowerCase().includes(query.toLowerCase()) ||
        (member.subject ?? "").toLowerCase().includes(query.toLowerCase());
      const matchesRole = role === "all" || member.role === role;
      return matchesQuery && matchesRole;
    });
  }, [query, role]);

  if (loading) return <PageLoader />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const administrativeRoles = ["admin", "counselor", "librarian", "principal"];

  const summary = [
    { label: "Total staff", value: staff.length.toLocaleString("en-US"), icon: Users, iconClass: "bg-lime-500/10 text-lime-600 dark:text-lime-400" },
    { label: "Teachers", value: staff.filter((m) => m.role === "teacher").length.toLocaleString("en-US"), icon: Briefcase, iconClass: "bg-cyan-500/10 text-cyan-500" },
    { label: "Administrative", value: staff.filter((m) => administrativeRoles.includes(m.role)).length.toLocaleString("en-US"), icon: UserRound, iconClass: "bg-lime-500/10 text-lime-600 dark:text-lime-400" },
    { label: "On leave", value: staff.filter((m) => m.status === "on-leave").length.toLocaleString("en-US"), icon: UserPlus, iconClass: "bg-amber-500/10 text-amber-500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="mx-auto flex w-full max-w-[1400px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8"
    >
      <PageHeader
        title="Staff"
        description="Teachers, administrative workers and support staff."
        actions={
          <Button className="gap-1.5 text-sm">
            <UserPlus className="size-4" /> Add staff
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
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, subject or department…"
            className="h-10 rounded-xl bg-background pl-9 shadow-none"
          />
        </div>
        <Select value={role} onValueChange={(value) => setRole(value as "all" | StaffRole)}>
          <SelectTrigger className="h-10 w-44 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {roles.map((r) => (
              <SelectItem key={r} value={r}>
                {r === "all" ? "All roles" : r[0].toUpperCase() + r.slice(1)}
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
              <TableHead className="h-10 text-xs font-medium">Name</TableHead>
              <TableHead className="h-10 text-xs font-medium">Role</TableHead>
              <TableHead className="h-10 text-xs font-medium">Department</TableHead>
              <TableHead className="h-10 w-[18%] text-xs font-medium">Attendance</TableHead>
              <TableHead className="h-10 text-xs font-medium">Joined</TableHead>
              <TableHead className="h-10 text-xs font-medium">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((member) => (
              <TableRow key={member.id} className="group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9 rounded-lg">
                      <AvatarFallback className={cn("bg-gradient-to-br text-xs font-semibold text-white", member.avatar)}>
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-foreground">{member.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-1">
                    <StaffRoleBadge role={member.role} />
                    {member.subject && (
                      <span className="text-[11px] text-muted-foreground">{member.subject}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-[13px] text-muted-foreground">{member.department}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="h-1.5 w-full max-w-28 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full", attendanceTone(member.attendance))}
                        style={{ width: `${member.attendance}%` }}
                      />
                    </div>
                    <span className="w-10 shrink-0 text-right text-xs font-semibold tabular-nums">
                      {percent(member.attendance, 0)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                  {fullDate(member.joined)}
                </TableCell>
                <TableCell>
                  <StaffStatusBadge status={member.status} />
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                  No staff match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </motion.div>
  );
}
