import Link from "next/link";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SlideReveal } from "@/components/SlideReveal";
import { Orange } from "@/components/TextFormat";
import { ButtonLink } from "@/components/ButtonLink";
import { ScrollDownCue } from "@/components/ScrollDownCue";
import { SaplingMark } from "@/components/SaplingMark";

export default function AboutPage() {
  return (
    <div className="relative">

      {/* Hero */}
      <section className="sticky top-[88px] z-0 relative isolate overflow-hidden bg-background dark:bg-transparent">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -bottom-[64px] h-[360px]"
          style={{
            background: [
              "radial-gradient(60% 60% at 22% 62%, rgba(var(--accent-rgb), 0.14) 0%, transparent 72%)",
              "radial-gradient(60% 60% at 78% 62%, rgba(var(--accent-rgb), 0.14) 0%, transparent 72%)",
              "radial-gradient(85% 70% at 50% 80%, rgba(var(--accent-2-rgb), 0.10) 0%, transparent 74%)",
            ].join(", "),
          }}
        />
        <div className="mx-auto flex h-[calc(100svh-88px)] w-full max-w-7xl flex-col justify-center px-6 py-16 text-center">
          <div className="mx-auto mb-6 flex justify-center">
            <SaplingMark className="h-14 w-14 opacity-90" />
          </div>
          <h1
            className="font-bold leading-[1.05] tracking-tight"
            style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)" }}
          >
            <span className="block">
              <SlideReveal delay={80}>We&apos;re a <Orange>community-first</Orange></SlideReveal>
            </span>
            <span className="block">
              <SlideReveal delay={260}>cyber group.</SlideReveal>
            </span>
          </h1>

          <ScrollReveal delay={200} className="mx-auto mt-8 max-w-2xl">
            <p className="text-base leading-[1.9] text-muted" style={{ fontWeight: 300 }}>
              The Vaquero Information Security Initiative (VISI) is a cybersecurity student organization and 501(c)(3) nonprofit based in the Rio Grande Valley.
              We were founded to address the challenges our region faces in cybersecurity, and our goal is to build the skills to help. Students who join build applicable real-world skills alongside passionate, like-minded individuals. VISI serves as a network and springboard for students to launch careers in cybersecurity while giving back to our communities through workshops, open resources, and other contributions.
            </p>
          </ScrollReveal>
        </div>
        <ScrollDownCue targetId="about-content" />
      </section>

      <div
        id="about-content"
        className="relative z-10"
        style={{
          background: "linear-gradient(to bottom, transparent 0px, var(--background) 240px)",
        }}
      >
        {/* Mission */}
          <div className="bg-surface-strong py-20 text-surface-strong-foreground">
            <div className="mx-auto max-w-7xl px-6 text-center">
              <p className="mb-6 text-xs font-medium tracking-widest text-surface-strong-foreground/40 uppercase font-sans">
                Our Mission
              </p>
            <blockquote
              className="mx-auto max-w-3xl font-bold leading-tight tracking-tight"
              style={{ fontSize: "clamp(1.8rem, 4.5vw, 3rem)" }}
            >
              Produce cybersecurity professionals and give back.
              </blockquote>
              <p
                className="mx-auto mt-8 max-w-xl text-base leading-[1.9] text-surface-strong-foreground/70"
                style={{ fontWeight: 300 }}
              >
              VISI was created for the enthusiast who looks to make a difference. What we produce is designed to provide value to our communities and help our members grow into cybersecurity professionals.
              At the end of the day, our goal is to empower our members to take initiative in their academic and professional lives, whether that be attending or presenting at conferences, conducting research, starting projects, or making meaningful connections.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mx-auto w-full max-w-7xl px-6 py-20">
          <ScrollReveal>
            <p className="mb-10 text-sm font-medium tracking-widest text-muted-light uppercase font-sans">
              Our Pillars
            </p>
          </ScrollReveal>

          <div className="grid gap-8 sm:grid-cols-2">
            {[
              {
                title: "Devotion",
                body: "We protect the communities we come from. When we learn something, we share it.",
              },
              {
                title: "Dedication",
                body: "Delivering real value takes discipline. We aim to produce quality work.",
              },
              {
                title: "Curiosity",
                body: "Curious minds are the roots of progress. We ask questions, explore, and share what we find.",
              },
              {
                title: "Honor",
                body: "We act honestly and within the law. When the easy path conflicts with the right one, we take the right one.",
              },
            ].map((v, i) => (
              <ScrollReveal key={v.title} delay={i * 80}>
                <div className="border border-border bg-panel p-7" style={{ boxShadow: "var(--shadow)" }}>
                  <h3 className="mb-2 text-base font-semibold tracking-tight">{v.title}</h3>
                  <p className="text-sm leading-[1.9] text-muted" style={{ fontWeight: 300 }}>
                    {v.body}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* CTA */}
          <ScrollReveal className="mt-20 border-t border-border pt-16">
            <div className="max-w-2xl">
              <h2
                className="font-bold leading-tight tracking-tight"
                style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)" }}
              >
                Bigger problems need more people.
              </h2>

              <p className="mt-4 text-base leading-[1.9] text-muted" style={{ fontWeight: 300 }}>
                Security work done alone has a ceiling. As a team, we take on research others can&apos;t,
                respond to simulated incidents, and build tools that outlast any one member. If you&apos;re a UTRGV
                student or curious individual ready to work on hard problems alongside people who call security their calling,
                we invite you to join and help us make a difference.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <ButtonLink href="/contact-topic=discord">Join VISI</ButtonLink>
                <Link
                  href="/about/members"
                  className="work-arrow inline-flex items-center text-sm font-medium text-foreground"
                >
                  meet the team <span>→</span>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

    </div>
  );
}
