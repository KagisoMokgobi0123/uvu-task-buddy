import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Wand2, Copy, RefreshCw, Download, Save, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveHistoryEntry } from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/app/email")({
  head: () => ({ meta: [{ title: "Smart Email Generator — UVU AI" }] }),
  component: EmailPage,
});

const audiences = ["Client", "Manager", "Team", "HR", "Supplier", "Stakeholder"];
const tones = ["Professional", "Formal", "Friendly", "Persuasive", "Empathetic", "Direct"];

function EmailPage() {
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [audience, setAudience] = useState("Client");
  const [tone, setTone] = useState("Professional");
  const [subject, setSubject] = useState("");
  const [purpose, setPurpose] = useState("");
  const [context, setContext] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!purpose.trim()) {
      toast.error("Tell the AI what the email is for");
      return;
    }
    setLoading(true);
    setOutput("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode: "email",
          input: { recipientName, recipientEmail, audience, tone, subject, purpose, context },
        }),
      });
      const text = await res.text();
      if (!res.ok) {
        if (res.status === 429) toast.error("Too many requests. Please slow down and retry.");
        else if (res.status === 402)
          toast.error("AI credits exhausted. Please add credits to your workspace.");
        else toast.error(text || "Failed to generate email");
        return;
      }
      const data = JSON.parse(text) as { text: string };
      setOutput(data.text);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  }

  function download(kind: "txt" | "doc") {
    const blob = new Blob([output], {
      type: kind === "doc" ? "application/msword" : "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uvu-email.${kind === "doc" ? "doc" : "txt"}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function save() {
    if (!output) return;
    saveHistoryEntry({
      kind: "email",
      title: subject || purpose.slice(0, 60) || "Untitled email",
      content: output,
      meta: { recipientName, audience, tone },
    });
    toast.success("Saved to history");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Mail}
        title="Smart Email Generator"
        subtitle="Draft polished workplace emails in seconds."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4 border-border/60 p-6 shadow-soft">
          <h2 className="font-semibold text-foreground">Email details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Recipient name">
              <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Jane Doe" />
            </Field>
            <Field label="Recipient email (optional)">
              <Input value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="jane@company.com" />
            </Field>
            <Field label="Audience">
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {audiences.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Tone">
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Subject hint">
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Project update — Q3 launch" />
          </Field>
          <Field label="Purpose of the email">
            <Textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              rows={3}
              placeholder="Let the client know we are on track and request a quick review meeting next week."
            />
          </Field>
          <Field label="Additional context (optional)">
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={3}
              placeholder="They mentioned budget concerns last call. Keep it concise and reassuring."
            />
          </Field>
          <Button
            onClick={generate}
            disabled={loading}
            className="w-full bg-gradient-brand text-primary-foreground shadow-glow"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" /> Generate email
              </>
            )}
          </Button>
        </Card>

        <Card className="border-border/60 p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Generated email</h2>
            {output && (
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
          <div className="mt-4">
            {loading && !output ? (
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-3 animate-pulse rounded bg-muted" style={{ width: `${60 + (i * 7) % 40}%` }} />
                ))}
              </div>
            ) : output ? (
              <Textarea
                value={output}
                onChange={(e) => setOutput(e.target.value)}
                rows={20}
                className="font-mono text-sm leading-relaxed"
              />
            ) : (
              <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                Your generated email will appear here. Fill in the details and click{" "}
                <span className="font-medium text-foreground">Generate email</span>.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export function PageHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow">
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
