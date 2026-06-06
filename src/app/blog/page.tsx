import Link from "next/link";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SlideReveal } from "@/components/SlideReveal";
import { BLOG_POSTS } from "@/lib/content";
import { formatDate } from "@/lib/format";

const PANEL_COLORS = [
  "var(--blog-panel-1)",
  "var(--blog-panel-2)",
  "var(--blog-panel-3)",
  "var(--blog-panel-4)",
  "var(--blog-panel-5)",
];

export default function BlogPage() {
  return (
    <div className="flex flex-col">
      <div className="mx-auto w-full max-w-7xl px-6 pb-16 pt-20 text-center">

      {/* --- Header ------------------------------------------------------ */}
      <h1 className="font-bold leading-[1.05] tracking-tight"
          style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)" }}>
        <span className="block">
          <SlideReveal delay={80}>Read our</SlideReveal>
        </span>
        <span className="block">
          <SlideReveal delay={260}>latest news.</SlideReveal>
        </span>
      </h1>

      <ScrollReveal delay={200} className="mt-6 mx-auto max-w-xl">
        <p className="text-base leading-[1.9] text-muted" style={{ fontWeight: 300 }}>
          Our blog is our place to talk about anything we can think of. 
        </p>
      </ScrollReveal>
      </div>

      {/* --- Post list --------------------------------------------------- */}
      <div className="pb-24">
        <div className="mt-8 text-left">
          {BLOG_POSTS.length === 0 ? (
            <div className="mx-auto max-w-7xl px-6 py-12">
              <ScrollReveal>
                <div
                  className="border border-border bg-panel p-10 text-center md:p-14"
                  style={{ boxShadow: "var(--shadow)" }}
                >
                  <h2 className="mb-3 text-2xl font-semibold tracking-tight">No posts yet.</h2>
                  <p className="mx-auto max-w-xl text-sm leading-[1.9] text-muted" style={{ fontWeight: 300 }}>
                    We&apos;re still building the lab. Check back soon for research notes, project write-ups, and guides.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          ) : (
            BLOG_POSTS.map((post, i) => {
              const panelColor = PANEL_COLORS[i % PANEL_COLORS.length];
              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="work-item group block"
                >
                  <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
                    {/* Left */}
                    <div className="flex-1">
                      <div className="mb-3 flex items-center gap-3">
                        <span className="indicator-bar" />
                        <span className="work-num">
                          {String(i + 1).padStart(2, "0")} · {formatDate(post.date)}
                        </span>
                      </div>

                      <div className="mb-3 flex flex-wrap gap-2">
                        {post.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-border px-2.5 py-0.5 text-[11px] font-medium text-muted"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <h2 className="mb-2 text-xl font-semibold tracking-tight leading-snug">
                        {post.title}
                      </h2>
                      <p
                        className="mb-5 max-w-lg text-sm leading-[1.9] text-muted"
                        style={{ fontWeight: 300 }}
                      >
                        {post.excerpt}
                      </p>

                      <span className="work-arrow text-sm font-medium text-foreground">
                        Read article <span>→</span>
                      </span>
                    </div>

                    {/* Right panel */}
                    <div
                      className="work-panel hidden h-36 w-44 shrink-0 rounded-2xl md:block"
                      style={{ background: panelColor }}
                    />
                  </div>
                </Link>
              );
            })
          )}
      </div>

    </div>
    </div>
  );
}
