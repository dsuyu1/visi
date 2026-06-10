import "server-only";

import { slugify } from "@/lib/format";
import type { AcademyDomain, AcademyModule, AcademyUnit } from "@/lib/academy/types";

type ParsedCertification = {
  domains: AcademyDomain[];
  unitMarkdown: Record<string, string>;
};

function normalizeNewlines(input: string) {
  return input.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function cleanInlineMarkdown(text: string) {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function deriveDescription(markdownBody: string) {
  const lines = normalizeNewlines(markdownBody)
    .split("\n")
    .map((l) => l.trim());

  for (const line of lines) {
    if (!line) continue;
    if (line === "---") continue;
    if (line.startsWith("```")) continue;
    const cleaned = cleanInlineMarkdown(line.replace(/^[-*+]\s+/, ""));
    if (cleaned.length >= 12) return cleaned.slice(0, 180);
  }

  return "Study guide, checklists, and decision points.";
}

function buildUnitMarkdown(title: string, body: string) {
  const trimmed = body.trim();
  return `# ${title}\n\n${trimmed.length ? trimmed : "_No study material yet._"}\n`;
}

function isOverviewDomainTitle(title: string) {
  const normalized = title.toLowerCase().trim();
  return normalized === "overview" || normalized === "start here" || normalized === "start-here";
}

type InProgressDomain = AcademyDomain;
type InProgressModule = Omit<AcademyModule, "description" | "units"> & {
  description: string;
  units: AcademyUnit[];
};

export function parseNcpAiolNotes(notes: string): ParsedCertification {
  const lines = normalizeNewlines(notes).split("\n");
  const domains: AcademyDomain[] = [];
  const unitMarkdown: Record<string, string> = {};

  let currentDomain: InProgressDomain | null = null;
  let currentModule: InProgressModule | null = null;
  let currentUnit: AcademyUnit | null = null;

  let modulePreambleLines: string[] = [];
  let unitBodyLines: string[] = [];

  let inCodeBlock = false;
  let categoryCount = 0;
  let unitIdCounts: Record<string, number> = {};

  const finalizeUnit = () => {
    if (!currentModule || !currentUnit) return;
    const body = unitBodyLines.join("\n").trim();
    unitMarkdown[`${currentModule.id}::${currentUnit.id}`] = buildUnitMarkdown(currentUnit.title, body);
    currentModule.units.push(currentUnit);
    currentUnit = null;
    unitBodyLines = [];
  };

  const finalizeModule = () => {
    if (!currentDomain || !currentModule) return;
    finalizeUnit();
    const preamble = modulePreambleLines.join("\n").trim();
    currentModule.description = preamble.length ? deriveDescription(preamble) : currentModule.description;
    currentDomain.modules.push(currentModule);
    currentModule = null;
    modulePreambleLines = [];
    unitIdCounts = {};
  };

  const finalizeDomain = () => {
    if (!currentDomain) return;
    finalizeModule();
    domains.push(currentDomain);
    currentDomain = null;
  };

  const startDomain = (title: string) => {
    finalizeDomain();

    const id = isOverviewDomainTitle(title) ? "overview" : `category-${++categoryCount}`;
    currentDomain = { id, title, modules: [] };
  };

  const startModule = (title: string) => {
    if (!currentDomain) {
      // Ignore module headings until a domain exists.
      return;
    }
    finalizeModule();

    const base = slugify(title);
    const moduleId = currentDomain.id === "overview" ? `overview-${base}` : `${currentDomain.id}-${base}`;

    currentModule = {
      id: moduleId,
      title,
      description: "Study guide, checklists, and decision points.",
      units: [],
    };
    modulePreambleLines = [];
    unitIdCounts = {};
  };

  const startUnit = (title: string) => {
    if (!currentModule) {
      // Ignore unit headings until a module exists.
      return;
    }
    finalizeUnit();

    const base = slugify(title);
    const seen = unitIdCounts[base] ?? 0;
    unitIdCounts[base] = seen + 1;
    const unitId = seen === 0 ? base : `${base}-${seen + 1}`;

    currentUnit = { id: unitId, title };
    unitBodyLines = [];
  };

  for (const rawLine of lines) {
    const line = rawLine;
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      if (currentUnit) unitBodyLines.push(line);
      else if (currentModule) modulePreambleLines.push(line);
      continue;
    }

    if (!inCodeBlock) {
      const headingMatch = /^(#{2,4})\s+(.+)$/.exec(trimmed);
      if (headingMatch) {
        const level = headingMatch[1]!.length;
        const title = headingMatch[2]!.trim();
        if (level === 2) startDomain(title);
        if (level === 3) startModule(title);
        if (level === 4) startUnit(title);
        continue;
      }
    }

    if (currentUnit) {
      unitBodyLines.push(line);
    } else if (currentModule) {
      modulePreambleLines.push(line);
    }
  }

  finalizeDomain();

  // Preserve authoring order, but ensure "overview" is first if present.
  const overviewIdx = domains.findIndex((d) => d.id === "overview");
  if (overviewIdx > 0) {
    const [overview] = domains.splice(overviewIdx, 1);
    if (overview) domains.unshift(overview);
  }

  return { domains, unitMarkdown };
}
