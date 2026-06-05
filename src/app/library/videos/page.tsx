import { ScrollReveal } from "@/components/ScrollReveal";
import { SlideReveal } from "@/components/SlideReveal";

export default function VideosPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 pb-24 pt-20 text-center">

      <h1 className="font-bold leading-[1.05] tracking-tight"
          style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)" }}>
        <SlideReveal delay={80}>Videos</SlideReveal>
      </h1>

      <ScrollReveal delay={160} className="mt-6 mx-auto max-w-xl">
        <p className="text-base leading-[1.9] text-muted" style={{ fontWeight: 300 }}>
          Workshop recordings, project walkthroughs, and lab sessions.
        </p>
      </ScrollReveal>

      <ScrollReveal delay={320} className="mt-20">
        <div className="border border-border bg-panel p-12 text-center"
             style={{ boxShadow: "var(--shadow)" }}>
          <p className="text-sm text-muted-light">Coming soon</p>
          <p className="mt-2 text-xs text-muted-light">
            Workshop recordings and walkthroughs will appear here.
          </p>
        </div>
      </ScrollReveal>

    </div>
  );
}
