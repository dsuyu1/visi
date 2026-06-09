import Link from "next/link";

import { ScrollReveal } from "@/components/ScrollReveal";
import { SlideReveal } from "@/components/SlideReveal";
import { getAcademyIndex } from "@/lib/academy/content";

export default async function LibraryAcademyPage() {
  const index = await getAcademyIndex();

  return (
    <div className="mx-auto w-full max-w-7xl px-6 pb-24 pt-20">
      <div className="text-center">
        <h1
          className="font-bold leading-[1.05] tracking-tight"
          style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)" }}
        >
          <SlideReveal delay={80}>VISI Academy</SlideReveal>
        </h1>

        <ScrollReveal delay={160} className="mt-6 mx-auto max-w-2xl">
          <p className="text-base leading-[1.9] text-muted" style={{ fontWeight: 300 }}>
            Certification prep built like a course: modules, units, practice questions, and progress tracking.
          </p>
        </ScrollReveal>
      </div>

      <div className="mt-16 grid gap-6 text-left sm:grid-cols-2">
        {index.certifications.map((c, i) => (
          <ScrollReveal key={c.id} delay={i * 80}>
            <Link
              href={`/library/academy/certifications/${c.id}`}
              className="group block border border-border bg-panel p-8 transition-colors hover:bg-panel-hover"
              style={{ boxShadow: "var(--shadow)" }}
            >
              <h2 className="mt-3 text-lg font-semibold tracking-tight group-hover:underline">
                {c.title}
              </h2>
              <p className="mt-2 text-sm leading-[1.9] text-muted" style={{ fontWeight: 300 }}>
                {c.description}
              </p>
              <p className="work-arrow mt-6 text-sm font-medium text-foreground">
                start <span aria-hidden>→</span>
              </p>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
