import { motion } from "framer-motion";
import { Award, BookOpen, Mail, MapPin, Pencil, Shield, Star, Users } from "lucide-react";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useCampusData } from "@/context/campus-data";
import { percent } from "@/lib/format";

export default function Profile() {
  const { user } = useAuth();
  const { students, staff, attendance } = useCampusData();
  const displayName = String(user?.name || "Administrator");
  const email = user?.email || "—";
  const initials = displayName
    .split(" ")
    .map((part: string) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const attendanceRate = attendance.length
    ? (attendance.filter((r) => r.status === "present").length / attendance.length) *
      100
    : 0;

  const stats = [
    { label: "Students overseen", value: students.length.toLocaleString("en-US"), icon: Users, iconClass: "bg-primary/10 text-primary" },
    { label: "Staff managed", value: staff.length.toLocaleString("en-US"), icon: BookOpen, iconClass: "bg-lime-500/10 text-lime-600 dark:text-lime-400" },
    { label: "Attendance rate", value: percent(attendanceRate), icon: Star, iconClass: "bg-emerald-500/10 text-emerald-500" },
    { label: "Years at school", value: "—", icon: Shield, iconClass: "bg-cyan-500/10 text-cyan-500" },
  ];

  const skills = [
    "School administration", "Academic planning", "Staff management", "Attendance policy",
    "Budgeting", "Parent communication", "Curriculum oversight", "Student welfare",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="mx-auto flex w-full max-w-[1100px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8"
    >
      {/* Cover + identity */}
      <Card className="overflow-hidden rounded-2xl border-border/60 shadow-[0_1px_2px_rgb(0_0_0/0.03),0_16px_40px_-24px_rgb(0_0_0/0.14)]">
        <div className="relative h-36 bg-gradient-to-r from-[#101010] via-[#1c1c1c] to-[#242424] sm:h-44">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(158,240,26,0.18),transparent_50%)]" />
          <div className="absolute inset-0 bg-grid opacity-30" />
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4 gap-1.5 bg-background/70 text-xs backdrop-blur-md"
          >
            <Pencil className="size-3.5" /> Edit cover
          </Button>
        </div>

        <div className="relative px-6 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
              <Avatar className="size-24 rounded-3xl border-4 border-background shadow-xl sm:-mt-10">
                <AvatarFallback className="bg-[#76E10C] text-3xl font-bold text-black">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="pb-1">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-bold tracking-tight">{displayName}</h1>
                  <Badge className="gap-1 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary hover:bg-primary/10">
                    <Award className="size-3" /> Principal
                  </Badge>
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Mail className="size-3.5" /> {email}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="size-3.5" /> Campus Control</span>
                </p>
              </div>
            </div>
            <Button className="gap-1.5 text-sm">
              <Pencil className="size-4" /> Edit profile
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="flex items-center gap-3 rounded-2xl border-border/60 p-4 shadow-[0_1px_2px_rgb(0_0_0/0.03)]">
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${stat.iconClass}`}>
              <stat.icon className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-muted-foreground">{stat.label}</p>
              <p className="mt-0.5 text-lg font-bold tracking-tight tabular-nums">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* About */}
        <Card className="rounded-2xl border-border/60 shadow-[0_1px_2px_rgb(0_0_0/0.03),0_16px_40px_-24px_rgb(0_0_0/0.14)]">
          <CardHeader>
            <CardTitle className="text-base">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">
              Principal of Campus Control with seven years of leadership
              experience. Focused on student outcomes, staff development and
              building a school culture where everyone can thrive.
            </p>
            <div className="mt-5">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Skills</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="border-border/60 bg-muted/50 px-2 py-0.5 text-xs font-medium text-foreground">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="mt-5">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Languages</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <Badge variant="outline" className="border-border/60 bg-muted/50 px-2 py-0.5 text-xs font-medium">English — native</Badge>
                <Badge variant="outline" className="border-border/60 bg-muted/50 px-2 py-0.5 text-xs font-medium">Spanish — fluent</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="rounded-2xl border-border/60 shadow-[0_1px_2px_rgb(0_0_0/0.03),0_16px_40px_-24px_rgb(0_0_0/0.14)] lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityTimeline limit={6} />
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
