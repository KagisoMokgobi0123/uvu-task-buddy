import { createFileRoute } from "@tanstack/react-router";
import { streamText, type ModelMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

interface Body {
  messages: { role: "user" | "assistant" | "system"; content: string }[];
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Body;
        if (!Array.isArray(body.messages)) {
          return new Response("messages required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const messages: ModelMessage[] = body.messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));
        try {
          const result = streamText({
            model: gateway("google/gemini-3-flash-preview"),
            system:
              "You are the UVU AI Workplace Assistant — a friendly, professional workplace productivity assistant for UVU staff in Port Elizabeth, South Africa. " +
              "Help users draft emails, summarise notes, plan their day, explain workplace topics and answer questions. " +
              "Use clear markdown formatting (headings, bullets, code blocks) when helpful. Be concise, warm and professional.",
            messages,
          });
          return result.toTextStreamResponse();
        } catch (e) {
          const msg = e instanceof Error ? e.message : "AI request failed";
          const status = /429/.test(msg) ? 429 : /402/.test(msg) ? 402 : 500;
          return new Response(msg, { status });
        }
      },
    },
  },
});
