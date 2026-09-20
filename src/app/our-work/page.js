import { format, parseISO } from "date-fns";
import PageHeader from "@/src/components/Elements/PageHeader";
import Section from "@/src/components/Elements/Section";
import { WORK_ITEMS } from "@/src/utils/siteContent";

export const metadata = {
  title: "Our work",
  description:
    "Projects, reports, and other work produced by the Vaquero Information Security Initiative.",
};

export default function OurWorkPage() {
  return (
    <main className="w-full flex flex-col items-center justify-center">
      <PageHeader title="What we&rsquo;ve built">
        Projects, reports, and other deliverables. Everything here is open for review — cite it,
        build on it, or tell us if we got something wrong.
      </PageHeader>

      <Section shaded>
        <ul className="flex flex-col gap-12">
          {WORK_ITEMS.map((item) => (
            <li key={item.slug}>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-block rounded-full border-2 border-solid border-dark dark:border-light px-4 py-1 text-xs font-semibold capitalize">
                  {item.category}
                </span>
                <span className="uppercase text-accent dark:text-accentDark font-semibold text-xs sm:text-sm">
                  {format(parseISO(item.date), "MMMM yyyy")}
                </span>
                {item.status === "active" ? (
                  <span className="font-in text-xs text-gray dark:text-light/60">Ongoing</span>
                ) : null}
              </div>

              <h2 className="font-semibold text-xl sm:text-2xl mt-3">{item.title}</h2>
              <p className="font-in text-base mt-2 max-w-3xl">{item.description}</p>

              <ul className="flex flex-wrap gap-2 mt-4">
                {item.tags.map((tag) => (
                  <li
                    key={tag}
                    className="font-in text-xs sm:text-sm rounded-full bg-dark/5 dark:bg-light/10 px-3 py-1"
                  >
                    {tag}
                  </li>
                ))}
              </ul>

              {item.links?.length ? (
                <div className="flex flex-wrap gap-4 mt-5">
                  {item.links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-accent dark:text-accentDark underline underline-offset-2"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </Section>
    </main>
  );
}
