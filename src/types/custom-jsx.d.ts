import type React from "react";

type OrangeTagProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
>;

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      /**
       * Custom inline tag for orange accent text.
       * Usage: <o-text>accent</o-text>
       */
      "o-text": OrangeTagProps;
    }
  }
}

declare module "react/jsx-dev-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      "o-text": OrangeTagProps;
    }
  }
}

export {};
