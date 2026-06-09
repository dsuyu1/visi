import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ScrollReveal } from "@/components/ScrollReveal";
import { SlideReveal } from "@/components/SlideReveal";
import { AcademyBreadcrumbs } from "@/components/academy/AcademyBreadcrumbs";
import { AcademyProgressBarClient } from "@/components/academy/AcademyProgressBarClient";
import { getCertification, getModule } from "@/lib/academy/content";

export async function generateStaticParams() {
  const cert = await getCertification("aws-saa-c03");
  return cert.domains.flatMap((d) => d.modules.map((m) => ({ moduleId: m.id })));
}

export default async function AwsSaaC03ModulePage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const cert = await getCertification("aws-saa-c03");
  const academyModule = await getModule(cert.id, moduleId);
  if (!academyModule) notFound();

  if (academyModule.id.startsWith("overview-")) {
    redirect(`/library/academy/certifications/${cert.id}/start-here#${academyModule.id}`);
  }

  const modules = cert.domains.flatMap((d) => d.modules);
  const moduleIdx = modules.findIndex((m) => m.id === academyModule.id);
  const nextModule =
    moduleIdx >= 0 && moduleIdx < modules.length - 1 ? modules[moduleIdx + 1] : null;

  const firstUnit = academyModule.units[0];
  if (!firstUnit) {
    redirect(`/library/academy/certifications/${cert.id}`);
  }

  const moduleUnitKeys = academyModule.units.map((u) => `${academyModule.id}::${u.id}`);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 pb-24 pt-16">
      <AcademyBreadcrumbs
        items={[
          { href: "/library/academy", label: "Academy" },
          { href: `/library/academy/certifications/${cert.id}`, label: cert.code ?? cert.id },
          {
            href: `/library/academy/certifications/${cert.id}/modules/${academyModule.id}`,
            label: academyModule.title,
          },
        ]}
      />

      <div className="mt-8">
        <h1 className="font-bold leading-[1.05] tracking-tight" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)" }}>
          <SlideReveal delay={80}>{academyModule.title}</SlideReveal>
        </h1>

        <ScrollReveal delay={160} className="mt-4 max-w-3xl">
          <p className="text-base leading-[1.9] text-muted" style={{ fontWeight: 300 }}>
            {academyModule.description}
          </p>
        </ScrollReveal>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_320px]">
        <ScrollReveal>
          <div className="border border-border bg-panel p-8" style={{ boxShadow: "var(--shadow)" }}>
            <p className="text-xs font-medium tracking-widest text-muted-light uppercase font-sans">
              Units
            </p>
            <ul className="mt-4 space-y-3">
              {academyModule.units.map((u) => (
                <li key={u.id}>
                    <Link
                    href={`/library/academy/certifications/${cert.id}/modules/${academyModule.id}/units/${u.id}`}
                    className="work-arrow inline-flex items-center text-sm font-medium text-foreground"
                  >
                    {u.title} <span aria-hidden>→</span>
                  </Link>
                  {u.estimatedMinutes ? (
                    <p className="mt-1 text-xs text-muted-light">
                      ~{u.estimatedMinutes} min
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>

            <div className="mt-8 border-t border-border pt-6">
              <Link
                href={`/library/academy/certifications/${cert.id}/modules/${academyModule.id}/units/${firstUnit.id}`}
                className="btn-slide btn-primary inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-medium tracking-wide font-sans"
              >
                Start module <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={120}>
          <div className="border border-border bg-panel p-8" style={{ boxShadow: "var(--shadow)" }}>
            <p className="text-xs font-medium tracking-widest text-muted-light uppercase font-sans">
              How to use this
            </p>
            <p className="mt-3 text-sm leading-[1.9] text-muted" style={{ fontWeight: 300 }}>
              Open a unit, take notes, and mark it complete when you’re ready to move on.
            </p>

            <div className="mt-6 border-t border-border pt-6">
              <p className="text-xs font-medium tracking-widest text-muted-light uppercase font-sans">
                Module progress
              </p>
              <AcademyProgressBarClient certId={cert.id} unitKeys={moduleUnitKeys} compact />
            </div>

            <p className="mt-6 text-xs text-muted-light">
              For now, your notes and progress are saved only on this device.
            </p>
          </div>
        </ScrollReveal>
      </div>

      <div className="mt-10 border-t border-border pt-6 flex flex-wrap gap-6">
        <Link
          href={`/library/academy/certifications/${cert.id}`}
          className="work-arrow inline-flex items-center text-sm font-medium text-foreground"
        >
          <span aria-hidden>←</span> Back to modules
        </Link>

        {nextModule ? (
          <Link
            href={`/library/academy/certifications/${cert.id}/modules/${nextModule.id}`}
            className="work-arrow ml-auto inline-flex items-center text-sm font-medium text-foreground"
          >
            Next module: {nextModule.title} <span aria-hidden>→</span>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
