import Link from "next/link";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SlideReveal } from "@/components/SlideReveal";

const sections = [
  {
    href: "/blog",
    label: "Blog",
    description: "Research posts, explainers, and perspectives from our members.",
  },
  {
    href: "/library/resources",
    label: "Resources",
    description: "Study notes, decks, references, and links we use.",
  },
  {
    href: "/library/videos",
    label: "Videos",
    description: "Workshop recordings, walkthroughs, and lab sessions. Coming soon.",
  },
];

export default function LibraryPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 pb-24 pt-20 text-center">

      <h1 className="font-bold leading-[1.05] tracking-tight"
          style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)" }}>
        <span className="block"><SlideReveal delay={80}>Welcome to</SlideReveal></span>
        <span className="block"><SlideReveal delay={240}>the Library.</SlideReveal></span>
      </h1>

      <ScrollReveal delay={200} className="mt-6 mx-auto max-w-xl">
        <p className="text-base leading-[1.9] text-muted" style={{ fontWeight: 300 }}>
          Our repository of learnings. A collection of everything we think you might find useful.
        </p>
      </ScrollReveal>

      {/* Section cards */}
      <div className="mt-16 grid gap-6 text-left sm:grid-cols-2">
        {sections.map((s, i) => (
          <ScrollReveal key={s.href} delay={i * 80}>
            <Link href={s.href}
              className="group block border border-border bg-panel p-8 transition-colors hover:bg-panel-hover"
              style={{ boxShadow: "var(--shadow)" }}>
              <h2 className="mb-2 text-lg font-semibold tracking-tight group-hover:underline">
                {s.label}
              </h2>
              <p className="text-sm leading-[1.9] text-muted" style={{ fontWeight: 300 }}>
                {s.description}
              </p>
              <p className="work-arrow mt-6 text-sm font-medium text-foreground">
                browse <span>→</span>
              </p>
            </Link>
          </ScrollReveal>
        ))}
      </div>

    </div>
  );
}
