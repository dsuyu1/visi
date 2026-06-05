const CENTRAL_TIMEZONE = "America/Chicago";
const CENTRAL_OFFSET_FOR_DATE_ONLY = "-06:00"; // treat date-only strings as CST for stability

function toCentralDate(date: string | Date): Date {
  if (date instanceof Date) return date;

  // Date-only ISO strings (YYYY-MM-DD) are interpreted as UTC by JS Date, which can shift the day.
  // Treat them as CST by pinning them to midday with an explicit offset.
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new Date(`${date}T12:00:00${CENTRAL_OFFSET_FOR_DATE_ONLY}`);
  }

  return new Date(date);
}

export function isoDateInCentral(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CENTRAL_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((p) => p.type === "year")?.value ?? "0000";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

export function formatDate(date: string | Date) {
  const d = toCentralDate(date);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: CENTRAL_TIMEZONE,
  }).format(d);
}

/** Estimated reading time at 200 wpm */
export function readingTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}

/** Convert arbitrary text to a URL-safe id slug */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export interface Heading {
  id: string;
  text: string;
  level: number; // 2 = h2, 3 = h3
}

/** Extract h2 and h3 headings from a markdown string */
export function extractHeadings(markdown: string): Heading[] {
  const re = /^(#{2,3})\s+(.+)$/gm;
  const out: Heading[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(markdown)) !== null) {
    const text = m[2].trim();
    out.push({ level: m[1].length, text, id: slugify(text) });
  }
  return out;
}
