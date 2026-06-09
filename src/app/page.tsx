import Link from "next/link";
import { SlideReveal } from "@/components/SlideReveal";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ButtonLink } from "@/components/ButtonLink";
import { HeroBackground } from "@/components/HeroBackground";
import { Orange } from "@/components/TextFormat";
import { ThreatTrendGraph } from "@/components/ThreatTrendGraph";
import { ScrollDownCue } from "@/components/ScrollDownCue";
import { BLOG_POSTS, EVENTS, PARTNERS } from "@/lib/content";
import { formatDate, isoDateInCentral } from "@/lib/format";

const HOME_PHOTOS = [
  {
    src: "/home/vuln-workshop.jpg",
    alt: "Vulnerability Management Workshop at VISI",
  },
  {
    src: "/home/group-photo.jpg",
    alt: "VISI first general meeting group photo",
  },
] as const;

export default function Home() {
  const today = isoDateInCentral();
  const featuredEvents = [...EVENTS]
    .filter((e) => !e.date || e.date >= today)
    .sort((a, b) => {
      const aKey = a.date ?? "9999-12-31";
      const bKey = b.date ?? "9999-12-31";
      const cmp = aKey.localeCompare(bKey);
      return cmp !== 0 ? cmp : a.title.localeCompare(b.title);
    })
    .slice(0, 2);

  return (
    <div className="relative">

      {/* --- HERO ----------------------------------------------------------- */}
      <section className="home-hero sticky top-[88px] z-0 relative flex h-[calc(100svh-88px)] flex-col justify-center overflow-hidden bg-background">
        <HeroBackground />

        {/* Solid mask behind the left text column (keeps 3D clear on the right) */}
        <div
          aria-hidden
          className="home-hero-mask pointer-events-none absolute inset-y-0 left-0 w-[62%] bg-background"
        />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-24 pt-20 md:pt-28">
          <div className="max-w-2xl md:ml-10 lg:ml-14">
            <h1
              className="font-bold leading-[1.05] tracking-tight text-foreground"
              style={{ fontSize: "clamp(2.8rem, 8vw, 5.5rem)" }}
            >
              <span className="block">
                <SlideReveal delay={80}>We push progress</SlideReveal>
              </span>
              <span className="block">
                <SlideReveal delay={280}>
                  in <Orange>cybersecurity.</Orange>
                </SlideReveal>
              </span>
            </h1>

            <p className="mt-6 block overflow-hidden">
              <SlideReveal delay={480} className="text-lg font-light text-muted">
                We provide students and curious minds with the resources, projects, and mentorship to close the gap in cybersecurity. Based in the Rio Grande Valley, we’re building a community for students to explore, experiment, and educate others.
              </SlideReveal>
            </p>

            <ScrollReveal delay={200} className="mt-8 max-w-xl">
              <div className="mt-8 flex flex-wrap gap-4">
                <ButtonLink href="/about">Learn more</ButtonLink>
              </div>
            </ScrollReveal>
          </div>
        </div>
        <ScrollDownCue targetId="home-content" />
      </section>

      {/* --- PHOTO STRIP + MISSION ------------------------------------------ */}
      <div
        id="home-content"
        className="relative z-10"
        style={{
          background: "linear-gradient(to bottom, transparent 0px, var(--background) 240px)",
        }}
      >
      <section>
        {/* Photo panels */}
        <div className="mx-auto max-w-7xl px-6 pt-12">
          <div className="flex flex-wrap items-center justify-center gap-10">
            {HOME_PHOTOS.map((p) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={p.src}
                src={p.src}
                alt={p.alt}
                loading="lazy"
                className="block h-[340px] w-auto max-w-full rounded-xl object-contain object-center sm:h-[420px] md:h-[480px]"
              />
            ))}
          </div>
        </div>

        {/* Abridged mission + approach */}
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-16 md:grid-cols-2">

            {/* Mission */}
            <div>
              <p className="mb-5 text-xs font-medium tracking-widest text-muted-light uppercase font-sans">
                Our Mission
              </p>
              <p
                className="font-semibold leading-tight tracking-tight text-foreground"
                style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)" }}
              >
                Prepare the next generations of cybersecurity talent through <Orange>research</Orange>, <Orange>projects</Orange>, and <Orange>mentorship</Orange>.
              </p>
              <Link
                href="/about"
                className="work-arrow mt-8 inline-flex items-center text-sm font-medium text-foreground"
              >
                full story <span>→</span>
              </Link>
            </div>

            {/* Approach pillars */}
            <div>
              <p className="mb-5 text-xs font-medium tracking-widest text-muted-light uppercase font-sans">
                Our Approach
              </p>
              <div className="space-y-6">
                {[
                  { n: "01", title: "Research", body: "Conduct investigations into the current threat landscape and provide meaningful insights to the greater cybersecurity community." },
                  { n: "02", title: "Build",    body: "Ship professional-grade projects across the different domains of cybersecurity." },
                  { n: "03", title: "Mentor",   body: "Grow students from enthusiasts to professionals and from professionals to leaders in the field." },
                ].map((item) => (
                  <div key={item.title} className="flex gap-5">
                    <span className="mt-0.5 text-xs text-muted-light">{item.n}</span>
                    <div>
                      <p className="text-sm font-semibold tracking-tight">{item.title}</p>
                      <p className="mt-1 text-sm leading-[1.8] text-muted" style={{ fontWeight: 300 }}>
                        {item.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- THREAT TREND -------------------------------------------------- */}
      <section aria-labelledby="threat-trend-title" className="pb-20">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal>
            <div
              className="grid gap-10 md:grid-cols-2 md:items-center"
            >
              <div>
                <h2
                  id="threat-trend-title"
                  className="font-semibold leading-tight tracking-tight text-foreground"
                  style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)" }}
                >
                  Cybercrime losses are scaling fast. We train builders to keep pace.
                </h2>
                <p className="mt-4 text-sm leading-[1.9] text-muted" style={{ fontWeight: 300 }}>
                  From ransomware to supply-chain compromise, attackers iterate quickly and share tooling. Our mission is
                  to help students and the community prepare, respond, and recover.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <ButtonLink href="/events">Get involved</ButtonLink>
                  <ButtonLink href="/our-work" variant="secondary">
                    Explore our work
                  </ButtonLink>
                </div>

                <p className="mt-6 text-xs text-muted-light">
                  FBI IC3 reported losses rising from $4.2B (2020) to $20.877B (2025).
                </p>
              </div>

              <ThreatTrendGraph />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* --- /01 RECENT WRITING -------------------------------------------- */}
      <section className="bg-panel">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <ScrollReveal>
            <h2 className="font-semibold tracking-tight"
                style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)" }}>
              Events
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted" style={{ fontWeight: 300 }}>
              We host a variety of events, from open project nights to workshops and non-cyber specific events, all aimed at growing the cybersecurity community in the RGV.
            </p>
          </ScrollReveal>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {featuredEvents.map((e, i) => (
              <ScrollReveal key={e.title} delay={i * 100}>
                <div className="border border-border bg-background p-7" style={{ boxShadow: "var(--shadow)" }}>
                  <p className="mb-2 text-xs font-medium tracking-widest text-muted-light uppercase font-sans">
                    {(e.date ? formatDate(e.date) : e.dateLabel ?? "TBD")}
                    {e.time && e.time !== "TBD" ? ` · ${e.time}` : ""}
                    {` · ${e.location}`}
                  </p>
                  <h3 className="mb-3 text-lg font-semibold tracking-tight">{e.title}</h3>
                  <p className="text-sm leading-[1.9] text-muted" style={{ fontWeight: 300 }}>
                    {e.description}
                  </p>
                  {e.imageSrc ? (
                    <div className="mt-6 rounded-xl border border-border bg-panel p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={e.imageSrc}
                        alt={e.imageAlt ?? ""}
                        className="block w-full h-auto"
                      />
                    </div>
                  ) : null}
                  {e.logoSrc ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={e.logoSrc}
                      alt={e.logoAlt ?? ""}
                      className="mt-5 h-8 w-auto opacity-80"
                    />
                  ) : null}
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal className="mt-10">
            <Link href="/events"
              className="work-arrow inline-flex items-center text-sm font-medium text-foreground">
              view all events <span>→</span>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-6 pb-4 pt-20">
          <ScrollReveal>
              <h2 className="font-semibold tracking-tight"
                  style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)" }}>
              Latest news
            </h2>
          </ScrollReveal>
        </div>

{/* Full-width work items: hover background spans edge-to-edge */}
        <div className="mt-8">
          {BLOG_POSTS.length === 0 ? (
            <div className="mx-auto max-w-7xl px-6 py-12">
              <ScrollReveal>
                <div
                  className="border border-border bg-panel p-10 text-center md:p-14"
                  style={{ boxShadow: "var(--shadow)" }}
                >
                  <h3 className="mb-3 text-2xl font-semibold tracking-tight">No writing yet.</h3>
                  <p className="mx-auto max-w-xl text-sm leading-[1.9] text-muted" style={{ fontWeight: 300 }}>
                    We&apos;ll publish research notes, project write-ups, and guides as we ship. Check back soon.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          ) : (
            BLOG_POSTS.map((post, i) => (
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
                    <span className="work-num">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {post.tags.map((t) => (
                      <span key={t}
                        className="rounded-full border border-border px-2.5 py-0.5 text-[11px] font-medium text-muted">
                        {t}
                      </span>
                    ))}
                  </div>
                  <h3 className="mb-2 text-xl font-semibold tracking-tight leading-snug">
                    {post.title}
                  </h3>
                  <p className="mb-5 max-w-lg text-sm leading-[1.9] text-muted" style={{ fontWeight: 300 }}>
                    {post.excerpt}
                  </p>
                  <span className="work-arrow text-sm font-medium text-foreground">
                    Read article <span>→</span>
                  </span>
                </div>

{/* Right: date */}
                <div className="shrink-0 text-right">
                  <p className="text-xs text-muted-light">{formatDate(post.date)}</p>
                </div>
              </div>
            </Link>
            ))
          )}
        </div>

        <div className="mx-auto max-w-7xl px-6 pb-20 pt-10">
          <ScrollReveal>
            <Link href="/blog"
              className="work-arrow inline-flex items-center text-sm font-medium text-foreground">
              more writing <span>→</span>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* --- /02 EVENTS ---------------------------------------------------- */}
      {false && (
      <section className="bg-panel">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <ScrollReveal>
            <h2 className="font-semibold tracking-tight"
                style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)" }}>
              Events
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted" style={{ fontWeight: 300 }}>
              We host a variety of events, from open project nights to workshops and non-cyber specific events, all aimed at growing the cybersecurity community in the RGV.
            </p>
          </ScrollReveal>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {featuredEvents.map((e, i) => (
              <ScrollReveal key={e.title} delay={i * 100}>
                <div className="border border-border bg-background p-7" style={{ boxShadow: "var(--shadow)" }}>
                  <p className="mb-2 text-xs font-medium tracking-widest text-muted-light uppercase font-sans">
                    {(e.date ? formatDate(e.date) : e.dateLabel ?? "TBD")}
                    {e.time && e.time !== "TBD" ? ` · ${e.time}` : ""}
                    {` · ${e.location}`}
                  </p>
                  <h3 className="mb-3 text-lg font-semibold tracking-tight">{e.title}</h3>
                  <p className="text-sm leading-[1.9] text-muted" style={{ fontWeight: 300 }}>
                    {e.description}
                  </p>
                  {e.imageSrc ? (
                    <div className="mt-6 rounded-xl border border-border bg-panel p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={e.imageSrc}
                        alt={e.imageAlt ?? ""}
                        className="block w-full h-auto"
                      />
                    </div>
                  ) : null}
                  {e.logoSrc ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={e.logoSrc}
                      alt={e.logoAlt ?? ""}
                      className="mt-5 h-8 w-auto opacity-80"
                    />
                  ) : null}
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal className="mt-10">
            <Link href="/events"
              className="work-arrow inline-flex items-center text-sm font-medium text-foreground">
              view all events <span>→</span>
            </Link>
          </ScrollReveal>
        </div>
      </section>
      )}

      {/* --- /03 PARTNERS -------------------------------------------------- */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-20">
          <ScrollReveal>
            <h2 className="font-semibold tracking-tight"
                style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)" }}>
              Partners
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted" style={{ fontWeight: 300 }}>
              Community partners helping grow the cybersecurity pipeline in the RGV.
            </p>
          </ScrollReveal>

          <div className="mt-12 grid gap-6 md:grid-cols-1">
            {PARTNERS.map((p, i) => (
              <ScrollReveal key={p.name} delay={i * 100}>
                <div className="border border-border bg-panel p-7" style={{ boxShadow: "var(--shadow)" }}>
                  {p.logoSrc ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={p.logoSrc}
                      alt={p.logoAlt ?? p.name}
                      className="mb-5 h-10 w-auto opacity-90"
                    />
                  ) : null}
                  <h3 className="mb-2 text-base font-semibold tracking-tight">{p.name}</h3>
                  <p className="text-sm leading-[1.9] text-muted" style={{ fontWeight: 300 }}>
                    {p.description}
                  </p>
                  {p.href ? (
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noreferrer"
                      className="work-arrow mt-6 inline-flex items-center text-sm font-medium text-foreground"
                    >
                      Visit site <span>→</span>
                    </a>
                  ) : null}
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal className="mt-10">
            <Link href="/partners"
              className="work-arrow inline-flex items-center text-sm font-medium text-foreground">
              partner details <span>→</span>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      </div>

    </div>
  );
}
