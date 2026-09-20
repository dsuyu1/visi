import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/src/components/Elements/PageHeader";
import Section from "@/src/components/Elements/Section";
import { PARTNERS } from "@/src/utils/siteContent";

export const metadata = {
  title: "Partners",
  description:
    "Organizations the Vaquero Information Security Initiative works with across the Rio Grande Valley.",
};

export default function PartnersPage() {
  return (
    <main className="w-full flex flex-col items-center justify-center">
      <PageHeader title="Partners">
        We work with organizations across the Rio Grande Valley to put on events and grow the local
        security community.
      </PageHeader>

      <Section shaded>
        <ul className="flex flex-col gap-10">
          {PARTNERS.map((partner) => (
            <li key={partner.name} className="grid grid-cols-12 gap-6 items-center">
              {partner.logoSrc ? (
                <div className="col-span-12 sm:col-span-3 relative aspect-[3/2] rounded-xl overflow-hidden bg-light dark:bg-light/90">
                  <Image
                    src={partner.logoSrc}
                    alt={partner.logoAlt || partner.name}
                    fill
                    className="object-contain object-center p-4"
                    sizes="(max-width: 640px) 100vw, 25vw"
                  />
                </div>
              ) : null}

              <div className={partner.logoSrc ? "col-span-12 sm:col-span-9" : "col-span-12"}>
                <h2 className="font-semibold text-xl">{partner.name}</h2>
                <p className="font-in text-base mt-2 max-w-2xl">{partner.description}</p>
                {partner.href ? (
                  <a
                    href={partner.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 font-medium text-accent dark:text-accentDark underline underline-offset-2"
                  >
                    Visit {partner.name}
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <h2 className="font-bold text-2xl md:text-3xl">Work with us</h2>
        <p className="mt-4 font-in text-base max-w-2xl">
          If your organization wants to run a workshop, speak at a meeting, or sponsor students
          heading to a conference,{" "}
          <Link href="/contact" className="underline underline-offset-2 text-accent dark:text-accentDark">
            reach out
          </Link>
          .
        </p>
      </Section>
    </main>
  );
}
