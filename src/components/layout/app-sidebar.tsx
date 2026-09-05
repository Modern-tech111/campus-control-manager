import {
  BarChart3,
  Bell,
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  FileBarChart,
  GraduationCap,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Mail,
  Settings,
  Sparkles,
  UserRound,
  Users,
  School,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand";
import { useAuth } from "@/hooks/use-auth";
import { useCampusData } from "@/context/campus-data";
import { cn } from "@/lib/utils";
import { t } from "@/lib/translations";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

interface NavItem {
  title: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
  badge?: string;
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: t("nav.overview"),
    items: [
      { title: t("nav.dashboard"), to: "/dashboard", icon: LayoutDashboard, end: true },
      { title: t("nav.analytics"), to: "/dashboard/analytics", icon: BarChart3 },
      { title: t("nav.reports"), to: "/dashboard/reports", icon: FileBarChart },
    ],
  },
  {
    label: t("nav.academics"),
    items: [
      { title: t("nav.students"), to: "/dashboard/students", icon: Users },
      { title: t("nav.staff"), to: "/dashboard/staff", icon: UserRound },
      { title: t("nav.classes"), to: "/dashboard/classes", icon: School },            { title: t("nav.attendance"), to: "/dashboard/attendance", icon: ClipboardCheck },
    ],
  },
  {
    label: t("nav.engagement"),
    items: [            { title: t("nav.notifications"), to: "/dashboard/notifications", icon: Bell },
            { title: t("nav.messages"), to: "/dashboard/messages", icon: Mail },
      { title: t("nav.calendar"), to: "/dashboard/calendar", icon: CalendarDays },
      { title: t("nav.tasks"), to: "/dashboard/tasks", icon: ListTodo },
    ],
  },
  {
    label: t("nav.account"),
    items: [
      { title: t("nav.profile"), to: "/dashboard/profile", icon: GraduationCap },
      { title: t("nav.settings"), to: "/dashboard/settings", icon: Settings },
    ],
  },
];

function SidebarNav() {
  const { attendance, notifications, conversations } = useCampusData();

  const absent = attendance.filter((r) => r.status === "absent").length;
  const unreadNotifications = notifications.filter((n) => !n.read).length;
  const unreadMessages = conversations.reduce((sum, c) => sum + c.unread, 0);

  // Live counts replace the previous hardcoded badges.
  const dynamicBadges: Record<string, string | undefined> = {
    "/dashboard/attendance": absent > 0 ? String(absent) : undefined,
    "/dashboard/notifications":
      unreadNotifications > 0 ? String(unreadNotifications) : undefined,
    "/dashboard/messages": unreadMessages > 0 ? String(unreadMessages) : undefined,
  };

  const groups = navGroups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      badge: dynamicBadges[item.to] ?? item.badge,
    })),
  }));

  return (
    <>
      {groups.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        cn(
                          "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                          "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          isActive &&
                            "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_0_0_0_1px_var(--sidebar-border)]",
                        )
                      }
                    >
                      <item.icon className="size-4 shrink-0" />
                      <span className="flex-1 truncate">{item.title}</span>
                      {item.badge && (
                        <SidebarMenuBadge className="bg-primary/10 text-primary">
                          {item.badge}
                        </SidebarMenuBadge>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
  };

  const displayName = String(user?.name || t("nav.administrator"));
  const initials = displayName
    .split(" ")
    .map((part: string) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Sidebar side="right" collapsible="icon" className="border-l border-sidebar-border/60">
      <SidebarHeader className="px-3 pt-4 pb-2">
        <NavLink to="/" className="flex items-center gap-2.5 px-1.5">
          <BrandMark className="size-8" />
          <span dir="ltr" className="font-[family-name:var(--font-display)] text-[1.05rem] font-bold tracking-tight text-foreground group-data-[collapsible=icon]:hidden">
            Campus Control
          </span>
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarNav />
      </SidebarContent>

      <SidebarFooter>
        {/* Upgrade card */}
        <div className="mx-2 mb-1 hidden rounded-xl border border-primary/15 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-3.5 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground">
            <Sparkles className="size-3.5 text-primary" />
            {t("brand.pro")}
          </div>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {t("brand.pro.description")}
          </p>
          <Button
            size="sm"
            className="mt-2.5 h-7 w-full gap-1.5 text-xs"
            onClick={() => navigate("/dashboard/settings")}
          >
            <CreditCard className="size-3.5" /> {t("nav.upgrade")}
          </Button>
        </div>

        {/* User */}
        <div className="flex items-center gap-2.5 rounded-lg p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <Avatar className="size-8 rounded-lg">
            <AvatarFallback className="bg-[#76E10C] text-[11px] font-bold text-black">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div dir="ltr" className="min-w-0 flex-1 text-start group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email || t("nav.schoolAdministrator")}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg text-muted-foreground hover:text-foreground group-data-[collapsible=icon]:hidden"
            onClick={handleSignOut}
            aria-label={t("nav.signout")}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
