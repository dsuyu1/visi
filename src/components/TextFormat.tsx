import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export function Highlight({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <mark className={cn("text-highlight", className)}>{children}</mark>;
}

export function InkUnderline({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <u className={cn("ink-underline", className)}>{children}</u>;
}

export function Orange({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn("text-accent", className)}>{children}</span>;
}
