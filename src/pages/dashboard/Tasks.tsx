import { motion } from "framer-motion";
import { CalendarClock, CheckCircle2, Circle, Plus, Timer, ListTodo } from "lucide-react";
import { useMemo, useState } from "react";
import { PriorityBadge } from "@/components/dashboard/badges";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageError, PageLoader } from "@/components/data-state";
import { useCampusData } from "@/context/campus-data";
import type { TaskStatus } from "@/lib/types";
import { fullDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Tasks() {
  const {
    tasks: items,
    addTask: createTask,
    toggleTaskStatus,
    loading,
    error,
    reload,
  } = useCampusData();
  const [filter, setFilter] = useState<"all" | TaskStatus>("all");
  const [newTitle, setNewTitle] = useState("");

  const counts = useMemo(() => {
    return {
      all: items.length,
      todo: items.filter((t) => t.status === "todo").length,
      "in-progress": items.filter((t) => t.status === "in-progress").length,
      done: items.filter((t) => t.status === "done").length,
    };
  }, [items]);

  const visible = filter === "all" ? items : items.filter((t) => t.status === filter);

  if (loading) return <PageLoader />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const addTask = async (event: React.FormEvent) => {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    try {
      await createTask(title);
      setNewTitle("");
      toast.success("Task added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add task");
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      await toggleTaskStatus(id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update task");
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
        title="Tasks"
        description="Stay on top of what matters with your personal and team task board."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total tasks", value: counts.all, icon: ListTodo, iconClass: "bg-lime-500/10 text-lime-600 dark:text-lime-400" },
          { label: "To do", value: counts.todo, icon: Circle, iconClass: "bg-amber-500/10 text-amber-500" },
          { label: "In progress", value: counts["in-progress"], icon: Timer, iconClass: "bg-cyan-500/10 text-cyan-500" },
          { label: "Completed", value: counts.done, icon: CheckCircle2, iconClass: "bg-emerald-500/10 text-emerald-500" },
        ].map((stat) => (
          <Card key={stat.label} className="flex items-center gap-3 rounded-2xl border-border/60 p-4">
            <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", stat.iconClass)}>
              <stat.icon className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
              <p className="mt-0.5 text-lg font-bold tracking-tight tabular-nums">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border-border/60 p-4 shadow-[0_1px_2px_rgb(0_0_0/0.03)]">
        <form onSubmit={addTask} className="flex items-center gap-2">
          <Input
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            placeholder="Add a new task and press Enter…"
            className="h-10 rounded-xl bg-muted/40 shadow-none"
          />
          <Button type="submit" size="icon" className="size-10 shrink-0 rounded-xl" disabled={!newTitle.trim()}>
            <Plus className="size-4" />
          </Button>
        </form>
      </Card>

      <Tabs value={filter} onValueChange={(value) => setFilter(value as "all" | TaskStatus)}>
        <TabsList className="h-9 bg-muted/70">
          <TabsTrigger value="all" className="px-4 text-xs">All</TabsTrigger>
          <TabsTrigger value="todo" className="px-4 text-xs">To do</TabsTrigger>
          <TabsTrigger value="in-progress" className="px-4 text-xs">In progress</TabsTrigger>
          <TabsTrigger value="done" className="px-4 text-xs">Done</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-2.5">
        {visible.map((task, index) => {
          const done = task.status === "done";
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.03, ease: "easeOut" }}
            >
              <Card
                className={cn(
                  "flex items-center gap-3 rounded-2xl border-border/60 p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-16px_rgb(0_0_0/0.15)]",
                  done && "opacity-70",
                )}
              >
                <button
                  onClick={() => toggleStatus(task.id)}
                  aria-label={done ? "Mark as not done" : "Mark as done"}
                  className="shrink-0 transition-transform hover:scale-110"
                >
                  {done ? (
                    <CheckCircle2 className="size-5.5 text-emerald-500" />
                  ) : (
                    <Circle className="size-5.5 text-muted-foreground/50 hover:text-foreground" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <p className={cn("text-[13px] font-medium", done ? "text-muted-foreground line-through" : "text-foreground")}>
                    {task.title}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <CalendarClock className="size-3" /> {fullDate(task.due)}
                  </p>
                </div>

                <div className="hidden sm:block">
                  <PriorityBadge priority={task.priority} />
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden text-[11px] text-muted-foreground md:block">
                    {task.assignee}
                  </span>
                  <Avatar className="size-7 rounded-lg">
                    <AvatarFallback className={cn("bg-gradient-to-br text-[10px] font-semibold text-white", task.avatar)}>
                      {task.initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </Card>
            </motion.div>
          );
        })}

        {visible.length === 0 && (
          <Card className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-14 text-center">
            <ListTodo className="size-6 text-muted-foreground/50" />
            <p className="text-sm font-medium text-foreground">No tasks here</p>
            <p className="text-xs text-muted-foreground">Add a task above or switch filters.</p>
          </Card>
        )}
      </div>
    </motion.div>
  );
}
