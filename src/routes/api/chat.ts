import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages?: UIMessage[] };
        if (!Array.isArray(body.messages)) {
          return new Response("messages required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system:
            "You are the UVU AI Workplace Assistant — a friendly, professional workplace productivity assistant for UVU staff in Port Elizabeth, South Africa. " +
            "Help users with drafting emails, summarising notes, planning their day, explaining workplace topics and answering questions. " +
            "Be concise, well-formatted (use markdown), warm and professional.",
          messages: convertToModelMessages(body.messages),
        });
        return result.toUIMessageStreamResponse();
      },
    },
  },
});
