import PageHeader from "@/src/components/Elements/PageHeader";
import Section from "@/src/components/Elements/Section";
import { RESOURCES } from "@/src/utils/siteContent";

export const metadata = {
  title: "Resources",
  description:
    "Notes, decks, and references shared by the Vaquero Information Security Initiative.",
};

export default function ResourcesPage() {
  return (
    <main className="w-full flex flex-col items-center justify-center">
      <PageHeader title="Resources">
        Notes, decks, references, and anything else worth passing along.
      </PageHeader>

      <Section shaded>
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {RESOURCES.map((resource) => (
            <li
              key={resource.id}
              className="flex flex-col rounded-xl border-2 border-solid border-dark dark:border-light p-6"
            >
              <h2 className="font-semibold text-lg sm:text-xl">{resource.title}</h2>
              <p className="font-in text-base mt-2 grow">{resource.description}</p>
              <a
                href={resource.href}
                {...(resource.download
                  ? { download: true }
                  : { target: "_blank", rel: "noopener noreferrer" })}
                className="inline-block mt-5 w-fit font-medium capitalize py-2 px-5 border-2 border-solid border-dark dark:border-light rounded hover:bg-dark hover:text-light dark:hover:bg-light dark:hover:text-dark transition-all ease duration-200"
              >
                {resource.ctaLabel}
              </a>
            </li>
          ))}
        </ul>
      </Section>
    </main>
  );
}
