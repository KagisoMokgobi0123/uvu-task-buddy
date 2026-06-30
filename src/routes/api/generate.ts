import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

type Mode = "email" | "summary" | "plan";

interface RequestBody {
  mode: Mode;
  input: Record<string, unknown>;
}

function buildPrompt(mode: Mode, input: Record<string, unknown>): { system: string; prompt: string } {
  if (mode === "email") {
    return {
      system:
        "You are an expert workplace communications writer for UVU. Produce a single, ready-to-send professional email. " +
        "Return ONLY the email body with a 'Subject: ...' first line, then a blank line, then the email. No commentary, no markdown fences.",
      prompt:
        `Write a workplace email.\n` +
        `Recipient name: ${input.recipientName || "(unspecified)"}\n` +
        `Audience: ${input.audience}\n` +
        `Tone: ${input.tone}\n` +
        `Subject hint: ${input.subject}\n` +
        `Purpose: ${input.purpose}\n` +
        `Additional context: ${input.context || "(none)"}\n` +
        `Sender: ${input.senderName || "UVU Team"}\n`,
    };
  }
  if (mode === "summary") {
    return {
      system:
        "You are an expert meeting analyst. Summarise the meeting notes into clear sections. " +
        "Return STRICT markdown with exactly these headings in this order: " +
        "## Executive Summary\n## Key Points\n## Decisions Made\n## Action Items\n## Deadlines\n## Responsible People\n" +
        "Use bullet lists under each section. Be concise and concrete.",
      prompt: `Meeting notes:\n\n${input.notes}`,
    };
  }
  return {
    system:
      "You are an AI productivity planner. Given the user's tasks and constraints, produce an optimised plan. " +
      "Return markdown with these sections: ## Priority Matrix (Urgent/Important quadrants), " +
      "## Today's Time-Blocked Schedule (table with Time | Task | Priority), " +
      "## Weekly Plan (table with Day | Focus), and ## Productivity Tips (3-5 bullets). " +
      "Respect the working hours, breaks and meeting times provided.",
    prompt:
      `Tasks:\n${input.tasks}\n\n` +
      `Working hours: ${input.workingHours || "09:00 - 17:00"}\n` +
      `Meeting times: ${input.meetingTimes || "none"}\n` +
      `Preferred break times: ${input.breakTimes || "12:30 - 13:00"}\n` +
      `Notes: ${input.notes || "(none)"}\n`,
  };
}

export const Route = createFileRoute("/api/generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as RequestBody;
        if (!body?.mode || !body?.input) {
          return new Response("mode and input required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const { system, prompt } = buildPrompt(body.mode, body.input);
        try {
          const { text } = await generateText({
            model: gateway("google/gemini-3-flash-preview"),
            system,
            prompt,
          });
          return Response.json({ text });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "AI request failed";
          const status = /429/.test(msg) ? 429 : /402/.test(msg) ? 402 : 500;
          return new Response(msg, { status });
        }
      },
    },
  },
});
