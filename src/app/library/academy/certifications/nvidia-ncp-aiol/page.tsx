import Image from "next/image";
import Link from "next/link";

import { ScrollReveal } from "@/components/ScrollReveal";
import { SlideReveal } from "@/components/SlideReveal";
import { AcademyBreadcrumbs } from "@/components/academy/AcademyBreadcrumbs";
import { AcademyProgressBarClient } from "@/components/academy/AcademyProgressBarClient";
import { getCertification } from "@/lib/academy/content";

const NVIDIA_NCP_AIOL_BADGE_SRC = "/nvidia-ncp-aiol.png";

export default async function NvidiaNcpAiolCertificationPage() {
  const cert = await getCertification("nvidia-ncp-aiol");
  const allUnitKeys = cert.domains.flatMap((d) =>
    d.modules.flatMap((m) => m.units.map((u) => `${m.id}::${u.id}`)),
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-6 pb-24 pt-16">
      <AcademyBreadcrumbs
        items={[
          { href: "/library/academy", label: "Academy" },
          { href: `/library/academy/certifications/${cert.id}`, label: cert.code ?? cert.id },
        ]}
      />

      <div className="mt-8">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-start">
          <div>
            <h1
              className="font-bold leading-[1.05] tracking-tight"
              style={{ fontSize: "clamp(2.2rem, 5.5vw, 4rem)" }}
            >
              <SlideReveal delay={80}>{cert.title}</SlideReveal>
            </h1>

            <ScrollReveal delay={160} className="mt-4 max-w-3xl">
              <p className="text-base leading-[1.9] text-muted" style={{ fontWeight: 300 }}>
                {cert.description}
              </p>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={140} className="justify-self-start md:justify-self-end">
            <Image
              src={NVIDIA_NCP_AIOL_BADGE_SRC}
              alt="NVIDIA Certified Professional AI Operations badge"
              width={160}
              height={160}
              decoding="async"
              loading="lazy"
              unoptimized
              className="h-28 w-28 select-none object-contain md:h-40 md:w-40"
            />
          </ScrollReveal>
        </div>

        {cert.recommendedExperience?.length ? (
          <ScrollReveal delay={220} className="mt-8">
            <div className="border border-border bg-panel p-7" style={{ boxShadow: "var(--shadow)" }}>
              <p className="text-xs font-medium tracking-widest text-muted-light uppercase font-sans">
                Recommended experience
              </p>
              <ul className="mt-4 list-disc pl-5 text-sm leading-[1.9] text-muted" style={{ fontWeight: 300 }}>
                {cert.recommendedExperience.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        ) : null}
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <div>
          <ScrollReveal>
            <h2 className="text-lg font-semibold tracking-tight">Modules</h2>
            <p className="mt-2 max-w-2xl text-sm leading-[1.9] text-muted" style={{ fontWeight: 300 }}>
              Course-style structure: categories, modules, and units. Mark units complete to track your progress.
            </p>
          </ScrollReveal>

          <div className="mt-8 space-y-10">
            {cert.domains.map((domain, domainIdx) => {
              const domainUnitKeys = domain.modules.flatMap((m) =>
                m.units.map((u) => `${m.id}::${u.id}`),
              );
              const domainNumber = /^domain-(\d+)$/.exec(domain.id)?.[1];
              const domainLabel =
                domain.id === "overview"
                  ? "Overview"
                  : domainNumber
                    ? `Domain ${domainNumber}`
                    : "Category";

              return (
                <section key={domain.id}>
                  <ScrollReveal delay={domainIdx * 60}>
                    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                      <div>
                        <p className="text-xs font-medium tracking-widest text-muted-light uppercase font-sans">
                          {domainLabel}
                          {domainNumber && domain.weightPercent ? ` · ${domain.weightPercent}%` : ""}
                        </p>
                        <h3 className="mt-2 text-xl font-semibold tracking-tight leading-snug">
                          {domain.title}
                        </h3>
                      </div>

                      <div className="w-full md:w-[320px]">
                        <AcademyProgressBarClient certId={cert.id} unitKeys={domainUnitKeys} compact />
                      </div>
                    </div>
                  </ScrollReveal>

                  <div className="mt-5 grid gap-4">
                    {domain.id === "overview" ? (
                      <ScrollReveal delay={domainIdx * 60 + 40}>
                        <div className="border border-border bg-panel p-7" style={{ boxShadow: "var(--shadow)" }}>
                          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-10">
                            <div className="flex-1">
                              <h4 className="text-base font-semibold tracking-tight leading-snug">
                                Start here
                              </h4>
                              <p className="mt-2 max-w-3xl text-sm leading-[1.9] text-muted" style={{ fontWeight: 300 }}>
                                Course overview, study workflow, and readiness checklist.
                              </p>
                            </div>

                            <div className="shrink-0">
                              <p className="text-xs text-muted-light">
                                {domainUnitKeys.length} unit{domainUnitKeys.length === 1 ? "" : "s"}
                              </p>
                              <Link
                                href={`/library/academy/certifications/${cert.id}/start-here`}
                                className="btn-slide btn-primary mt-4 inline-flex items-center justify-center px-6 py-3 text-sm font-medium tracking-wide font-sans"
                              >
                                Open start here
                              </Link>
                            </div>
                          </div>
                        </div>
                      </ScrollReveal>
                    ) : (
                      domain.modules.map((m) => (
                        <div key={m.id} className="border border-border bg-panel p-7" style={{ boxShadow: "var(--shadow)" }}>
                          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-10">
                            <div className="flex-1">
                              <h4 className="text-base font-semibold tracking-tight leading-snug">
                                {m.title}
                              </h4>
                              <p className="mt-2 max-w-3xl text-sm leading-[1.9] text-muted" style={{ fontWeight: 300 }}>
                                {m.description}
                              </p>
                            </div>

                            <div className="shrink-0">
                              <p className="text-xs text-muted-light">
                                {m.units.length} unit{m.units.length === 1 ? "" : "s"}
                                {m.estimatedMinutes ? ` · ~${m.estimatedMinutes} min` : ""}
                              </p>
                              <Link
                                href={`/library/academy/certifications/${cert.id}/modules/${m.id}`}
                                className="btn-slide btn-primary mt-4 inline-flex items-center justify-center px-6 py-3 text-sm font-medium tracking-wide font-sans"
                              >
                                Open module
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        <ScrollReveal delay={240}>
          <aside className="border border-border bg-panel p-7" style={{ boxShadow: "var(--shadow)" }}>
            <p className="text-xs font-medium tracking-widest text-muted-light uppercase font-sans">
              Progress
            </p>
            <AcademyProgressBarClient certId={cert.id} unitKeys={allUnitKeys} />

            <div className="mt-8 border-t border-border pt-6">
              <p className="text-xs font-medium tracking-widest text-muted-light uppercase font-sans">
                Tip
              </p>
              <p className="mt-2 text-sm leading-[1.9] text-muted" style={{ fontWeight: 300 }}>
                Use the <span className="font-semibold">Completed</span> checkbox inside each unit to track your progress.
              </p>
            </div>
          </aside>
        </ScrollReveal>
      </div>
    </div>
  );
}
