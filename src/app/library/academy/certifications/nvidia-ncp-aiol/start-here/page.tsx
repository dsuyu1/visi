import Link from "next/link";
import { notFound } from "next/navigation";

import { ScrollReveal } from "@/components/ScrollReveal";
import { SlideReveal } from "@/components/SlideReveal";
import { AcademyBreadcrumbs } from "@/components/academy/AcademyBreadcrumbs";
import { AcademyMarkdown } from "@/components/academy/AcademyMarkdown";
import { AcademyProgressBarClient } from "@/components/academy/AcademyProgressBarClient";
import { getCertification, getUnit } from "@/lib/academy/content";
import type { AcademyModule } from "@/lib/academy/types";

function stripTopHeading(markdown: string) {
  const normalized = markdown.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");
  if (lines[0]?.startsWith("# ")) {
    return lines.slice(1).join("\n").replace(/^\n+/, "");
  }
  return markdown;
}

type ResolvedUnit = {
  id: string;
  title: string;
  href: string;
  markdown: string;
};

type UnitsByModule = {
  module: AcademyModule;
  units: ResolvedUnit[];
};

export default async function NvidiaNcpAiolStartHerePage() {
  const cert = await getCertification("nvidia-ncp-aiol");
  const overview = cert.domains.find((d) => d.id === "overview");
  if (!overview) notFound();

  const unitKeys = overview.modules.flatMap((m) => m.units.map((u) => `${m.id}::${u.id}`));

  const unitsByModule: UnitsByModule[] = await Promise.all(
    overview.modules.map(async (m): Promise<UnitsByModule> => {
      const units: Array<ResolvedUnit | null> = await Promise.all(
        m.units.map(async (u): Promise<ResolvedUnit | null> => {
          const data = await getUnit(cert.id, m.id, u.id);
          if (!data) return null;
          return {
            id: u.id,
            title: u.title,
            href: `/library/academy/certifications/${cert.id}/modules/${m.id}/units/${u.id}`,
            markdown: stripTopHeading(data.markdown),
          };
        }),
      );

      const resolvedUnits: ResolvedUnit[] = units.filter((u): u is ResolvedUnit => u !== null);
      return { module: m, units: resolvedUnits };
    }),
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-6 pb-24 pt-16">
      <AcademyBreadcrumbs
        items={[
          { href: "/library/academy", label: "Academy" },
          { href: `/library/academy/certifications/${cert.id}`, label: cert.code ?? cert.id },
          { href: `/library/academy/certifications/${cert.id}/start-here`, label: "Start here" },
        ]}
      />

      <div className="mt-8">
        <h1 className="font-bold leading-[1.05] tracking-tight" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)" }}>
          <SlideReveal delay={80}>Start here</SlideReveal>
        </h1>

        <ScrollReveal delay={160} className="mt-4 max-w-3xl">
          <p className="text-base leading-[1.9] text-muted" style={{ fontWeight: 300 }}>
            Course overview, recommended study loop, and a skills checklist to sanity-check your readiness.
          </p>
        </ScrollReveal>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <ScrollReveal>
          <div className="border border-border bg-panel p-8" style={{ boxShadow: "var(--shadow)" }}>
            <p className="text-xs font-medium tracking-widest text-muted-light uppercase font-sans">
              On this page
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {unitsByModule.map(({ module, units }) => (
                <li key={module.id}>
                  <Link
                    href={`/library/academy/certifications/${cert.id}/modules/${module.id}`}
                    className="work-arrow inline-flex items-center font-medium text-foreground"
                  >
                    {module.title} <span aria-hidden>→</span>
                  </Link>
                  {units.length ? (
                    <ul className="mt-2 space-y-1 pl-4 text-xs text-muted-light">
                      {units.map((u) => (
                        <li key={`${module.id}::${u.id}`}>
                          <Link href={u.href} className="hover:text-foreground">
                            {u.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>

            <div className="mt-8 border-t border-border pt-6">
              <p className="text-xs font-medium tracking-widest text-muted-light uppercase font-sans">
                Overview progress
              </p>
              <AcademyProgressBarClient certId={cert.id} unitKeys={unitKeys} compact />
              <p className="mt-4 text-xs text-muted-light">
                Use the <span className="font-semibold">Completed</span> checkbox inside each unit’s tools to track
                progress.
              </p>
            </div>

            <div className="mt-8 border-t border-border pt-6">
              <Link
                href={`/library/academy/certifications/${cert.id}`}
                className="work-arrow inline-flex items-center text-sm font-medium text-foreground"
              >
                <span aria-hidden>←</span> Back to certification
              </Link>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={120}>
          <div className="border border-border bg-panel p-8" style={{ boxShadow: "var(--shadow)" }}>
            <p className="text-xs font-medium tracking-widest text-muted-light uppercase font-sans">
              Tip
            </p>
            <p className="mt-3 text-sm leading-[1.9] text-muted" style={{ fontWeight: 300 }}>
              Open a unit link and track completion as you study.
            </p>
          </div>
        </ScrollReveal>
      </div>

      <div className="mt-12 space-y-10">
        {unitsByModule.map(({ module, units }, idx) => (
          <section key={module.id} id={module.id}>
            <ScrollReveal delay={idx * 60}>
              <div className="border border-border bg-background p-8" style={{ boxShadow: "var(--shadow)" }}>
                <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-medium tracking-widest text-muted-light uppercase font-sans">
                      Start here
                    </p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight leading-snug">
                      {module.title}
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-[1.9] text-muted" style={{ fontWeight: 300 }}>
                      {module.description}
                    </p>
                  </div>
                </div>

                <div className="mt-8 space-y-10">
                  {units.map((u) => (
                    <div key={`${module.id}::${u.id}`} id={`${module.id}--${u.id}`}>
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <h3 className="text-base font-semibold tracking-tight leading-snug">
                          {u.title}
                        </h3>
                        <Link
                          href={u.href}
                          className="btn-slide btn-primary inline-flex items-center justify-center px-5 py-2.5 text-xs font-medium tracking-wide font-sans"
                        >
                          Open unit
                        </Link>
                      </div>

                      <div className="mt-4">
                        <AcademyMarkdown markdown={u.markdown} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </section>
        ))}
      </div>
    </div>
  );
}
