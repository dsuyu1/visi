import React from "react";

const PageHeader = ({ title, children }) => {
  return (
    <div className="w-full px-5 sm:px-10 md:px-24 sxl:px-32 pt-8 pb-12 sm:pt-12 sm:pb-16 text-dark dark:text-light">
      <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl">{title}</h1>
      {children ? (
        <p className="mt-4 max-w-2xl font-in text-base sm:text-lg text-gray dark:text-light/60">
          {children}
        </p>
      ) : null}
    </div>
  );
};

export default PageHeader;
