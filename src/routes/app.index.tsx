import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Mail,
  FileText,
  Calendar,
  Bot,
  TrendingUp,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { loadHistory, loadProfile, type HistoryEntry } from "@/lib/storage";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Dashboard — UVU AI" }] }),
  component: Dashboard,
});

function Dashboard() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [profile] = useState(() => loadProfile());

  useEffect(() => {
    setHistory(loadHistory());
    const onChange = () => setHistory(loadHistory());
    window.addEventListener("uvu:history-changed", onChange);
    return () => window.removeEventListener("uvu:history-changed", onChange);
  }, []);

  const stats = useMemo(() => {
    const count = (k: string) => history.filter((h) => h.kind === k).length;
    return {
      emails: count("email"),
      summaries: count("summary"),
      plans: count("plan"),
      chats: count("chat"),
      total: history.length,
    };
  }, [history]);

  const minutesSaved = stats.total * 12;

  const quickActions = [
    { to: "/app/email", label: "Write an email", icon: Mail, accent: "from-primary/20 to-primary/0" },
    { to: "/app/meetings", label: "Summarise notes", icon: FileText, accent: "from-secondary/20 to-secondary/0" },
    { to: "/app/planner", label: "Plan my day", icon: Calendar, accent: "from-accent/20 to-accent/0" },
    { to: "/app/chat", label: "Ask the assistant", icon: Bot, accent: "from-primary/20 to-secondary/10" },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Hello */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Welcome back, {profile.fullName?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here's what your AI co-worker has been up to.
          </p>
        </div>
        <Button asChild className="bg-gradient-brand text-primary-foreground shadow-glow">
          <Link to="/app/chat">
            <Sparkles className="mr-1 h-4 w-4" /> Open AI Assistant
          </Link>
        </Button>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-glow`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${a.accent} pointer-events-none`} />
            <div className="relative flex items-center justify-between">
              <div>
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow">
                  <a.icon className="h-5 w-5" />
                </div>
                <div className="mt-4 font-semibold text-foreground">{a.label}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Mail} label="Emails generated" value={stats.emails} tint="primary" />
        <StatCard icon={FileText} label="Summaries created" value={stats.summaries} tint="secondary" />
        <StatCard icon={Calendar} label="Plans built" value={stats.plans} tint="accent" />
        <StatCard icon={Bot} label="AI chats" value={stats.chats} tint="primary" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Productivity */}
        <Card className="lg:col-span-2 border-border/60 p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-foreground">Productivity overview</h2>
              <p className="text-sm text-muted-foreground">Your AI-powered work this week</p>
            </div>
            <TrendingUp className="h-5 w-5 text-accent" />
          </div>
          <div className="mt-6 space-y-5">
            <ProgressRow label="Emails drafted" value={stats.emails} max={20} />
            <ProgressRow label="Notes summarised" value={stats.summaries} max={10} />
            <ProgressRow label="Plans created" value={stats.plans} max={10} />
            <ProgressRow label="Chat interactions" value={stats.chats} max={30} />
          </div>
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/10 p-4 text-sm">
            <Clock className="h-5 w-5 text-accent" />
            <div>
              <div className="font-medium text-foreground">~{minutesSaved} minutes saved</div>
              <div className="text-muted-foreground">Estimated time you got back this week.</div>
            </div>
          </div>
        </Card>

        {/* Recent activity */}
        <Card className="border-border/60 p-6 shadow-soft">
          <h2 className="font-semibold text-foreground">Recent activity</h2>
          <div className="mt-4 space-y-3">
            {history.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Nothing yet. Try generating an email to get started.
              </div>
            )}
            {history.slice(0, 6).map((h) => (
              <Link
                key={h.id}
                to="/app/history"
                className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
              >
                <KindIcon kind={h.kind} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">{h.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(h.createdAt, { addSuffix: true })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Upcoming deadlines (sample) */}
      <Card className="border-border/60 p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Upcoming deadlines</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/app/planner">Open planner</Link>
          </Button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { t: "Quarterly report", d: "Friday", c: "destructive" },
            { t: "Client proposal review", d: "Monday", c: "secondary" },
            { t: "Team retrospective", d: "Next Wed", c: "accent" },
          ].map((d) => (
            <div key={d.t} className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5" /> {d.d}
              </div>
              <div className="mt-2 font-medium text-foreground">{d.t}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tint: "primary" | "secondary" | "accent";
}) {
  const ring =
    tint === "primary" ? "bg-primary/10 text-primary" : tint === "secondary" ? "bg-secondary/20 text-secondary-foreground" : "bg-accent/15 text-accent";
  return (
    <Card className="border-border/60 p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div className={`grid h-10 w-10 place-items-center rounded-lg ${ring}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 text-3xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </Card>
  );
}

function ProgressRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-foreground">{label}</span>
        <span className="text-muted-foreground">
          {value} / {max}
        </span>
      </div>
      <Progress value={pct} />
    </div>
  );
}

function KindIcon({ kind }: { kind: HistoryEntry["kind"] }) {
  const map = {
    email: Mail,
    summary: FileText,
    plan: Calendar,
    chat: Bot,
  } as const;
  const Icon = map[kind];
  return (
    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
      <Icon className="h-4 w-4" />
    </div>
  );
}
