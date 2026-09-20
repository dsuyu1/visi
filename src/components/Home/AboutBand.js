import Link from "next/link";

const AboutBand = () => {
  return (
    <section className="w-full mt-16 sm:mt-24 md:mt-32 px-5 sm:px-10 md:px-24 sxl:px-32 text-dark dark:text-light">
      <p className="text-xs font-semibold tracking-widest uppercase text-accent dark:text-accentDark">
        Who we are
      </p>
      <h2 className="font-bold leading-tight text-2xl sm:text-3xl md:text-4xl mt-4 max-w-3xl">
        We push progress in cybersecurity.
      </h2>
      <p className="font-in text-base sm:text-lg mt-5 max-w-3xl">
        We provide students and curious minds with the resources, projects, and mentorship to close
        the gap in cybersecurity. Based in the Rio Grande Valley, we&apos;re building a community for
        students to explore, experiment, and educate others.
      </p>
      <div className="flex flex-wrap items-center gap-6 mt-8">
        <Link
          href="/about"
          className="font-medium capitalize text-lg py-2 sm:py-3 px-6 sm:px-8 border-2 border-solid border-dark dark:border-light rounded hover:bg-dark hover:text-light dark:hover:bg-light dark:hover:text-dark transition-all ease duration-200"
        >
          Learn more
        </Link>
        <Link
          href="/contact"
          className="font-medium text-accent dark:text-accentDark underline underline-offset-2"
        >
          Join VISI
        </Link>
      </div>
    </section>
  );
};

export default AboutBand;
