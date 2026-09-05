import { Bell, ChevronsUpDown, LogOut, Mail, Search, Settings, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { useCampusData } from "@/context/campus-data";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/format";
import { t } from "@/lib/translations";

export function Topbar() {
  const { user, signOut } = useAuth();
  const { notifications } = useCampusData();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  const unread = notifications.filter((n) => !n.read).length;
  const recent = notifications.slice(0, 4);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  const displayName = String(user?.name || t("topbar.guest"));
  const initials = displayName
    .split(" ")
    .map((part: string) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="glass-panel sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b px-3 sm:px-4">
      <SidebarTrigger className="-ms-1 text-muted-foreground" />

      {/* Search */}
      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute top-1/2 start-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={searchRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("topbar.search")}
          className="h-9 rounded-lg bg-background/60 ps-9 pe-14 text-sm shadow-none focus-visible:ring-2"
        />
        <kbd className="pointer-events-none absolute top-1/2 end-2.5 -translate-y-1/2 rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </div>

      <div className="flex-1 md:hidden" />

      <div className="flex items-center gap-1.5">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative size-9 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label={t("topbar.notifications")}
            >
              <Bell className="size-4.5" />
              {unread > 0 && (
                <span className="absolute top-1.5 end-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground ring-2 ring-background">
                  {unread}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between border-b px-3 py-2.5">
              <p className="text-sm font-semibold">{t("topbar.notifications")}</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 gap-1 px-1.5 text-xs text-primary hover:text-primary"
                onClick={() => navigate("/dashboard/notifications")}
              >
                {t("topbar.viewAll")} <span aria-hidden>←</span>
              </Button>
            </div>
            <div className="max-h-80 overflow-auto">
              {recent.map((n) => (
                <button
                  key={n.id}
                  className="flex w-full items-start gap-3 px-3 py-2.5 text-start transition-colors hover:bg-accent/60"
                  onClick={() => navigate("/dashboard/notifications")}
                >
                  <span
                    className={cn(
                      "mt-1.5 size-2 shrink-0 rounded-full",
                      n.read ? "bg-muted-foreground/30" : "bg-primary",
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-foreground">
                      {n.title}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {n.message}
                    </span>
                    <span dir="ltr" className="mt-0.5 block text-[11px] text-muted-foreground/70">
                      {timeAgo(n.time)}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Messages shortcut */}
        <Button
          variant="ghost"
          size="icon"
          className="relative hidden size-9 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground sm:inline-flex"
          onClick={() => navigate("/dashboard/messages")}
          aria-label={t("topbar.messages")}
        >
          <Mail className="size-4.5" />
          <span className="absolute top-1.5 end-1.5 size-2 rounded-full bg-emerald-500 ring-2 ring-background" />
        </Button>

        <ThemeToggle />

        <span className="mx-1 hidden h-5 w-px bg-border sm:block" />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-1.5 ps-1.5 sm:pe-2.5">
              <Avatar className="size-7 rounded-lg">
                <AvatarFallback className="bg-[#76E10C] text-[10px] font-bold text-black">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-28 truncate text-sm font-medium sm:block">
                {displayName}
              </span>
              <ChevronsUpDown className="hidden size-3.5 text-muted-foreground sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p dir="ltr" className="text-sm font-semibold text-foreground">{displayName}</p>
              <p dir="ltr" className="text-xs font-normal text-muted-foreground">
                {user?.email || t("topbar.signedInVia")}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>
              <UserRound className="me-2 size-4" /> {t("topbar.profile")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
              <Settings className="me-2 size-4" /> {t("topbar.settings")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="me-2 size-4" /> {t("topbar.signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
