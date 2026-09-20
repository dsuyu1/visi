import Image from "next/image";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { EVENTS } from "@/src/utils/siteContent";

const EventsPreview = () => {
  const today = new Date().toISOString().slice(0, 10);

  const upcoming = EVENTS.filter((event) => !event.date || event.date >= today).sort((a, b) =>
    (a.date || "9999-12-31").localeCompare(b.date || "9999-12-31")
  );
  const past = EVENTS.filter((event) => event.date && event.date < today).sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  const showUpcoming = upcoming.length > 0;
  const events = (showUpcoming ? upcoming : past).slice(0, 3);

  if (events.length === 0) return null;

  return (
    <section className="w-full mt-16 sm:mt-24 md:mt-32 py-12 sm:py-16 px-5 sm:px-10 md:px-24 sxl:px-32 bg-surface dark:bg-surfaceDark text-dark dark:text-light">
      <div className="w-full flex justify-between items-center">
        <h2 className="w-fit inline-block font-bold text-2xl md:text-4xl">
          {showUpcoming ? "Upcoming events" : "Recent events"}
        </h2>
        <Link
          href="/events"
          className="inline-block font-medium text-accent dark:text-accentDark underline underline-offset-2 text-base md:text-lg"
        >
          view all
        </Link>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mt-10">
        {events.map((event) => (
          <li key={`${event.title}-${event.date}`} className="flex flex-col">
            {event.imageSrc ? (
              <Link
                href="/events"
                className="relative aspect-[4/3] rounded-xl overflow-hidden bg-dark/5 dark:bg-light/10"
              >
                <Image
                  src={event.imageSrc}
                  alt={event.imageAlt || event.title}
                  fill
                  className="object-contain object-center p-2"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </Link>
            ) : null}
            <span className="uppercase text-accent dark:text-accentDark font-semibold text-xs sm:text-sm mt-4">
              {event.date ? format(parseISO(event.date), "MMMM d, yyyy") : event.dateLabel}
            </span>
            <h3 className="font-semibold text-base sm:text-lg mt-1">{event.title}</h3>
            <p className="font-in text-sm text-gray dark:text-light/60 mt-1">{event.location}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default EventsPreview;
