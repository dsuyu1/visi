import { SlideReveal } from "@/components/SlideReveal";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ButtonLink } from "@/components/ButtonLink";
import { EVENTS } from "@/lib/content";
import { formatDate, isoDateInCentral } from "@/lib/format";

export const revalidate = 3600;

export default function EventsPage() {
  const today = isoDateInCentral();
  const upcoming = EVENTS
    .filter((e) => !e.date || e.date >= today)
    .sort((a, b) => {
      const aKey = a.date ?? "9999-12-31";
      const bKey = b.date ?? "9999-12-31";
      const cmp = aKey.localeCompare(bKey);
      return cmp !== 0 ? cmp : a.title.localeCompare(b.title);
    });
  const previous = EVENTS
    .filter((e) => !!e.date && e.date < today)
    .sort((a, b) => b.date!.localeCompare(a.date!));

  return (
    <div className="flex flex-col">
      <div className="mx-auto w-full max-w-7xl px-6 pb-16 pt-20 text-center">

      {/* --- Hero ---------------------------------------------------------- */}
      <h1 className="font-bold leading-[1.05] tracking-tight"
          style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)" }}>
        <span className="block">
          <SlideReveal delay={80}>Join the</SlideReveal>
        </span>
        <span className="block">
          <SlideReveal delay={280}>initiative.</SlideReveal>
        </span>
      </h1>

      <ScrollReveal delay={200} className="mt-8 mx-auto max-w-xl">
        <p className="text-base text-muted">
          Bring your best questions, ideas, and energy. We host workshops, student sessions, and community events to build skills and connect people. All times are in CST.
        </p>
      </ScrollReveal>
      </div>

      {/* --- Event list ---------------------------------------------------- */}
      <div className="border-t border-border text-left">
        <div className="mx-auto w-full max-w-7xl px-6 pt-14">
          <ScrollReveal>
            <h2 className="text-sm font-medium tracking-widest text-muted-light uppercase font-sans">
              Upcoming
            </h2>
          </ScrollReveal>
        </div>

        {upcoming.length > 0 ? (
          upcoming.map((e, i) => (
            <ScrollReveal
              key={`up-${e.title}-${e.date ?? e.dateLabel ?? "tbd"}`}
              delay={i * 90}
              className="work-item group"
            >
              <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 md:flex-row md:items-start md:justify-between md:gap-16">
                <div className="flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="indicator-bar" />
                    <span className="work-num">
                      {(e.date ? formatDate(e.date) : e.dateLabel ?? "TBD")}
                      {e.time && e.time !== "TBD" ? ` · ${e.time}` : ""}
                      {` · ${e.location}`}
                    </span>
                    {e.logoSrc ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={e.logoSrc}
                        alt={e.logoAlt ?? ""}
                        className="ml-auto h-6 w-auto opacity-80"
                      />
                    ) : null}
                  </div>
                  <h3 className="mb-3 text-xl font-semibold tracking-tight">{e.title}</h3>
                  <p className="text-sm text-muted whitespace-pre-line" style={{ fontWeight: 300 }}>
                    {e.details ?? e.description}
                  </p>
                </div>
                <div className="shrink-0 flex items-start gap-6 self-start md:pt-1">
                  {e.imageSrc ? (
                    <div className="w-28 sm:w-32">
                      <div className="rounded-xl border border-border bg-panel p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={e.imageSrc}
                          alt={e.imageAlt ?? ""}
                          className="block w-full h-auto"
                        />
                      </div>
                    </div>
                  ) : null}
                  <div className="pt-1 text-xs font-medium tracking-widest text-muted-light uppercase font-sans">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))
        ) : (
          <div className="mx-auto max-w-7xl px-6 py-10">
            <p className="text-sm text-muted">No upcoming events scheduled yet.</p>
          </div>
        )}

        <div className="border-t border-border">
          <div className="mx-auto w-full max-w-7xl px-6 pt-14">
            <ScrollReveal>
              <h2 className="text-sm font-medium tracking-widest text-muted-light uppercase font-sans">
                Previous
              </h2>
            </ScrollReveal>
          </div>

          {previous.length > 0 ? (
            previous.map((e, i) => (
              <ScrollReveal
                key={`prev-${e.title}-${e.date ?? e.dateLabel ?? "tbd"}`}
                delay={i * 90}
                className="work-item group"
              >
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 md:flex-row md:items-start md:justify-between md:gap-16">
                  <div className="flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                      <span className="indicator-bar" />
                      <span className="work-num">
                        {(e.date ? formatDate(e.date) : e.dateLabel ?? "TBD")}
                        {e.time && e.time !== "TBD" ? ` · ${e.time}` : ""}
                        {` · ${e.location}`}
                      </span>
                      {e.logoSrc ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={e.logoSrc}
                          alt={e.logoAlt ?? ""}
                          className="ml-auto h-6 w-auto opacity-80"
                        />
                      ) : null}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold tracking-tight">{e.title}</h3>
                    <p className="text-sm text-muted whitespace-pre-line" style={{ fontWeight: 300 }}>
                      {e.details ?? e.description}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-start gap-6 self-start md:pt-1">
                    {e.imageSrc ? (
                      <div className="w-28 sm:w-32">
                        <div className="rounded-xl border border-border bg-panel p-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={e.imageSrc}
                            alt={e.imageAlt ?? ""}
                            className="block w-full h-auto"
                          />
                        </div>
                      </div>
                    ) : null}
                    <div className="pt-1 text-xs font-medium tracking-widest text-muted-light uppercase font-sans">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))
          ) : (
            <div className="mx-auto max-w-7xl px-6 py-10">
              <p className="text-sm text-muted">No past events yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- Host CTA ------------------------------------------------------ */}
      <div className="mx-auto w-full max-w-7xl px-6 pb-32 pt-20">
        <ScrollReveal>
          <div
            className="border border-border bg-panel p-10 text-center md:p-14"
            style={{ boxShadow: "var(--shadow)" }}
          >
            <h2 className="mb-3 text-2xl font-semibold tracking-tight">
              Want to host an event-
            </h2>
            <p className="mb-8 mx-auto max-w-lg text-sm text-muted">
              Reach out for workshops, student sessions, or joint build nights. We&apos;re happy to
              co-organise.
            </p>
            <div className="flex justify-center">
              <ButtonLink href="/contact-topic=events">Contact us</ButtonLink>
            </div>
          </div>
        </ScrollReveal>
      </div>

    </div>
  );
}
