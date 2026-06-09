"use client";

import { useEffect, useRef, useState } from "react";

import { SafeMarkdown } from "@/components/academy/SafeMarkdown";

function notesKey(certId: string, unitId: string) {
  return `visi.academy.notes.v2:${certId}:${unitId}`;
}

function completedKey(certId: string) {
  return `visi.academy.completed.v2:${certId}`;
}

function unitKey(moduleId: string, unitId: string) {
  return `${moduleId}::${unitId}`;
}

export function StudyToolsClient(props: {
  certId: string;
  moduleId: string;
  unitId: string;
  unitTitle: string;
  unitMarkdown: string;
}) {
  const { certId, moduleId, unitId } = props;

  const notesRef = useRef<HTMLTextAreaElement | null>(null);
  const completedRef = useRef<HTMLInputElement | null>(null);
  const [notes, setNotes] = useState("");
  const [mode, setMode] = useState<"write" | "preview">("write");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(notesKey(certId, unitKey(moduleId, unitId))) ?? "";
      if (notesRef.current) notesRef.current.value = stored;
    } catch {}

    try {
      const raw = localStorage.getItem(completedKey(certId));
      const parsed = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
      const key = unitKey(moduleId, unitId);
      if (completedRef.current) completedRef.current.checked = !!parsed[key];
    } catch {}
  }, [certId, moduleId, unitId]);

  const persistNotes = (next: string) => {
    try {
      localStorage.setItem(notesKey(certId, unitKey(moduleId, unitId)), next);
    } catch {}
  };

  const toggleCompleted = (next: boolean) => {
    try {
      const raw = localStorage.getItem(completedKey(certId));
      const parsed = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
      parsed[unitKey(moduleId, unitId)] = next;
      localStorage.setItem(completedKey(certId), JSON.stringify(parsed));
    } catch {}
    try {
      window.dispatchEvent(new Event("visi-academy-progress"));
    } catch {}
  };

  return (
    <section className="border border-border bg-panel p-6" style={{ boxShadow: "var(--shadow)" }}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-widest text-muted-light uppercase font-sans">Notes</p>
          <p className="mt-1 text-sm text-muted leading-relaxed" style={{ fontWeight: 300 }}>
            Save what you want to remember and mark the unit complete when you’re done.
          </p>
        </div>

        <label className="inline-flex items-center gap-2 text-xs text-muted-light select-none">
          <input
            type="checkbox"
            ref={completedRef}
            defaultChecked={false}
            onChange={(e) => toggleCompleted(e.target.checked)}
            className="h-4 w-4 accent-[var(--foreground)]"
          />
          Completed
        </label>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <label className="block text-xs font-medium tracking-wide text-muted-light">Your notes</label>

          <div className="inline-flex overflow-hidden rounded border border-border bg-background">
            <button
              type="button"
              onClick={() => setMode("write")}
              className={`px-3 py-1.5 text-xs font-medium tracking-wide font-sans ${mode === "write" ? "bg-panel-hover text-foreground" : "text-muted"}`}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => {
                setNotes(notesRef.current?.value ?? "");
                setMode("preview");
              }}
              className={`px-3 py-1.5 text-xs font-medium tracking-wide font-sans ${mode === "preview" ? "bg-panel-hover text-foreground" : "text-muted"}`}
            >
              Preview
            </button>
          </div>
        </div>

        {mode === "write" ? (
          <textarea
            ref={notesRef}
            defaultValue=""
            onChange={(e) => {
              persistNotes(e.target.value);
              setNotes(e.target.value);
            }}
            rows={9}
            className="mt-2 w-full resize-y border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground"
            placeholder="Write what you want to remember. Markdown is supported in Preview."
          />
        ) : (
          <div className="mt-2 border border-border bg-background p-4">
            {notes.trim().length ? (
              <SafeMarkdown markdown={notes} className="prose" />
            ) : (
              <p className="text-sm text-muted" style={{ fontWeight: 300 }}>
                Nothing to preview yet.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
