"use client";

import { useEffect, useRef, useState } from "react";
import type { Member } from "@/lib/content";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0] ?? "")
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  { from: "#0f172a", to: "#1e3a5f" },
  { from: "#0d1117", to: "#1a2744" },
  { from: "#1a0a2e", to: "#2d1657" },
  { from: "#0f1a0f", to: "#1a3a2a" },
  { from: "#2d1657", to: "#0f1a0f" },
];

export function MembersCarousel({ members }: { members: Member[] }) {
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = members.length;

  const advance = (dir: 1 | -1) => {
    setActive((prev) => (prev + dir + count) % count);
  };

  // Auto-rotate every 3s
  useEffect(() => {
    timerRef.current = setInterval(() => advance(1), 3000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => advance(1), 3000);
  };

  const go = (i: number) => { setActive(i); resetTimer(); };
  const prev = () => { advance(-1); resetTimer(); };
  const next = () => { advance(1); resetTimer(); };

  // Drag/swipe support
  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(false);
    startX.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) next();
      else prev();
    }
    setDragging(false);
  };

  // Build a window of cards: prev, active, next (wrapping)
  const cards = [-1, 0, 1].map((offset) => {
    const idx = (active + offset + count) % count;
    return { idx, offset, member: members[idx]! };
  });

  return (
    <div className="flex flex-col items-center gap-8 py-10">
      {/* Card stage */}
      <div
        className="relative flex h-56 w-full max-w-2xl select-none items-center justify-center overflow-visible"
        style={{ touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {cards.map(({ idx, offset, member }) => {
          const colors = AVATAR_COLORS[idx % AVATAR_COLORS.length]!;
          const isCenter = offset === 0;
          return (
            <div
              key={idx}
              onClick={() => !dragging && go(idx)}
              className="absolute flex cursor-pointer flex-col items-center gap-4 rounded-none border border-border bg-panel p-8 transition-all duration-500"
              style={{
                width: isCenter ? 280 : 220,
                opacity: isCenter ? 1 : 0.4,
                transform: `translateX(${offset * 260}px) scale(${isCenter ? 1 : 0.88})`,
                zIndex: isCenter ? 10 : 1,
                boxShadow: isCenter ? "var(--shadow)" : "none",
                pointerEvents: isCenter ? "auto" : "none",
              }}
            >
              {/* Avatar */}
              <div
                className="grid size-16 place-items-center text-lg font-bold tracking-widest text-white font-sans"
                style={{
                  background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
                  fontFamily: "ui-monospace, monospace",
                }}
              >
                {initials(member.name)}
              </div>

              {/* Info */}
              <div className="text-center">
                <p className="text-base font-semibold tracking-tight">{member.name}</p>
                <p className="mt-0.5 text-xs text-muted-light">{member.role}</p>
                {member.focus && (
                  <p className="mt-2 text-[11px] text-muted-light opacity-75">{member.focus}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        <button
          onClick={prev}
          aria-label="Previous member"
          className="grid size-8 place-items-center border border-border text-muted transition-colors hover:border-foreground hover:text-foreground"
        >
          ←
        </button>

        {/* Dot indicators */}
        <div className="flex gap-2">
          {members.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Go to member ${i + 1}`}
              className="transition-all duration-300"
              style={{
                width: i === active ? 20 : 6,
                height: 6,
                background: i === active ? "var(--foreground)" : "var(--border)",
                borderRadius: 3,
              }}
            />
          ))}
        </div>

        <button
          onClick={next}
          aria-label="Next member"
          className="grid size-8 place-items-center border border-border text-muted transition-colors hover:border-foreground hover:text-foreground"
        >
          →
        </button>
      </div>
    </div>
  );
}
