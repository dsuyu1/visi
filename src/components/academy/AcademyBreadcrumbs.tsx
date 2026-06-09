import Link from "next/link";

export function AcademyBreadcrumbs({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-muted-light font-sans">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, idx) => (
          <li key={item.href} className="flex items-center gap-2">
            <Link
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
            {idx < items.length - 1 ? <span aria-hidden>&gt;</span> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
