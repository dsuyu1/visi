"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/cn";
import { SITE } from "@/lib/site";

type Topic = "discord" | "general" | "partners" | "events" | "blog" | "other";

const topics: { value: Topic; label: string }[] = [
  { value: "discord",  label: "Request Discord access" },
  { value: "general",  label: "General"                },
  { value: "partners", label: "Partners"               },
  { value: "events",   label: "Events"                 },
  { value: "blog",     label: "Blog"                   },
  { value: "other",    label: "Other"                  },
];

function mailtoForFallback(payload: {
  name: string;
  email: string;
  discord: string;
  topic: string;
  message: string;
}) {
  const subject = `[${payload.topic || "general"}] ${payload.name} — website contact`;
  const body = [
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Discord: ${payload.discord || "(not provided)"}`,
    "",
    payload.message,
  ].join("\n");
  const params = new URLSearchParams({ subject, body });
  return `mailto:${SITE.contactEmail}-${params.toString()}`;
}

export function ContactForm({ defaultTopic }: { defaultTopic?: string }) {
  const defaultTopicValue = useMemo(() => {
    if (!defaultTopic) return "discord" as Topic;
    const normalized = defaultTopic.toLowerCase();
    const exists = topics.some((t) => t.value === normalized);
    return (exists ? normalized : "discord") as Topic;
  }, [defaultTopic]);

  const [status, setStatus] = useState<
    | { type: "idle"    }
    | { type: "sending" }
    | { type: "success" }
    | { type: "error"; message: string; mailto?: string }
  >({ type: "idle" });

  const [topic, setTopic] = useState<Topic>(defaultTopicValue);

  return (
    <form
      className="grid gap-5"
      onSubmit={async (e) => {
        e.preventDefault();
        if (status.type === "sending") return;

        const form = e.currentTarget;
        const formData = new FormData(form);

        const payload = {
          name:    String(formData.get("name")    ?? ""),
          email:   String(formData.get("email")   ?? ""),
          discord: String(formData.get("discord") ?? ""),
          topic:   String(formData.get("topic")   ?? ""),
          message: String(formData.get("message") ?? ""),
          company: String(formData.get("company") ?? ""),
        };

        setStatus({ type: "sending" });

        try {
          const res = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const json = (await res.json().catch(() => null)) as
            | { ok: true }
            | { ok: false; error?: string }
            | null;

          if (res.ok && json && "ok" in json && json.ok) {
            form.reset();
            setTopic(defaultTopicValue);
            setStatus({ type: "success" });
            return;
          }

          const msg =
            (json && "error" in json && json.error) ||
            "Something went wrong sending your message.";
          setStatus({ type: "error", message: msg, mailto: mailtoForFallback(payload) });
        } catch {
          setStatus({
            type: "error",
            message: "Network error sending your message.",
            mailto: mailtoForFallback(payload),
          });
        }
      }}
    >
      {/* Topic */}
      <label className="grid gap-2">
        <span className="field-label">Topic</span>
        <select
          name="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value as Topic)}
          className="field-input"
        >
          {topics.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      {/* Name + Email */}
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="field-label">Name</span>
          <input
            name="name"
            required
            placeholder="Your name"
            className="field-input"
          />
        </label>

        <label className="grid gap-2">
          <span className="field-label">Email</span>
          <input
            name="email"
            required
            type="email"
            placeholder="you@example.com"
            className="field-input"
          />
        </label>
      </div>

      {/* Discord (optional) */}
      <label className="grid gap-2">
        <span className="field-label">Discord (optional)</span>
        <input
          name="discord"
          placeholder="username#0000"
          className="field-input"
        />
      </label>

      {/* Honeypot */}
      <label className="hidden">
        <span>Company</span>
        <input tabIndex={-1} autoComplete="off" name="company" />
      </label>

      {/* Message */}
      <label className="grid gap-2">
        <span className="field-label">Message</span>
        <textarea
          name="message"
          required
          placeholder="What are you interested in building or learning?"
          rows={6}
          className="field-input resize-none"
        />
      </label>

      {/* Submit + status */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          className={cn(
            "btn-slide inline-flex items-center justify-center px-7 py-3.5 text-sm font-medium tracking-wide transition-colors",
            status.type === "sending"
              ? "cursor-not-allowed bg-foreground/60 text-background"
              : "bg-foreground text-background hover:bg-secondary",
          )}
        >
          {status.type === "sending" ? "Sending…" : "Send message"}
        </button>

        {status.type === "success" && (
          <div className="inline-flex items-center gap-2 text-sm text-muted">
            <CheckCircle2 className="size-4 shrink-0 text-secondary" />
            Message sent — we&apos;ll reply by email.
          </div>
        )}

        {status.type === "error" && (
          <div className="flex flex-col gap-2 text-sm text-muted">
            <div className="inline-flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0 text-muted" />
              {status.message}
            </div>
            {status.mailto && (
              <a
                className="text-xs underline underline-offset-4 decoration-muted-light hover:text-foreground transition-colors"
                href={status.mailto}
              >
                Open in email client instead →
              </a>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
