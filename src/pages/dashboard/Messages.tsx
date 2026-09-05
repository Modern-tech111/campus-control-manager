import { motion } from "framer-motion";
import { ArrowLeft, MoreVertical, Phone, Search, Send, Video } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageError, PageLoader } from "@/components/data-state";
import { useCampusData } from "@/context/campus-data";
import { time } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Messages() {
  const {
    conversations: conversationList,
    sendMessage,
    readConversation,
    loading,
    error,
    reload,
  } = useCampusData();
  const [activeId, setActiveId] = useState<string>("");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [threadOpen, setThreadOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = conversationList.find((c) => c.id === activeId) ?? conversationList[0];

  const filtered = useMemo(() => {
    return conversationList.filter((c) =>
      c.name.toLowerCase().includes(query.toLowerCase()),
    );
  }, [conversationList, query]);

  const unreadTotal = conversationList.reduce((sum, c) => sum + c.unread, 0);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [active?.messages.length, activeId]);

  if (loading) return <PageLoader />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !active) return;

    try {
      await sendMessage(active.id, text);
      setDraft("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send message");
    }
  };

  const openThread = (id: string) => {
    setActiveId(id);
    setThreadOpen(true);
    void readConversation(id).catch(() => {});
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unreadTotal} unread conversations with customers and teammates.
          </p>
        </div>
      </div>

      <Card className="grid min-h-[560px] grid-rows-[auto_1fr] overflow-hidden rounded-2xl border-border/60 shadow-[0_1px_2px_rgb(0_0_0/0.03),0_16px_40px_-24px_rgb(0_0_0/0.14)] lg:grid-cols-[320px_1fr] lg:grid-rows-1">
        {/* Conversation list */}
        <div className={cn("flex-col border-r border-border/60 lg:flex", threadOpen ? "hidden" : "flex")}>
          <div className="border-b p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search conversations…"
                className="h-9 rounded-lg bg-muted/50 pl-9 shadow-none"
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="flex flex-col p-2">
              {filtered.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => openThread(conversation.id)}
                  className={cn(
                    "flex items-start gap-3 rounded-xl px-2.5 py-3 text-left transition-colors",
                    conversation.id === activeId ? "bg-accent" : "hover:bg-accent/50",
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar className="size-10 rounded-xl">
                      <AvatarFallback className={cn("bg-gradient-to-br text-xs font-semibold text-white", conversation.avatar)}>
                        {conversation.initials}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.online && (
                      <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-background bg-emerald-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[13px] font-semibold text-foreground">{conversation.name}</p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {time(conversation.lastSeen)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{conversation.lastMessage}</p>
                  </div>
                  {conversation.unread > 0 && (
                    <span className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {conversation.unread}
                    </span>
                  )}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="px-3 py-8 text-center text-xs text-muted-foreground">
                  No conversations found.
                </p>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Thread */}
        <div className={cn("flex-col", threadOpen ? "flex" : "hidden lg:flex")}>
          {active && (
            <>
              <div className="flex items-center gap-3 border-b px-4 py-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 lg:hidden"
                  onClick={() => setThreadOpen(false)}
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="size-4" />
                </Button>
                <Avatar className="size-9 rounded-xl">
                  <AvatarFallback className={cn("bg-gradient-to-br text-xs font-semibold text-white", active.avatar)}>
                    {active.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{active.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {active.online ? (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <span className="size-1.5 rounded-full bg-emerald-500" /> Online now
                      </span>
                    ) : (
                      `Last seen ${time(active.lastSeen)}`
                    )}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" aria-label="Call">
                  <Phone className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" aria-label="Video call">
                  <Video className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" aria-label="More">
                  <MoreVertical className="size-4" />
                </Button>
              </div>

              <ScrollArea className="flex-1" ref={scrollRef}>
                <div className="flex flex-col gap-3 px-4 py-4">
                  {active.messages.map((message, index) => {
                    const mine = message.from === "me";
                    return (
                      <div key={index} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                        <div
                          className={cn(
                            "max-w-[75%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-5 shadow-sm",
                            mine
                              ? "rounded-br-md bg-primary text-primary-foreground"
                              : "rounded-bl-md border border-border/60 bg-muted/50",
                          )}
                        >
                          <p>{message.text}</p>
                          <p className={cn("mt-1 text-[10px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>
                            {time(message.time)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t p-3">
                <Input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={`Message ${active.name.split(" ")[0]}…`}
                  className="h-10 rounded-xl bg-muted/50 shadow-none"
                />
                <Button type="submit" size="icon" className="size-10 shrink-0 rounded-xl" disabled={!draft.trim()}>
                  <Send className="size-4" />
                </Button>
              </form>
            </>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
