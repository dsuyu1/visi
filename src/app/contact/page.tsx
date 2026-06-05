import { SlideReveal } from "@/components/SlideReveal";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ContactForm } from "@/components/ContactForm";
import { SITE } from "@/lib/site";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function ContactPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp: SearchParams = (await searchParams?.catch(() => ({} as SearchParams))) ?? {};
  const topicParam = sp["topic"];
  const topic = typeof topicParam === "string" ? topicParam : undefined;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 pb-32 pt-20 text-center">

      {/* --- Hero ---------------------------------------------------------- */}
      <h1 className="font-bold leading-[1.05] tracking-tight"
          style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)" }}>
        <span className="block">
          <SlideReveal delay={80}>Get in touch.</SlideReveal>
        </span>
      </h1>

      <ScrollReveal delay={200} className="mt-8 mx-auto max-w-xl">
        <p className="text-base text-muted">
          Use the form to express interest, request Discord access, or ask about partnerships
          and events.
        </p>
      </ScrollReveal>

      {/* --- Content grid -------------------------------------------------- */}
      <ScrollReveal className="mt-20 text-left">
        <div className="grid gap-0 border border-border bg-panel lg:grid-cols-3"
             style={{ boxShadow: "var(--shadow)" }}>

          {/* Form */}
          <div className="border-b border-border p-8 md:p-12 lg:col-span-2 lg:border-b-0 lg:border-r">
            <p className="field-label mb-1">Contact form</p>
            <p className="mb-8 text-sm text-muted">
              Tell us what you&apos;re working on. If you&apos;re requesting Discord access,
              include your Discord username.
            </p>
            <ContactForm defaultTopic={topic} />
          </div>

          {/* Sidebar info */}
          <div className="p-8 md:p-12">
            <p className="field-label mb-6">What to include</p>
            <ul className="space-y-3 text-sm text-muted">
              <li className="flex gap-3">
                <span className="mt-0.5 text-muted-light">—</span>
                Name &amp; email address
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 text-muted-light">—</span>
                Discord username (optional)
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 text-muted-light">—</span>
                What you want to build or learn
              </li>
            </ul>

            <div className="mt-12 border-t border-border pt-8">
              <p className="field-label mb-3">Direct email</p>
              <a
                className="text-sm text-muted hover:text-foreground transition-colors duration-200"
                href={`mailto:${SITE.contactEmail}`}
              >
                {SITE.contactEmail}
              </a>
            </div>
          </div>

        </div>
      </ScrollReveal>

    </div>
  );
}
