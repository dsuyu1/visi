"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { SITE } from "@/lib/site";

function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.3V9h3.42v1.56h.05c.48-.9 1.65-1.85 3.4-1.85 3.64 0 4.31 2.4 4.31 5.51v6.23zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM3.56 20.45V9h3.56v11.45H3.56z" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M16.5 2.75h-9A4.75 4.75 0 0 0 2.75 7.5v9A4.75 4.75 0 0 0 7.5 21.25h9a4.75 4.75 0 0 0 4.75-4.75v-9A4.75 4.75 0 0 0 16.5 2.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M12 15.25A3.25 3.25 0 1 0 12 8.75a3.25 3.25 0 0 0 0 6.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M17.25 6.75h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const columns = [
  {
    parent: { href: "/about",    label: "about"    },
    children: [
      { href: "/about/members", label: "members"  },
      { href: "/partners",      label: "partners" },
      { href: "/contact",       label: "contact"  },
    ],
  },
  {
    parent: { href: "/library",  label: "library"  },
    children: [
      { href: "/blog",             label: "blog"     },
      { href: "/library/academy",  label: "academy"  },
      { href: "/library/resources", label: "resources" },
      { href: "/library/videos",   label: "videos"   },
    ],
  },
  {
    parent: { href: "/events",   label: "events"   },
    children: [],
  },
  {
    parent: { href: "/our-work", label: "our work" },
    children: [],
  },
] as const;

export function SiteFooter() {
  type FooterLinkProps = {
    href: string;
    children: ReactNode;
    className: string;
  };

  const FooterLink = ({ href, children, className }: FooterLinkProps) => {
    const isExternal = href.startsWith("http://") || href.startsWith("https://");
    return isExternal ? (
      <a href={href} className={className}>
        {children}
      </a>
    ) : (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  };

  return (
    <footer className="bg-surface-strong text-surface-strong-foreground font-sans">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {columns.map((col) => (
            <div key={col.parent.href}>
              <FooterLink
                href={col.parent.href}
                className="text-xs font-semibold text-surface-strong-foreground/90 transition-colors hover:text-surface-strong-foreground"
              >
                {col.parent.label}
              </FooterLink>
              {col.children.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {col.children.map((c) => (
                    <li key={c.href}>
                      <FooterLink
                        href={c.href}
                        className="text-xs text-surface-strong-foreground/70 transition-colors hover:text-surface-strong-foreground"
                      >
                        {c.label}
                      </FooterLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-1 border-t border-white/10 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-surface-strong-foreground/50">
            © {new Date().getFullYear()} {SITE.name} · {SITE.locationLabel}
          </span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a
              href={`mailto:${SITE.contactEmail}`}
              className="text-xs text-surface-strong-foreground/70 transition-colors hover:text-surface-strong-foreground"
            >
              {SITE.contactEmail}
            </a>
            <div className="flex items-center gap-3">
              <a
                href="https://www.linkedin.com/company/vaquero-information-security-initiative"
                target="_blank"
                rel="noreferrer"
                aria-label="VISI on LinkedIn"
                className="text-surface-strong-foreground/70 transition-colors hover:text-surface-strong-foreground"
              >
                <LinkedInIcon className="size-4" />
              </a>
              <a
                href="https://www.instagram.com/visiutrgv/"
                target="_blank"
                rel="noreferrer"
                aria-label="VISI on Instagram"
                className="text-surface-strong-foreground/70 transition-colors hover:text-surface-strong-foreground"
              >
                <InstagramIcon className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
