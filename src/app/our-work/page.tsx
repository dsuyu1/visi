import Link from "next/link";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SlideReveal } from "@/components/SlideReveal";
import { WORK_ITEMS } from "@/lib/content";
import { formatDate } from "@/lib/format";

const CATEGORY_LABELS: Record<string, string> = {
  project: "Project",
  writeup: "Writeup",
  report:  "Report",
};

export default function OurWorkPage() {
  return (
    <div className="flex flex-col">
      <div className="mx-auto w-full max-w-7xl px-6 pb-16 pt-20 text-center">

      <h1 className="font-bold leading-[1.05] tracking-tight"
          style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)" }}>
        <span className="block"><SlideReveal delay={80}>What we&apos;ve built.</SlideReveal></span>
      </h1>

      <ScrollReveal delay={200} className="mt-6 mx-auto max-w-xl">
        <p className="text-base leading-[1.9] text-muted" style={{ fontWeight: 300 }}>
          Projects, reports, and other deliverables. Everything here is
          open for review; feel free to cite it, build on it, or reach out if you spot
          something wrong.
        </p>
      </ScrollReveal>
      </div>

      {/* Work items */}
      <div className="border-t border-border pb-24">
        <div className="mt-8 text-left">
        {WORK_ITEMS.map((item, i) => (
          <ScrollReveal key={item.slug} delay={i * 80} className="work-item group">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 md:flex-row md:items-start md:justify-between">

              {/* Left */}
              <div className="flex-1">
                <div className="mb-3 flex items-center gap-3">
                  <span className="indicator-bar" />
                  <span className="work-num">{String(i + 1).padStart(2, "0")}</span>
                </div>

                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-border px-2.5 py-0.5 text-[11px] font-medium text-muted">
                    {CATEGORY_LABELS[item.category]}
                  </span>
                  {item.tags.slice(0, 3).map((t) => (
                    <span key={t}
                      className="rounded-full border border-border px-2.5 py-0.5 text-[11px] font-medium text-muted">
                      {t}
                    </span>
                  ))}
                </div>

                <h2 className="mb-2 text-xl font-semibold tracking-tight leading-snug">
                  {item.title}
                </h2>
                <p className="mb-4 max-w-lg text-sm leading-[1.9] text-muted" style={{ fontWeight: 300 }}>
                  {item.description}
                </p>

                <div className="flex items-center gap-6">
                  <span className="text-xs text-muted-light">{formatDate(item.date)}</span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: item.status === "active" ? "var(--foreground)" : "var(--muted-light)" }}
                  >
                    {item.status === "active" ? "● active" : "✓ completed"}
                  </span>
                </div>
              </div>

              {/* Right — links */}
              {item.links && item.links.length > 0 && (
                <div className="flex shrink-0 flex-col gap-2">
                  {item.links.map((l) => (
                    <Link key={l.href} href={l.href}
                      className="work-arrow text-sm font-medium text-foreground">
                      {l.label} <span>→</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </ScrollReveal>
        ))}
      </div>
      </div>

    </div>
  );
}
