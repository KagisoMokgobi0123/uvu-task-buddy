import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Calendar, Wand2, Copy, RefreshCw, Download, Save, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveHistoryEntry } from "@/lib/storage";
import { toast } from "sonner";
import { PageHeader } from "./app.email";

export const Route = createFileRoute("/app/planner")({
  head: () => ({ meta: [{ title: "AI Task Planner — UVU AI" }] }),
  component: PlannerPage,
});

function PlannerPage() {
  const [tasks, setTasks] = useState("");
  const [workingHours, setWorkingHours] = useState("09:00 - 17:00");
  const [meetingTimes, setMeetingTimes] = useState("");
  const [breakTimes, setBreakTimes] = useState("12:30 - 13:00");
  const [notes, setNotes] = useState("");
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!tasks.trim()) {
      toast.error("Add your tasks first");
      return;
    }
    setLoading(true);
    setPlan("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode: "plan",
          input: { tasks, workingHours, meetingTimes, breakTimes, notes },
        }),
      });
      const text = await res.text();
      if (!res.ok) {
        toast.error(text || "Failed to plan");
        return;
      }
      const data = JSON.parse(text) as { text: string };
      setPlan(data.text);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  function save() {
    if (!plan) return;
    saveHistoryEntry({
      kind: "plan",
      title: `Plan — ${new Date().toLocaleDateString()}`,
      content: plan,
    });
    toast.success("Saved");
  }
  function copy() {
    navigator.clipboard.writeText(plan);
    toast.success("Copied");
  }
  function download(kind: "txt" | "doc") {
    const blob = new Blob([plan], { type: kind === "doc" ? "application/msword" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plan.${kind === "doc" ? "doc" : "txt"}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Calendar}
        title="AI Task Planner & Scheduler"
        subtitle="From scattered tasks to a calm, time-blocked plan."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4 border-border/60 p-6 shadow-soft">
          <h2 className="font-semibold text-foreground">Your day</h2>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Tasks (one per line — add (priority) and (deadline) if you like)</Label>
            <Textarea
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              rows={10}
              placeholder={"Finish quarterly report (high, today)\nReview proposal from Acme\nCall HR about onboarding\nDraft team retro agenda"}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Working hours</Label>
              <Input value={workingHours} onChange={(e) => setWorkingHours(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Preferred break</Label>
              <Input value={breakTimes} onChange={(e) => setBreakTimes(e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs text-muted-foreground">Fixed meetings</Label>
              <Input value={meetingTimes} onChange={(e) => setMeetingTimes(e.target.value)} placeholder="e.g. 10:00-10:30 standup, 14:00-15:00 client call" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs text-muted-foreground">Extra notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="I work best in the morning. Avoid context switching after lunch." />
            </div>
          </div>
          <Button
            onClick={generate}
            disabled={loading}
            className="w-full bg-gradient-brand text-primary-foreground shadow-glow"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Planning…
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" /> Generate plan
              </>
            )}
          </Button>
        </Card>

        <Card className="border-border/60 p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Your plan</h2>
            {plan && (
              <div className="flex flex-wrap gap-1.5">
                <Button size="sm" variant="ghost" onClick={copy}>
                  <Copy className="mr-1 h-3.5 w-3.5" /> Copy
                </Button>
                <Button size="sm" variant="ghost" onClick={generate} disabled={loading}>
                  <RefreshCw className="mr-1 h-3.5 w-3.5" /> Regenerate
                </Button>
                <Button size="sm" variant="ghost" onClick={() => download("txt")}>
                  <Download className="mr-1 h-3.5 w-3.5" /> TXT
                </Button>
                <Button size="sm" variant="ghost" onClick={() => download("doc")}>
                  <Download className="mr-1 h-3.5 w-3.5" /> DOC
                </Button>
                <Button size="sm" onClick={save}>
                  <Save className="mr-1 h-3.5 w-3.5" /> Save
                </Button>
              </div>
            )}
          </div>
          <div className="mt-4 max-h-[640px] overflow-auto">
            {loading && !plan ? (
              <div className="space-y-3">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-3 animate-pulse rounded bg-muted" style={{ width: `${50 + (i * 7) % 50}%` }} />
                ))}
              </div>
            ) : plan ? (
              <div className="prose prose-sm dark:prose-invert max-w-none [&_table]:w-full [&_th]:text-left [&_th]:py-2 [&_td]:py-1.5 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-primary [&_h2]:mt-6">
                <ReactMarkdown>{plan}</ReactMarkdown>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                Your AI-generated daily and weekly plan will appear here.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
