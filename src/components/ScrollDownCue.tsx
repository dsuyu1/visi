"use client";

import { useCallback } from "react";

import { cn } from "@/lib/cn";

export function ScrollDownCue({
  targetId,
  className,
}: {
  targetId: string;
  className?: string;
}) {
  const onClick = useCallback(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [targetId]);

  return (
    <button
      type="button"
      aria-label="Scroll down"
      onClick={onClick}
      className={cn("scroll-cue", className)}
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-5 w-5"
        aria-hidden
      >
        <path
          d="M4.5 7.5L10 13L15.5 7.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

