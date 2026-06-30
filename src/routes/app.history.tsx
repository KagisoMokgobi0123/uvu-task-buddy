import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { History as HistoryIcon, Search, Trash2, Mail, FileText, Calendar, Bot, Copy, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteHistoryEntry, loadHistory, type HistoryEntry } from "@/lib/storage";
import { PageHeader } from "./app.email";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/history")({
  head: () => ({ meta: [{ title: "History — UVU AI" }] }),
  component: HistoryPage,
});

const kindMeta = {
  email: { label: "Email", icon: Mail, tint: "bg-primary/10 text-primary" },
  summary: { label: "Summary", icon: FileText, tint: "bg-secondary/20 text-secondary-foreground" },
  plan: { label: "Plan", icon: Calendar, tint: "bg-accent/15 text-accent" },
  chat: { label: "Chat", icon: Bot, tint: "bg-primary/10 text-primary" },
} as const;

function HistoryPage() {
  const [items, setItems] = useState<HistoryEntry[]>([]);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<string>("all");
  const [sort, setSort] = useState<"new" | "old">("new");
  const [open, setOpen] = useState<HistoryEntry | null>(null);

  useEffect(() => {
    setItems(loadHistory());
    const onChange = () => setItems(loadHistory());
    window.addEventListener("uvu:history-changed", onChange);
    return () => window.removeEventListener("uvu:history-changed", onChange);
  }, []);

  const filtered = useMemo(() => {
    let r = items;
    if (kind !== "all") r = r.filter((i) => i.kind === kind);
    if (q.trim()) {
      const t = q.toLowerCase();
      r = r.filter(
        (i) => i.title.toLowerCase().includes(t) || i.content.toLowerCase().includes(t),
      );
    }
    r = [...r].sort((a, b) => (sort === "new" ? b.createdAt - a.createdAt : a.createdAt - b.createdAt));
    return r;
  }, [items, q, kind, sort]);

  function del(id: string) {
    deleteHistoryEntry(id);
    toast.success("Deleted");
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  }

  function download(item: HistoryEntry, kindExt: "txt" | "doc") {
    const blob = new Blob([item.content], {
      type: kindExt === "doc" ? "application/msword" : "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${item.kind}-${item.id}.${kindExt === "doc" ? "doc" : "txt"}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={HistoryIcon}
        title="History"
        subtitle="Search, sort, filter and reopen everything you've created."
      />

      <Card className="border-border/60 p-4 shadow-soft">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search history…"
              className="pl-9"
            />
          </div>
          <Select value={kind} onValueChange={setKind}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="email">Emails</SelectItem>
              <SelectItem value="summary">Summaries</SelectItem>
              <SelectItem value="plan">Plans</SelectItem>
              <SelectItem value="chat">Chats</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as "new" | "old")}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Newest first</SelectItem>
              <SelectItem value="old">Oldest first</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="border-dashed border-border p-16 text-center text-sm text-muted-foreground shadow-none">
          Nothing here yet. Generate an email, summary or plan to see it stored.
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((item) => {
            const meta = kindMeta[item.kind];
            return (
              <Card key={item.id} className="border-border/60 p-4 shadow-soft transition-colors hover:bg-card/80">
                <div className="flex items-start gap-3">
                  <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-lg", meta.tint)}>
                    <meta.icon className="h-4 w-4" />
                  </div>
                  <button onClick={() => setOpen(item)} className="min-w-0 flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        {meta.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                    <div className="mt-1 truncate font-medium text-foreground">{item.title}</div>
                    <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {item.content.slice(0, 240)}
                    </div>
                  </button>
                  <div className="flex flex-col gap-1 sm:flex-row">
                    <Button size="icon" variant="ghost" onClick={() => copy(item.content)} aria-label="Copy">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => download(item, "txt")} aria-label="Download">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => del(item.id)}
                      aria-label="Delete"
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{open?.title}</DialogTitle>
          </DialogHeader>
          {open && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{open.content}</ReactMarkdown>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
