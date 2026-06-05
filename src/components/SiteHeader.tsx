'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";

type Child = { href: string; label: string };
type NavItem = { href: string; label: string; children?: Child[] };

// 2 + 2 split around the centred logo
const leftNav: NavItem[] = [
  {
    label: "about",
    href: "/about",
    children: [
      { href: "/about",         label: "our story"  },
      { href: "/about/members", label: "members"    },
      { href: "/partners",      label: "partners"   },
      { href: "/contact",       label: "contact"    },
    ],
  },
  {
    label: "library",
    href: "/library",
    children: [
      { href: "/blog",               label: "blog"      },
      { href: "/library/resources",  label: "resources" },
      { href: "/library/videos",     label: "videos"    },
    ],
  },
];

const rightNav: NavItem[] = [
  { label: "events",   href: "/events"   },
  { label: "our work", href: "/our-work" },
];

export function SiteHeader() {
  const pathname = usePathname();

  const isActive = (item: NavItem) => {
    if (pathname === item.href || pathname.startsWith(item.href + "/")) return true;
    return item.children?.some(
      (c) => pathname === c.href || pathname.startsWith(c.href + "/"),
    ) ?? false;
  };

  // Muted colour — slightly darker than before so links are more legible
  const INACTIVE = "var(--secondary)";
  const ACTIVE   = "var(--foreground)";

  const NavLink = ({ item }: { item: NavItem }) => {
    const active      = isActive(item);
    const hasChildren = !!item.children?.length;

    return (
      <div className="group relative">
        <Link
          href={item.href}
          className="nav-link flex items-center gap-1 text-sm transition-colors duration-200"
          style={{ color: active ? ACTIVE : INACTIVE }}
          data-active={active || undefined}
        >
          {item.label}
          {hasChildren && (
            <svg
              className="h-2.5 w-2.5 opacity-50 transition-transform duration-200 group-hover:rotate-180"
              viewBox="0 0 10 10" fill="none"
            >
              <path d="M1.5 3.5L5 7 8.5 3.5" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </Link>

        {hasChildren && (
          <div
            className="pointer-events-none absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3
              opacity-0 transition-all duration-150 ease-out
              group-hover:pointer-events-auto group-hover:opacity-100"
          >
            <div className="border border-border bg-background py-1 shadow-sm"
                 style={{ minWidth: "148px" }}>
              {item.children!.map((c) => {
                const cActive = pathname === c.href || pathname.startsWith(c.href + "/");
                return (
                  <Link key={c.href} href={c.href}
                    className="block px-4 py-2 text-sm transition-colors duration-150 hover:bg-panel-hover focus-visible:bg-panel-hover focus-visible:outline-none"
                    style={{ color: cActive ? ACTIVE : INACTIVE }}>
                    {c.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-background font-sans">
      <div className="mx-auto flex max-w-7xl items-center px-6 py-4">

        {/* Left nav — right-aligned against logo */}
        <nav aria-label="Primary left"
             className="hidden flex-1 items-center justify-end gap-8 md:flex">
          {leftNav.map((item) => <NavLink key={item.href} item={item} />)}
        </nav>

        {/* Centre logo */}
        <Link href="/" className="mx-8 flex shrink-0 items-center justify-center"
              aria-label="Home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/visi-logo.png" alt="VISI" className="h-14 w-14 object-contain" />
        </Link>

        {/* Right nav — left-aligned against logo */}
        <nav aria-label="Primary right"
             className="hidden flex-1 items-center justify-start gap-8 md:flex">
          {rightNav.map((item) => <NavLink key={item.href} item={item} />)}
        </nav>

        {/* Mobile — compact flat list */}
        <nav className="flex flex-1 flex-wrap justify-end gap-4 md:hidden">
          {[...leftNav, ...rightNav].map((item) => (
            <Link key={item.href} href={item.href}
              className="text-xs transition-colors"
              style={{ color: isActive(item) ? ACTIVE : INACTIVE }}>
              {item.label}
            </Link>
          ))}
        </nav>

      </div>
    </header>
  );
}
