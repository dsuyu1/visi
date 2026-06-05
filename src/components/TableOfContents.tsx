"use client";
import { useEffect, useState } from "react";
import type { Heading } from "@/lib/format";

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the topmost entry that is intersecting
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        // Fire when a heading crosses ~15% from the top of the viewport
        rootMargin: "-10% 0% -80% 0%",
        threshold: 0,
      },
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav aria-label="Table of contents">
      <p className="field-label mb-5">Contents</p>
      <ul className="space-y-1">
        {headings.map((h) => {
          const active = activeId === h.id;
          return (
            <li key={h.id} style={{ paddingLeft: h.level === 3 ? "14px" : "0" }}>
              <a
                href={`#${h.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById(h.id)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  setActiveId(h.id);
                }}
                className="group flex items-start gap-2 py-1 text-sm leading-snug transition-colors duration-200"
                style={{ color: active ? "var(--foreground)" : "var(--muted-light)" }}
              >
                {/* Active indicator bar */}
                <span
                  className="mt-[5px] inline-block h-px shrink-0 bg-foreground transition-all duration-300"
                  style={{ width: active ? "16px" : "8px", opacity: active ? 1 : 0.3 }}
                />
                <span
                  className="transition-colors duration-200"
                  style={{
                    fontWeight: active ? 500 : 300,
                    color: active ? "var(--foreground)" : "var(--muted-light)",
                  }}
                >
                  {h.text}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
