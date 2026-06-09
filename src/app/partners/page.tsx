import { SlideReveal } from "@/components/SlideReveal";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ButtonLink } from "@/components/ButtonLink";
import { PARTNERS } from "@/lib/content";

export default function PartnersPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 pb-32 pt-20 text-center">

      {/* --- Hero ---------------------------------------------------------- */}
      <h1 className="font-bold leading-[1.05] tracking-tight"
          style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)" }}>
        <span className="block">
          <SlideReveal delay={80}>Build the future</SlideReveal>
        </span>
        <span className="block">
          <SlideReveal delay={280}>with us.</SlideReveal>
        </span>
      </h1>

      <ScrollReveal delay={200} className="mt-8 mx-auto max-w-xl">
        <p className="text-base text-muted">
          We are always open to collaboration with schools, industry, and nonprofits to create opportunities for
          students and produce meaningful work.
        </p>
      </ScrollReveal>

      {/* --- Partner list -------------------------------------------------- */}
      <div className="mt-20 text-left">
        {PARTNERS.map((p, i) => (
          <ScrollReveal
            key={p.name}
            delay={i * 80}
            className="py-10"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-16">
              <div className="flex-1">
                <div className="mb-3 flex items-center gap-4">
                  {p.logoSrc ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={p.logoSrc}
                      alt={p.logoAlt ?? p.name}
                      className="h-10 w-auto opacity-90"
                    />
                  ) : null}
                  <p className="text-xs font-medium tracking-widest text-muted-light uppercase font-sans">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                </div>
                <h2 className="mb-3 text-xl font-semibold tracking-tight">{p.name}</h2>
                <p className="max-w-lg text-sm text-muted">{p.description}</p>
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
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* --- Interested CTA ------------------------------------------------ */}
      <ScrollReveal className="mt-20">
        <div
          className="border border-border bg-panel p-10 text-center md:p-14"
          style={{ boxShadow: "var(--shadow)" }}
        >
          <h2 className="mb-3 text-2xl font-semibold tracking-tight">
            Interested in partnering?
          </h2>
          <p className="mb-8 mx-auto max-w-lg text-sm text-muted">
            Tell us what you&apos;d like to support: mentorship, sponsorship, speakers, or internships.
          </p>
          <div className="flex justify-center">
            <ButtonLink href="/contact-topic=partners">Contact us</ButtonLink>
          </div>
        </div>
      </ScrollReveal>

    </div>
  );
}
