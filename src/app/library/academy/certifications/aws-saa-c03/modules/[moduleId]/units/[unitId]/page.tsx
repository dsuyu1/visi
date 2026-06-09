import Link from "next/link";
import { notFound } from "next/navigation";

import { ScrollReveal } from "@/components/ScrollReveal";
import { AcademyBreadcrumbs } from "@/components/academy/AcademyBreadcrumbs";
import { AcademyMarkdown } from "@/components/academy/AcademyMarkdown";
import { StudyToolsClient } from "@/components/academy/StudyToolsClient";
import { getCertification, getUnit } from "@/lib/academy/content";

function moduleHref(certId: string, moduleId: string) {
  return `/library/academy/certifications/${certId}/modules/${moduleId}`;
}

export async function generateStaticParams() {
  const cert = await getCertification("aws-saa-c03");
  const params: { moduleId: string; unitId: string }[] = [];
  for (const domain of cert.domains) {
    for (const m of domain.modules) {
      for (const u of m.units) params.push({ moduleId: m.id, unitId: u.id });
    }
  }
  return params;
}

export default async function AwsSaaC03UnitPage({
  params,
}: {
  params: Promise<{ moduleId: string; unitId: string }>;
}) {
  const { moduleId, unitId } = await params;
  const cert = await getCertification("aws-saa-c03");
  const data = await getUnit(cert.id, moduleId, unitId);
  if (!data) notFound();

  const { academyModule, unit, markdown, quizQuestions } = data;

  const modules = cert.domains.flatMap((d) => d.modules);
  const moduleIdx = modules.findIndex((m) => m.id === academyModule.id);
  const nextModule =
    moduleIdx >= 0 && moduleIdx < modules.length - 1 ? modules[moduleIdx + 1] : null;

  const unitIdx = academyModule.units.findIndex((u) => u.id === unit.id);
  const prev = unitIdx > 0 ? academyModule.units[unitIdx - 1] : null;
  const next =
    unitIdx >= 0 && unitIdx < academyModule.units.length - 1
      ? academyModule.units[unitIdx + 1]
      : null;
  const currentModuleHref = moduleHref(cert.id, academyModule.id);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 pb-24 pt-16">
      <AcademyBreadcrumbs
        items={[
          { href: "/library/academy", label: "Academy" },
          { href: `/library/academy/certifications/${cert.id}`, label: cert.code ?? cert.id },
          {
            href: currentModuleHref,
            label: academyModule.title,
          },
          {
            href: `/library/academy/certifications/${cert.id}/modules/${academyModule.id}/units/${unit.id}`,
            label: unit.title,
          },
        ]}
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
        <ScrollReveal>
          <div className="border border-border bg-background p-8" style={{ boxShadow: "var(--shadow)" }}>
            <AcademyMarkdown markdown={markdown} />

            <div className="mt-10 border-t border-border pt-6 flex flex-wrap gap-6">
              {prev ? (
                <Link
                  href={`/library/academy/certifications/${cert.id}/modules/${academyModule.id}/units/${prev.id}`}
                  className="work-arrow inline-flex items-center text-sm font-medium text-foreground"
                >
                  <span aria-hidden>←</span> {prev.title}
                </Link>
              ) : (
                <Link
                  href={currentModuleHref}
                  className="work-arrow inline-flex items-center text-sm font-medium text-foreground"
                >
                  <span aria-hidden>←</span> Back to module
                </Link>
              )}

              {next ? (
                <Link
                  href={`/library/academy/certifications/${cert.id}/modules/${academyModule.id}/units/${next.id}`}
                  className="work-arrow ml-auto inline-flex items-center text-sm font-medium text-foreground"
                >
                  Next: {next.title} <span aria-hidden>→</span>
                </Link>
              ) : nextModule ? (
                <Link
                  href={moduleHref(cert.id, nextModule.id)}
                  className="work-arrow ml-auto inline-flex items-center text-sm font-medium text-foreground"
                >
                  Next module: {nextModule.title} <span aria-hidden>→</span>
                </Link>
              ) : null}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={120}>
          <StudyToolsClient
            key={`${cert.id}:${academyModule.id}:${unit.id}`}
            certId={cert.id}
            moduleId={academyModule.id}
            unitId={unit.id}
            quizQuestions={quizQuestions}
          />
        </ScrollReveal>
      </div>
    </div>
  );
}
