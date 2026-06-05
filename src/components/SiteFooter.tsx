import Link from "next/link";
import { SITE } from "@/lib/site";

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
  return (
    <footer className="bg-foreground text-background font-sans">
      <div className="mx-auto max-w-7xl px-6 py-4">

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {columns.map((col) => (
            <div key={col.parent.href}>
              <Link href={col.parent.href}
                className="text-xs font-semibold text-background/90 transition-colors hover:text-background">
                {col.parent.label}
              </Link>
              {col.children.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {col.children.map((c) => (
                    <li key={c.href}>
                      <Link href={c.href}
                        className="text-xs text-background/70 transition-colors hover:text-background">
                        {c.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-1 border-t border-white/10 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-background/50">
            © {new Date().getFullYear()} {SITE.name} · {SITE.locationLabel}
          </span>
          <a href={`mailto:${SITE.contactEmail}`}
            className="text-xs text-background/70 transition-colors hover:text-background">
            {SITE.contactEmail}
          </a>
        </div>

      </div>
    </footer>
  );
}
