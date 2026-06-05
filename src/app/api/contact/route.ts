export const runtime = "nodejs";

import nodemailer from "nodemailer";
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
  const host = env("SMTP_HOST");
  const portRaw = env("SMTP_PORT");
  const secureRaw = env("SMTP_SECURE");
  const user = env("SMTP_USER");
  const pass = env("SMTP_PASS");

  if (!to || !host || !portRaw || !user || !pass) {
    return Response.json(
      { ok: false, error: "Email delivery is not configured on the server." },
      { status: 501 }
    );
  }

  const port = Number(portRaw);
  if (!Number.isFinite(port) || port <= 0) {
    return Response.json(
      { ok: false, error: "SMTP_PORT must be a valid number." },
      { status: 500 }
    );
  }

  const secure = secureRaw ? secureRaw.toLowerCase() === "true" : port === 465;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  const topicLabel = payload.topic ? payload.topic.toUpperCase() : "GENERAL";
  const subject = `[${topicLabel}] ${payload.name} — website contact`;

  await transporter.sendMail({
    to,
    from: from ?? user,
    replyTo: payload.email,
    subject,
    text: buildMailText(payload),
  });

  return Response.json({ ok: true });
}

