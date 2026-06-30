import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  User,
  Loader2,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  clearChat,
  loadChat,
  saveChat,
  saveHistoryEntry,
  type StoredChatMessage,
} from "@/lib/storage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/chat")({
  head: () => ({ meta: [{ title: "AI Assistant — UVU AI" }] }),
  component: ChatPage,
});

const suggestions = [
  "Write an email to my manager asking for time off next Friday",
  "Summarise this report into 5 bullet points: ...",
  "Create today's schedule with 3 deep-work blocks and a 30-min walk",
  "Explain cloud computing in simple terms for a new team member",
  "Help me research cyber security best practices for a small team",
];

function ChatPage() {
  const [messages, setMessages] = useState<StoredChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessages(loadChat());
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  useEffect(() => {
    saveChat(messages);
  }, [messages]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;
    const userMsg: StoredChatMessage = { id: crypto.randomUUID(), role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setStreaming(true);

    const assistantId = crypto.randomUUID();
    setMessages((m) => [...m, { id: assistantId, role: "assistant", content: "" }]);

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        signal: ctrl.signal,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (!res.ok || !res.body) {
        const err = await res.text();
        if (res.status === 429) toast.error("Too many requests. Please slow down.");
        else if (res.status === 402)
          toast.error("AI credits exhausted. Please add credits to your workspace.");
        else toast.error(err || "Failed to reach AI");
        setMessages((m) => m.filter((x) => x.id !== assistantId));
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        const snapshot = acc;
        setMessages((m) => m.map((x) => (x.id === assistantId ? { ...x, content: snapshot } : x)));
      }
      // Save final chat snapshot to history
      saveHistoryEntry({
        kind: "chat",
        title: trimmed.slice(0, 60),
        content: `**You:** ${trimmed}\n\n**Assistant:** ${acc}`,
      });
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        toast.error(e instanceof Error ? e.message : "Stream error");
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
      inputRef.current?.focus();
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  function newChat() {
    abortRef.current?.abort();
    clearChat();
    setMessages([]);
    inputRef.current?.focus();
  }

  return (
    <div className="-m-4 flex h-[calc(100vh-4rem)] flex-col sm:-m-6 lg:-m-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">UVU AI Assistant</h1>
            <p className="text-xs text-muted-foreground">Your always-on workplace co-worker</p>
          </div>
        </div>
        {messages.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Trash2 className="mr-1 h-4 w-4" /> New chat
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Start a new chat?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will clear your current conversation. Saved entries in History will not be affected.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={newChat}>Clear conversation</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-muted/20">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          {messages.length === 0 ? (
            <div className="py-10 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow">
                <Sparkles className="h-7 w-7" />
              </div>
              <h2 className="mt-5 text-xl font-bold tracking-tight text-foreground">
                How can I help you today?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Ask anything. Try one of these to get started.
              </p>
              <div className="mx-auto mt-6 grid max-w-2xl gap-2 sm:grid-cols-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-xl border border-border bg-card p-3 text-left text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-card/80"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} streaming={streaming} />
              ))}
              {streaming && messages[messages.length - 1]?.content === "" && (
                <div className="flex items-center gap-2 px-12 text-sm text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-background px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="relative rounded-2xl border border-border bg-card shadow-soft focus-within:border-primary/40 focus-within:shadow-glow">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Message UVU AI…  (Shift+Enter for newline)"
              rows={1}
              className="max-h-48 min-h-[52px] resize-none border-0 bg-transparent pr-14 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button
              type="button"
              size="icon"
              onClick={() => send(input)}
              disabled={streaming || !input.trim()}
              className="absolute bottom-2 right-2 h-9 w-9 rounded-xl bg-gradient-brand text-primary-foreground shadow-glow"
            >
              {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            UVU AI may make mistakes. Double-check important details.
          </p>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, streaming }: { message: StoredChatMessage; streaming: boolean }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
          isUser ? "bg-muted text-foreground" : "bg-gradient-brand text-primary-foreground shadow-glow",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={cn("min-w-0 max-w-[85%]", isUser && "text-right")}>
        {isUser ? (
          <div className="inline-block rounded-2xl bg-primary px-4 py-2.5 text-left text-sm text-primary-foreground shadow-soft">
            {message.content}
          </div>
        ) : (
          <div className="group">
            <div className="prose prose-sm dark:prose-invert max-w-none break-words [&_pre]:rounded-lg [&_pre]:bg-muted [&_code]:text-[0.9em]">
              <ReactMarkdown>{message.content || "…"}</ReactMarkdown>
            </div>
            {!streaming && message.content && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(message.content);
                  toast.success("Copied");
                }}
                className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
              >
                <Copy className="h-3 w-3" /> Copy
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
