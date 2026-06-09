"use client";

import { useEffect, useMemo, useRef } from "react";

function completedKey(certId: string) {
  return `visi.academy.completed.v2:${certId}`;
}

function readCompletionMap(certId: string): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(completedKey(certId));
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

export function AcademyProgressBarClient({
  certId,
  unitKeys,
  compact,
}: {
  certId: string;
  unitKeys: string[];
  compact?: boolean;
}) {
  const barRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);
  const countRef = useRef<HTMLSpanElement | null>(null);

  const unitKeySignature = useMemo(() => unitKeys.join("|"), [unitKeys]);

  useEffect(() => {
    const update = () => {
      const map = readCompletionMap(certId);
      const total = unitKeys.length;
      const completed = unitKeys.reduce((acc, k) => (map[k] ? acc + 1 : acc), 0);
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

      if (barRef.current) {
        barRef.current.style.width = `${pct}%`;
      }
      if (labelRef.current) {
        labelRef.current.textContent = `${pct}%`;
      }
      if (countRef.current) {
        countRef.current.textContent = `${completed}/${total}`;
      }
    };

    update();
    window.addEventListener("visi-academy-progress", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("visi-academy-progress", update);
      window.removeEventListener("storage", update);
    };
  }, [certId, unitKeySignature, unitKeys]);

  return (
    <div>
      <div className={compact ? "mt-2" : "mt-3"}>
        <div
          className="h-2 w-full overflow-hidden rounded-full border border-border bg-background"
          aria-hidden
        >
          <div
            ref={barRef}
            className="h-full w-0 rounded-full"
            style={{ background: "var(--foreground)" }}
          />
        </div>
      </div>

      <p className={compact ? "mt-2 text-xs text-muted-light" : "mt-3 text-xs text-muted-light"}>
        <span ref={countRef}>0/0</span> complete · <span ref={labelRef}>0%</span>
      </p>
    </div>
  );
}
