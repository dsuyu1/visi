import Link from "next/link";
import AboutCoverSection from "@/src/components/About/AboutCoverSection";
import Skills from "@/src/components/About/Skills";
import Section from "@/src/components/Elements/Section";
import { PILLARS } from "@/src/utils/siteContent";

export const metadata = {
  title: "About",
  description:
    "The Vaquero Information Security Initiative is a cybersecurity student organization and nonprofit based in the Rio Grande Valley.",
};

export default function About() {
  return (
    <>
      <AboutCoverSection />

      <Section shaded className="text-center">
        <p className="text-xs font-semibold tracking-widest uppercase text-accent dark:text-accentDark">
          Our mission
        </p>
        <blockquote className="mx-auto max-w-3xl font-bold leading-tight text-2xl sm:text-3xl md:text-4xl mt-6">
          Produce cybersecurity professionals and give back.
        </blockquote>
        <p className="mx-auto max-w-2xl font-in text-base mt-8">
          VISI was created for the enthusiast who looks to make a difference. What we produce is
          designed to provide value to our communities and help our members grow into cybersecurity
          professionals. Our goal is to empower members to take initiative in their academic and
          professional lives — attending or presenting at conferences, conducting research, starting
          projects, or making meaningful connections.
        </p>
      </Section>

      <Section>
        <p className="text-xs font-semibold tracking-widest uppercase text-accent dark:text-accentDark">
          Our pillars
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
          {PILLARS.map((pillar) => (
            <li
              key={pillar.title}
              className="rounded-xl border-2 border-solid border-dark dark:border-light p-6"
            >
              <h2 className="font-semibold text-lg sm:text-xl">{pillar.title}</h2>
              <p className="font-in text-base mt-2">{pillar.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Skills />

      <Section>
        <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl max-w-2xl">
          Bigger problems need more people.
        </h2>
        <p className="font-in text-base mt-4 max-w-2xl">
          Security work done alone has a ceiling. As a team, we take on research others can&apos;t,
          respond to simulated incidents, and build tools that outlast any one member. If you&apos;re
          a UTRGV student or a curious individual ready to work on hard problems alongside people who
          call security their calling, come join us.
        </p>
        <div className="flex flex-wrap items-center gap-6 mt-8">
          <Link
            href="/contact"
            className="liquid-glass font-medium capitalize text-lg py-2 sm:py-3 px-7 sm:px-9 text-dark dark:text-light"
          >
            Join VISI
          </Link>
          <Link
            href="/members"
            className="font-medium text-accent dark:text-accentDark underline underline-offset-2"
          >
            Meet the team
          </Link>
        </div>
      </Section>
    </>
  );
}
