export const runtime = "edge";
export const dynamic = "force-dynamic";

import { z } from "zod";

import { getClientIp, rateLimit } from "@/lib/rateLimit";

const PracticeRequestSchema = z
  .object({
    title: z.string().trim().max(140).optional(),
    text: z.string().trim().min(1).max(15_000),
    questionCount: z.number().int().min(3).max(10).optional(),
  })
  .strict();

const PracticeQuizSchema = z
  .object({
    questions: z
      .array(
        z.object({
          prompt: z.string().trim().min(10).max(600),
          choices: z.array(z.string().trim().min(1).max(240)).length(4),
          answerIndex: z.number().int().min(0).max(3),
          explanation: z.string().trim().min(1).max(800),
        }),
      )
      .min(3)
      .max(10),
  })
  .strict();

function env(name: string) {
  const v = process.env[name];
  return v == null || v.trim() === "" ? null : v.trim();
}

function stripMarkdownForQuestions(markdown: string) {
  return (
    markdown
      .replace(/```[\s\S]*?```/g, "")
      .replace(/^\|.*\|\s*$/gm, (line) => line.replace(/\|/g, " ").trim())
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = rateLimit({
    key: `academy:practice:${ip}`,
    limit: 12,
    windowMs: 15 * 60 * 1000,
  });
  if (!rl.ok) {
    return Response.json(
      { ok: false, error: "Rate limit exceeded. Try again soon." },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSeconds) },
      },
    );
  }

  const apiKey = env("OPENAI_API_KEY");
  if (!apiKey) {
    return Response.json(
      { ok: false, error: "Practice questions are not configured on the server." },
      { status: 501 },
    );
  }

  const model = env("OPENAI_QUIZ_MODEL") ?? "gpt-4o-mini";

  const body = await request.json().catch(() => null);
  const parsed = PracticeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const questionCount = parsed.data.questionCount ?? 6;
  const title = parsed.data.title?.trim() || "Study notes";

  const text = stripMarkdownForQuestions(parsed.data.text);
  const limited = text.length > 12_000 ? text.slice(0, 12_000) : text;

  const userPrompt = [
    `Title: ${title}`,
    "",
    "Study notes:",
    limited,
    "",
    `Generate ${questionCount} challenging multiple-choice questions (4 choices each) that can ONLY be answered from the notes above.`,
    "Rules:",
    "- Do not use outside knowledge.",
    "- Include distractors that sound plausible but contradict the notes.",
    "- Focus on decision points, comparisons, and specific caveats stated in the notes.",
    "- Output valid JSON only, matching this exact shape:",
    `{\"questions\":[{\"prompt\":\"...\",\"choices\":[\"A\",\"B\",\"C\",\"D\"],\"answerIndex\":0,\"explanation\":\"...\"}]}`,
  ].join("\n");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You generate exam-style practice questions from a provided study note excerpt. You must not rely on external facts. Always return strict JSON.",
        },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  const json = (await res.json().catch(() => null)) as
    | null
    | { choices?: Array<{ message?: { content?: string | null } | null }>; error?: { message?: string } };

  if (!res.ok) {
    return Response.json(
      { ok: false, error: json?.error?.message ?? "Failed to generate questions." },
      { status: 502 },
    );
  }

  const content = json?.choices?.[0]?.message?.content?.trim() ?? "";
  let quizRaw: unknown = null;
  try {
    quizRaw = content ? (JSON.parse(content) as unknown) : null;
  } catch {
    quizRaw = null;
  }

  const quizParsed = PracticeQuizSchema.safeParse(quizRaw);
  if (!quizParsed.success) {
    return Response.json(
      { ok: false, error: "Failed to generate valid questions. Try again." },
      { status: 502 },
    );
  }

  return Response.json({ ok: true, quiz: quizParsed.data });
}

