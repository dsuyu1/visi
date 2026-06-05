import { SlideReveal } from "@/components/SlideReveal";
import { MembersMarquee } from "@/components/MembersMarquee";
import { MEMBERS } from "@/lib/content";

export default function MembersPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 pb-24 pt-20">
      <div className="text-center">
        <h1
          className="font-bold leading-[1.05] tracking-tight"
          style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)" }}
        >
          <SlideReveal delay={80}>Meet the team.</SlideReveal>
        </h1>

        <p
          className="mx-auto mt-6 max-w-xl text-base leading-[1.9] text-muted"
          style={{ fontWeight: 300 }}
        >
          Student researchers, engineers, and analysts working on real problems.
        </p>
      </div>

      <div className="mt-16">
        <MembersMarquee members={MEMBERS} />
      </div>

    </div>
  );
}
