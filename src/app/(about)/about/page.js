import AboutCoverSection from "@/src/components/About/AboutCoverSection";
import Skills from "@/src/components/About/Skills";
import Link from "next/link";


export const metadata = {
  title: "About",
  description: `About the Vaquero Information Security Initiative at UTRGV.`,
};

export default function About() {
  return (
    <>
      <AboutCoverSection />
      <Skills />
      <h2 className="mt-8 font-semibold text-lg md:text-2xl self-start mx-5 xs:mx-10 sm:mx-12 md:mx-16 lg:mx-20 text-dark dark:text-light dark:font-normal"> 
      Want to join, speak at a meeting, or work with us? Reach out 📞 from <Link href="/contact"  className="!underline underline-offset-2"   >here</Link> and we&apos;ll get back to you.
      </h2>
    </>
  );
}
