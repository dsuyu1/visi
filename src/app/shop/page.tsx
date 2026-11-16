import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shop",
  description: "The Vaquero Information Security Initiative merch shop.",
};

export default function ShopPage() {
  return (
    <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:gap-16 md:py-24">
      <div>
        <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
          VISI Merch
        </h1>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
          Our merch shop is coming soon. Have a question or a design you’d
          like to see? Get in touch with the VISI team.
        </p>
        <Link
          href="/contact"
          className="btn-slide btn-primary mt-7 inline-flex px-6 py-3 text-sm font-medium"
        >
          Contact VISI
        </Link>
      </div>

      <div className="grid aspect-[4/3] place-items-center border border-border bg-panel p-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/final_finished_visilogo.png"
          alt=""
          className="aspect-square w-1/2 max-w-56 object-contain"
        />
      </div>
    </div>
  );
}
