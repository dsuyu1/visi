import Link from "next/link";
import { cn } from "@/lib/cn";

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "btn-slide inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-medium tracking-wide font-sans",
        // btn-primary is a plain CSS class (globals.css) that wins over
        // the global `a { color: inherit }` rule via higher specificity.
        variant === "primary" && "btn-primary",
        variant === "secondary" &&
          "border border-foreground/15 text-muted hover:border-foreground hover:text-foreground",
        className,
      )}
    >
      {children}
    </Link>
  );
}
