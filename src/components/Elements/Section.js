import React from "react";
import { cx } from "@/src/utils";

/**
 * Page section. `shaded` gives it a slightly different background from the page
 * so neighbouring sections read as separate without a divider between them.
 */
const Section = ({ shaded = false, className, children }) => {
  return (
    <section
      className={cx(
        "w-full px-5 sm:px-10 md:px-24 sxl:px-32 py-12 sm:py-16 text-dark dark:text-light",
        shaded && "bg-surface dark:bg-surfaceDark",
        className
      )}
    >
      {children}
    </section>
  );
};

export default Section;
