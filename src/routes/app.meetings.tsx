import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { FileText, Wand2, Copy, RefreshCw, Download, Save, Loader2, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { saveHistoryEntry } from "@/lib/storage";
import { toast } from "sonner";
import { PageHeader } from "./app.email";

export const Route = createFileRoute("/app/meetings")({
  head: () => ({ meta: [{ title: "Meeting Notes Summariser — UVU AI" }] }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const [notes, setNotes] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/\.(txt|md)$/i.test(f.name)) {
      toast.message("Tip: TXT works best. For PDF/DOCX, paste the contents below.");
    }
    const text = await f.text();
    setNotes(text);
  }

  async function generate() {
    if (!notes.trim()) {
      toast.error("Paste or upload meeting notes first");
      return;
    }
    setLoading(true);
    setSummary("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode: "summary", input: { notes } }),
      });
      const text = await res.text();
      if (!res.ok) {
        toast.error(text || "Failed to summarise");
        return;
      }
      const data = JSON.parse(text) as { text: string };
      setSummary(data.text);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    navigator.clipboard.writeText(summary);
    toast.success("Copied");
  }
  function download(kind: "txt" | "doc") {
    const blob = new Blob([summary], { type: kind === "doc" ? "application/msword" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meeting-summary.${kind === "doc" ? "doc" : "txt"}`;
    a.click();
    URL.revokeObjectURL(url);
  }
  function save() {
    if (!summary) return;
    saveHistoryEntry({
      kind: "summary",
      title: notes.split("\n")[0]?.slice(0, 60) || "Meeting summary",
      content: summary,
    });
    toast.success("Saved to history");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FileText}
        title="Meeting Notes Summariser"
        subtitle="Turn raw notes into executive summary, decisions, action items and owners."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4 border-border/60 p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Your meeting notes</h2>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted">
              <Upload className="h-3.5 w-3.5" />
              Upload file
              <input type="file" accept=".txt,.md,.csv" className="hidden" onChange={onFile} />
            </label>
          </div>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={20}
            placeholder="Paste your meeting notes here. The more detail, the better the summary."
            className="text-sm leading-relaxed"
          />
          <Button
            onClick={generate}
            disabled={loading}
            className="w-full bg-gradient-brand text-primary-foreground shadow-glow"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Summarising…
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" /> Summarise meeting
              </>
            )}
          </Button>
        </Card>

        <Card className="border-border/60 p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Summary</h2>
            {summary && (
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
            {loading && !summary ? (
              <div className="space-y-3">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-3 animate-pulse rounded bg-muted" style={{ width: `${50 + (i * 7) % 50}%` }} />
                ))}
              </div>
            ) : summary ? (
              <div className="prose prose-sm dark:prose-invert max-w-none [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-primary">
                <ReactMarkdown>{summary}</ReactMarkdown>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                The structured summary will appear here.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
