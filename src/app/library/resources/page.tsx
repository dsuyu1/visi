import { ScrollReveal } from "@/components/ScrollReveal";
import { SlideReveal } from "@/components/SlideReveal";
import { RESOURCES } from "@/lib/content";

export default function ResourcesPage() {
  return (
    <div className="flex flex-col">
      <div className="mx-auto w-full max-w-7xl px-6 pb-16 pt-20 text-center">
        <h1
          className="font-bold leading-[1.05] tracking-tight"
          style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)" }}
        >
          <SlideReveal delay={80}>Resources</SlideReveal>
        </h1>

        <ScrollReveal delay={160} className="mt-6 mx-auto max-w-xl">
          <p className="text-base leading-[1.9] text-muted" style={{ fontWeight: 300 }}>
            Notes, decks, references, and other resources.
          </p>
        </ScrollReveal>
      </div>

      <div className="pb-24">
        <div className="mt-8 text-left">
          {RESOURCES.map((r, i) => (
            <div key={r.id} className="work-item group">
              <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 md:flex-row md:items-start md:justify-between md:gap-16">
                <div className="flex-1">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="indicator-bar" />
                    <span className="work-num">{String(i + 1).padStart(2, "0")}</span>
                  </div>

                  <h2 className="mb-2 text-xl font-semibold tracking-tight leading-snug">
                    {r.title}
                  </h2>
                  <p className="max-w-2xl text-sm leading-[1.9] text-muted" style={{ fontWeight: 300 }}>
                    {r.description}
                  </p>
                </div>

                <div className="shrink-0">
                  {r.downloadHref ? (
                    <a
                      href={r.downloadHref}
                      download
                      className="btn-slide btn-primary inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-medium tracking-wide font-sans"
                    >
                      {r.ctaLabel} <span aria-hidden>↓</span>
                    </a>
                  ) : r.href ? (
                    <a
                      href={r.href}
                      target="_blank"
                      rel="noreferrer"
                      className="work-arrow inline-flex items-center text-sm font-medium text-foreground"
                    >
                      {r.ctaLabel} <span>→</span>
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
