import Image from "next/image";
import { format, parseISO } from "date-fns";
import PageHeader from "@/src/components/Elements/PageHeader";
import Section from "@/src/components/Elements/Section";
import { EVENTS } from "@/src/utils/siteContent";
import siteMetadata from "@/src/utils/siteMetaData";

export const metadata = {
  title: "Events",
  description:
    "Workshops, student sessions, and community events hosted by the Vaquero Information Security Initiative at UTRGV.",
};

export const revalidate = 3600;

const EventCard = ({ event }) => {
  return (
    <article className="grid grid-cols-12 gap-4 sm:gap-8 items-start">
      {event.imageSrc ? (
        <div className="col-span-12 sm:col-span-4 lg:col-span-3 relative aspect-[4/3] rounded-xl overflow-hidden bg-dark/5 dark:bg-light/5">
          <Image
            src={event.imageSrc}
            alt={event.imageAlt || event.title}
            fill
            className="object-contain object-center p-2"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>
      ) : null}

      <div
        className={
          event.imageSrc
            ? "col-span-12 sm:col-span-8 lg:col-span-9"
            : "col-span-12"
        }
      >
        <span className="uppercase text-accent dark:text-accentDark font-semibold text-xs sm:text-sm">
          {event.date ? format(parseISO(event.date), "MMMM d, yyyy") : event.dateLabel || "Date TBD"}
        </span>
        <h3 className="font-semibold text-lg sm:text-xl mt-1">{event.title}</h3>
        <p className="font-in text-sm sm:text-base text-gray dark:text-light/60 mt-1">
          {[event.time, event.location].filter(Boolean).join(" · ")}
        </p>
        <p className="font-in text-sm sm:text-base mt-3 max-w-2xl">{event.description}</p>
        {event.speaker ? (
          <p className="font-in text-sm mt-2 text-gray dark:text-light/60">
            Speaker: {event.speaker}
          </p>
        ) : null}
        {event.details ? (
          <details className="mt-3 font-in text-sm sm:text-base max-w-2xl">
            <summary className="cursor-pointer font-semibold text-accent dark:text-accentDark">
              Details
            </summary>
            <div className="mt-2 whitespace-pre-line">{event.details}</div>
          </details>
        ) : null}
      </div>
    </article>
  );
};

export default function EventsPage() {
  const today = new Date().toISOString().slice(0, 10);

  const upcoming = EVENTS.filter((event) => !event.date || event.date >= today).sort((a, b) =>
    (a.date || "9999-12-31").localeCompare(b.date || "9999-12-31")
  );
  const past = EVENTS.filter((event) => event.date && event.date < today).sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  return (
    <main className="w-full flex flex-col items-center justify-center">
      <PageHeader title="Events and workshops">
        Bring your best questions, ideas, and energy. We host workshops, student sessions, and
        community events to build skills and connect people. All times are CST.
      </PageHeader>

      <Section shaded>
        <h2 className="font-bold text-2xl md:text-3xl">Upcoming</h2>
        {upcoming.length > 0 ? (
          <div className="mt-8 flex flex-col gap-12">
            {upcoming.map((event) => (
              <EventCard key={`${event.title}-${event.date}`} event={event} />
            ))}
          </div>
        ) : (
          <p className="mt-6 font-in text-base max-w-2xl text-gray dark:text-light/60">
            Nothing on the calendar right now. Next semester&apos;s sessions go up here first —
            follow us on{" "}
            <a
              href={siteMetadata.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 text-accent dark:text-accentDark"
            >
              Instagram
            </a>{" "}
            to hear about them as they are scheduled.
          </p>
        )}
      </Section>

      {past.length > 0 ? (
        <Section>
          <h2 className="font-bold text-2xl md:text-3xl">Past events</h2>
          <div className="mt-8 flex flex-col gap-12">
            {past.map((event) => (
              <EventCard key={`${event.title}-${event.date}`} event={event} />
            ))}
          </div>
        </Section>
      ) : null}
    </main>
  );
}
