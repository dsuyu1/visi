export const runtime = "edge";
import { z } from "zod";

const ContactSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email().max(254),
    discord: z.string().trim().max(64).optional().or(z.literal("")),
    topic: z
      .enum(["discord", "general", "partners", "events", "blog", "other"])
      .optional()
      .or(z.literal("")),
    message: z.string().trim().min(10).max(2000),
    company: z.string().optional().or(z.literal("")), // honeypot
  })
  .strict();

type ContactPayload = z.infer<typeof ContactSchema>;

function env(name: string) {
  const v = process.env[name];
  return v == null || v.trim() === "" ? null : v.trim();
}

function buildMailText(p: ContactPayload) {
  const lines = [
    `Topic: ${p.topic || "general"}`,
    `Name: ${p.name}`,
    `Email: ${p.email}`,
    `Discord: ${p.discord || "(not provided)"}`,
    "",
    p.message,
  ];
  return lines.join("\n");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: "Invalid form data." },
      { status: 400 }
    );
  }

  const payload = parsed.data;
  if (payload.company) {
    return Response.json({ ok: true });
  }

  const to = env("CONTACT_TO_EMAIL");
  const from = env("CONTACT_FROM_EMAIL");
  const resendApiKey = env("RESEND_API_KEY");

  if (!to || !from || !resendApiKey) {
    return Response.json(
      { ok: false, error: "Email delivery is not configured on the server." },
      { status: 501 }
    );
  }

  const topicLabel = payload.topic ? payload.topic.toUpperCase() : "GENERAL";
  const subject = `[${topicLabel}] ${payload.name} - website contact`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text: buildMailText(payload),
      reply_to: payload.email,
    }),
  });

  if (!res.ok) {
    return Response.json(
      { ok: false, error: "Failed to send email." },
      { status: 502 }
    );
  }

  return Response.json({ ok: true });
}
