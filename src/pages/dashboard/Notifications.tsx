import { motion } from "framer-motion";
import { AlertTriangle, CheckCheck, CreditCard, ShoppingCart, Sparkles, UserPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageError, PageLoader } from "@/components/data-state";
import { useCampusData } from "@/context/campus-data";
import type { NotificationType } from "@/lib/types";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

const typeConfig: Record<NotificationType, { icon: LucideIcon; class: string }> = {
  order: { icon: ShoppingCart, class: "bg-lime-500/10 text-lime-600 dark:text-lime-400" },
  billing: { icon: CreditCard, class: "bg-emerald-500/10 text-emerald-500" },
  alert: { icon: AlertTriangle, class: "bg-amber-500/10 text-amber-500" },
  user: { icon: UserPlus, class: "bg-cyan-500/10 text-cyan-500" },
  system: { icon: Sparkles, class: "bg-lime-500/10 text-lime-600 dark:text-lime-400" },
};

export default function Notifications() {
  const {
    notifications: items,
    toggleNotificationRead,
    markAllNotificationsRead,
    loading,
    error,
    reload,
  } = useCampusData();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  if (loading) return <PageLoader />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const unreadCount = items.filter((n) => !n.read).length;
  const visible = filter === "all" ? items : items.filter((n) => !n.read);

  const markAllRead = async () => {
    try {
      await markAllNotificationsRead();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update notifications");
    }
  };

  const toggleRead = async (id: string) => {
    try {
      await toggleNotificationRead(id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update notification");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="mx-auto flex w-full max-w-[1400px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8"
    >
      <PageHeader
        title="Notifications"
        description={`${unreadCount} unread notification${unreadCount === 1 ? "" : "s"} awaiting your attention.`}
        actions={
          <Button variant="outline" className="gap-1.5 text-sm" onClick={markAllRead} disabled={unreadCount === 0}>
            <CheckCheck className="size-4" /> Mark all read
          </Button>
        }
      />

      <Tabs value={filter} onValueChange={(value) => setFilter(value as "all" | "unread")}>
        <TabsList className="h-9 bg-muted/70">
          <TabsTrigger value="all" className="px-4 text-xs">
            All <span className="ml-1.5 rounded-full bg-muted-foreground/15 px-1.5 text-[10px] font-semibold tabular-nums">{items.length}</span>
          </TabsTrigger>
          <TabsTrigger value="unread" className="px-4 text-xs">
            Unread <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 text-[10px] font-semibold text-primary tabular-nums">{unreadCount}</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-2.5">
        {visible.map((notification, index) => {
          const config = typeConfig[notification.type];
          const Icon = config.icon;
          return (
            <motion.button
              key={notification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.04, ease: "easeOut" }}
              onClick={() => toggleRead(notification.id)}
              className={cn(
                "flex items-start gap-3.5 rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5",
                notification.read
                  ? "border-border/60 bg-card hover:shadow-[0_12px_32px_-16px_rgb(0_0_0/0.15)]"
                  : "border-primary/20 bg-primary/[0.04] shadow-[0_1px_2px_rgb(0_0_0/0.03)]",
              )}
            >
              <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", config.class)}>
                <Icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className={cn("text-sm", notification.read ? "font-medium text-muted-foreground" : "font-semibold text-foreground")}>
                    {notification.title}
                  </p>
                  <time className="shrink-0 text-[11px] text-muted-foreground">{timeAgo(notification.time)}</time>
                </div>
                <p className="mt-0.5 text-[13px] leading-5 text-muted-foreground">{notification.message}</p>
              </div>
              {!notification.read && (
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
              )}
            </motion.button>
          );
        })}

        {visible.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
            <Sparkles className="size-6 text-muted-foreground/50" />
            <p className="text-sm font-medium text-foreground">You're all caught up</p>
            <p className="text-xs text-muted-foreground">No {filter === "unread" ? "unread" : ""} notifications right now.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
