import { motion } from "framer-motion";
import { CalendarDays, Clock3, Plus, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/page-header";
import { PageError, PageLoader } from "@/components/data-state";
import { useCampusData } from "@/context/campus-data";
import type { EventType } from "@/lib/types";
import { time } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const typeTone: Record<EventType, string> = {
  meeting: "border-lime-500/25 bg-lime-500/10 text-lime-600 dark:text-lime-400",
  task: "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  reminder: "border-cyan-500/25 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  personal: "border-violet-500/25 bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

const dotTone: Record<EventType, string> = {
  meeting: "bg-lime-500",
  task: "bg-amber-500",
  reminder: "bg-cyan-500",
  personal: "bg-violet-500",
};

function isSameDay(a: Date, iso: string) {
  const b = new Date(iso);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function CalendarPage() {
  const { events, addEvent, loading, error, reload } = useCampusData();
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("09:00");
  const [dialogOpen, setDialogOpen] = useState(false);

  const dayEvents = useMemo(() => {
    if (!selected) return [];
    return events.filter((event) => isSameDay(selected, event.date));
  }, [events, selected]);

  const handleAddEvent = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !selected) return;

    try {
      await addEvent({
        title: title.trim(),
        date: dateKey(selected),
        start,
        type: "task",
      });
      setTitle("");
      setDialogOpen(false);
      toast.success(`Event added for ${selected.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add event");
    }
  };

  const upcoming = useMemo(() => {
    return [...events]
      .filter((event) => new Date(event.date) >= new Date())
      .sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start))
      .slice(0, 5);
  }, [events]);

  if (loading) return <PageLoader />;
  if (error) return <PageError message={error} onRetry={reload} />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="mx-auto flex w-full max-w-[1400px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8"
    >
      <PageHeader
        title="Calendar"
        description="Meetings, deadlines and reminders — all in one place."
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1.5 text-sm">
                <Plus className="size-4" /> New event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add event</DialogTitle>
                <DialogDescription>
                  Create an event for{" "}
                  {selected?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddEvent} className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="event-title">Title</Label>
                  <Input
                    id="event-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="e.g. Product sync"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="event-time">Start time</Label>
                  <Input
                    id="event-time"
                    type="time"
                    value={start}
                    onChange={(event) => setStart(event.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={!title.trim()}>
                    Add event
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Month calendar */}
        <Card className="rounded-2xl border-border/60 p-3 shadow-[0_1px_2px_rgb(0_0_0/0.03),0_16px_40px_-24px_rgb(0_0_0/0.14)] lg:col-span-2">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={setSelected}
            className="w-full [&_.rdp-day_button]:rounded-lg"
          />
          <div className="mt-1 flex flex-wrap items-center gap-3 border-t px-2 pt-3 pb-1 text-[11px] text-muted-foreground">
            {(["meeting", "task", "reminder", "personal"] as EventType[]).map((type) => (
              <span key={type} className="flex items-center gap-1.5 capitalize">
                <span className={cn("size-2 rounded-full", dotTone[type])} /> {type}s
              </span>
            ))}
          </div>
        </Card>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Day events */}
          <Card className="flex-1 rounded-2xl border-border/60 p-4 shadow-[0_1px_2px_rgb(0_0_0/0.03)]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-tight">
                {selected
                  ? selected.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
                  : "No day selected"}
              </h3>
              <CalendarDays className="size-4 text-muted-foreground" />
            </div>
            <div className="mt-4 flex flex-col gap-2.5">
              {dayEvents.length === 0 && (
                <p className="rounded-xl border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
                  No events this day. Add one above.
                </p>
              )}
              {dayEvents.map((event) => (
                <div key={event.id} className="rounded-xl border border-border/60 p-3 transition-colors hover:bg-accent/40">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-semibold text-foreground">{event.title}</p>
                    <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-medium capitalize", typeTone[event.type])}>
                      {event.type}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock3 className="size-3" /> {event.start}
                      {event.end && ` – ${event.end}`}
                    </span>
                    {event.attendees && (
                      <span className="flex items-center gap-1">
                        <UsersRound className="size-3" /> {event.attendees}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Upcoming */}
          <Card className="rounded-2xl border-border/60 p-4 shadow-[0_1px_2px_rgb(0_0_0/0.03)]">
            <h3 className="text-sm font-semibold tracking-tight">Upcoming</h3>
            <div className="mt-3 flex flex-col">
              {upcoming.map((event, index) => (
                <div key={event.id} className={cn("flex items-center gap-3 py-2", index > 0 && "border-t border-border/50")}>
                  <span className="flex w-10 shrink-0 flex-col items-center rounded-lg border border-border/60 py-1">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase">
                      {new Date(event.date).toLocaleDateString("en-US", { month: "short" })}
                    </span>
                    <span className="text-sm leading-none font-bold tabular-nums">
                      {new Date(event.date).getDate()}
                    </span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-foreground">{event.title}</p>
                    <p className="text-[11px] text-muted-foreground">{event.start}</p>
                  </div>
                  <span className={cn("size-2 rounded-full", dotTone[event.type])} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
