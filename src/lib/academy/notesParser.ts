import "server-only";

import { slugify } from "@/lib/format";
import type { AcademyDomain } from "@/lib/academy/types";
import { AWS_SAA_C03_REFERENCES } from "@/lib/academy/references/aws-saa-c03";

type ParsedCertification = {
  domains: AcademyDomain[];
  unitMarkdown: Record<string, string>;
};

type Heading = { level: 2 | 3; title: string; index: number };
type NoteSection = { title: string; body: string };

function normalizeNewlines(input: string) {
  return input.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function unescapeMarkdownPunctuation(text: string) {
  return text.replace(/\\([\\`*_{}\[\]()#+\-.!|])/g, "$1");
}

function stripWrappingEmphasis(text: string) {
  return text.replace(/^[_*]+/, "").replace(/[_*]+$/, "");
}

function isMarkdownTableSeparatorRow(line: string) {
  if (!line.includes("|")) return false;
  const compact = line.replace(/[|\s]/g, "");
  return compact.length > 0 && /^[-:]+$/.test(compact);
}

function deriveDescription(markdownBody: string) {
  const lines = markdownBody.split("\n").map((l) => l.trim());

  let first = "";
  for (const line of lines) {
    if (line.length === 0) continue;
    if (line === "---") continue;
    if (line.startsWith("```")) continue;
    if (isMarkdownTableSeparatorRow(line)) continue;
    first = line;
    break;
  }

  const cleaned = stripWrappingEmphasis(first)
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim())
    .filter(Boolean)
    .join(first.includes("|") ? " · " : " ")
    .replace(/^[-*+]\s+/, "")
    .replace(/^#+\s+/, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  const unescaped = unescapeMarkdownPunctuation(cleaned).trim();

  if (unescaped.length >= 16) return unescaped.slice(0, 180);
  return "Study notes, exam traps, and decision points.";
}

function referenceBlockForTitle(title: string) {
  const refs = AWS_SAA_C03_REFERENCES[title] ?? [];
  if (refs.length === 0) return "";
  const lines = refs.map((r) => `- [${r.label}](${r.url})`);
  return `\n\n## References\n${lines.join("\n")}\n`;
}

function buildUnitMarkdown(title: string, body: string) {
  const trimmed = body.trim();
  const base = `# ${title}\n\n${trimmed.length ? trimmed : "_No notes captured yet._"}\n`;
  return base + referenceBlockForTitle(title);
}

function parseDomainHeading(title: string) {
  const m = /^Domain\s*(\d+):\s*(.+?)\s*\((\d+)%\)\s*$/.exec(title.trim());
  if (!m) return null;
  return {
    number: Number(m[1]),
    title: m[2].trim(),
    weightPercent: Number(m[3]),
  };
}

function ensureDomain(
  domains: AcademyDomain[],
  domain: { id: string; title: string; weightPercent?: number },
): AcademyDomain {
  const existing = domains.find((d) => d.id === domain.id);
  if (existing) return existing;
  const created: AcademyDomain = {
    id: domain.id,
    title: domain.title,
    weightPercent: domain.weightPercent,
    modules: [],
  };
  domains.push(created);
  return created;
}

function extractNotesSections(lines: string[], headings: Heading[]) {
  const sectionBodies: Record<string, string> = {};

  const firstH2 = headings.find((h) => h.level === 2)?.index ?? lines.length;
  const preambleLines = lines.slice(0, firstH2);
  const preamble = preambleLines
    .filter((l) => !l.startsWith("# "))
    .join("\n")
    .trim();
  if (preamble.length) sectionBodies["Study Guide Intro"] = preamble;

  const h2s = headings.filter((h) => h.level === 2);
  for (let i = 0; i < h2s.length; i += 1) {
    const h2 = h2s[i]!;
    const nextH2Index = h2s[i + 1]?.index ?? lines.length;

    const h3sInRange = headings
      .filter((h) => h.level === 3 && h.index > h2.index && h.index < nextH2Index)
      .sort((a, b) => a.index - b.index);

    if (h3sInRange.length === 0) {
      sectionBodies[h2.title] = lines.slice(h2.index + 1, nextH2Index).join("\n").trim();
      continue;
    }

    const between = lines.slice(h2.index + 1, h3sInRange[0]!.index).join("\n").trim();
    if (between.length) sectionBodies[`${h2.title} Overview`] = between;

    for (let j = 0; j < h3sInRange.length; j += 1) {
      const h3 = h3sInRange[j]!;
      const nextHeadingIndex = h3sInRange[j + 1]?.index ?? nextH2Index;
      sectionBodies[h3.title] = lines.slice(h3.index + 1, nextHeadingIndex).join("\n").trim();
    }
  }

  return sectionBodies;
}

function splitBoldSubsections(sectionTitle: string, markdownBody: string): NoteSection[] {
  const lines = normalizeNewlines(markdownBody).split("\n");
  const headings: { title: string; index: number }[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i]?.trim() ?? "";
    if (!raw.startsWith("**") || !raw.endsWith("**")) continue;
    const inner = raw.replace(/^\*\*/, "").replace(/\*\*$/, "").trim();
    if (inner.length < 3) continue;
    headings.push({ title: inner.replace(/:$/, "").trim(), index: i });
  }

  if (headings.length === 0) {
    return [{ title: sectionTitle, body: markdownBody.trim() }];
  }

  const sections: NoteSection[] = [];
  for (let i = 0; i < headings.length; i += 1) {
    const h = headings[i]!;
    const nextIdx = headings[i + 1]?.index ?? lines.length;
    const body = lines.slice(h.index + 1, nextIdx).join("\n").trim();
    sections.push({ title: h.title, body });
  }
  return sections;
}

function unitKey(moduleId: string, unitId: string) {
  return `${moduleId}::${unitId}`;
}

function addModuleWithUnits(args: {
  domain: AcademyDomain;
  prefix: string;
  title: string;
  unitTitles: string[];
  sectionBodies: Record<string, string>;
  unitMarkdown: Record<string, string>;
  usedTitles: Set<string>;
}) {
  const { domain, prefix, title, unitTitles, sectionBodies, unitMarkdown, usedTitles } = args;

  const moduleId = `${prefix}${slugify(title)}`;
  const units = unitTitles.map((unitTitle) => {
    const id = slugify(unitTitle);
    const body = sectionBodies[unitTitle] ?? "";
    unitMarkdown[unitKey(moduleId, id)] = buildUnitMarkdown(unitTitle, body);
    usedTitles.add(unitTitle);
    return { id, title: unitTitle };
  });

  const combinedBody = unitTitles.map((t) => sectionBodies[t] ?? "").join("\n\n");
  domain.modules.push({
    id: moduleId,
    title,
    description: deriveDescription(combinedBody),
    units,
  });
}

export function parseSaaC03Notes(notesMarkdown: string): ParsedCertification {
  const notes = normalizeNewlines(notesMarkdown);
  const lines = notes.split("\n");

  const headings: Heading[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? "";
    const m = /^(##|###)\s+(.*)$/.exec(line);
    if (!m) continue;
    const level = m[1] === "##" ? 2 : 3;
    const title = m[2]?.trim() ?? "";
    headings.push({ level, title, index: i });
  }

  const sectionBodies = extractNotesSections(lines, headings);
  const unitMarkdown: Record<string, string> = {};
  const usedTitles = new Set<string>();

  const domains: AcademyDomain[] = [];
  const overview = ensureDomain(domains, { id: "overview", title: "Overview" });

  const domainInfoByNumber = new Map<number, { title: string; weightPercent?: number }>();
  for (const h2 of headings.filter((h) => h.level === 2)) {
    const info = parseDomainHeading(h2.title);
    if (!info) continue;
    domainInfoByNumber.set(info.number, { title: info.title, weightPercent: info.weightPercent });
  }

  const domain1 = ensureDomain(domains, {
    id: "domain-1",
    title: domainInfoByNumber.get(1)?.title ?? "Design Secure Architectures",
    weightPercent: domainInfoByNumber.get(1)?.weightPercent,
  });
  const domain2 = ensureDomain(domains, {
    id: "domain-2",
    title: domainInfoByNumber.get(2)?.title ?? "Design Resilient Architectures",
    weightPercent: domainInfoByNumber.get(2)?.weightPercent,
  });
  const domain3 = ensureDomain(domains, {
    id: "domain-3",
    title: domainInfoByNumber.get(3)?.title ?? "Design High-Performing Architectures",
    weightPercent: domainInfoByNumber.get(3)?.weightPercent,
  });
  const domain4 = ensureDomain(domains, {
    id: "domain-4",
    title: domainInfoByNumber.get(4)?.title ?? "Design Cost-Optimized Architectures",
    weightPercent: domainInfoByNumber.get(4)?.weightPercent,
  });

  const monitoring = ensureDomain(domains, {
    id: "monitoring",
    title: "Monitoring, Audit & Governance",
  });

  addModuleWithUnits({
    domain: overview,
    prefix: "overview-",
    title: "Start Here",
    unitTitles: ["Study Guide Intro", "Exam Logistics", "Domain Weightings", "AWS Global Infrastructure"],
    sectionBodies,
    unitMarkdown,
    usedTitles,
  });

  const keyDecisionBody = sectionBodies["Key Decision Frameworks"];
  if (typeof keyDecisionBody === "string" && keyDecisionBody.trim().length) {
    const split = splitBoldSubsections("Key Decision Frameworks", keyDecisionBody);
    for (const s of split) {
      sectionBodies[s.title] = s.body;
    }
    addModuleWithUnits({
      domain: overview,
      prefix: "overview-",
      title: "Key Decision Frameworks",
      unitTitles: split.map((s) => s.title),
      sectionBodies,
      unitMarkdown,
      usedTitles,
    });
    usedTitles.add("Key Decision Frameworks");
  }

  addModuleWithUnits({
    domain: domain1,
    prefix: "d1-",
    title: "Identity & Governance",
    unitTitles: [
      "IAM Fundamentals",
      "IAM Roles vs. Resource-Based Policies",
      "Multi-Account Strategy",
      "AWS IAM Identity Center (formerly SSO)",
      "AWS Directory Services",
      "Amazon Cognito",
    ],
    sectionBodies,
    unitMarkdown,
    usedTitles,
  });

  addModuleWithUnits({
    domain: domain1,
    prefix: "d1-",
    title: "Security Controls",
    unitTitles: [
      "VPC Security Components",
      "Threat Protection Services",
      "Data Security Controls",
      "Blocking an IP Address",
    ],
    sectionBodies,
    unitMarkdown,
    usedTitles,
  });

  addModuleWithUnits({
    domain: domain2,
    prefix: "d2-",
    title: "Resilience & DR",
    unitTitles: [
      "High Availability Patterns",
      "Disaster Recovery Strategies (Know These Cold)",
      "Storage Types",
      "AWS Backup",
    ],
    sectionBodies,
    unitMarkdown,
    usedTitles,
  });

  addModuleWithUnits({
    domain: domain2,
    prefix: "d2-",
    title: "Scaling & Decoupling",
    unitTitles: [
      "Elastic Load Balancing (ELB)",
      "Loosely Coupled Architectures",
      "Stateless vs. Stateful Apps",
      "SQS as Buffer",
    ],
    sectionBodies,
    unitMarkdown,
    usedTitles,
  });

  addModuleWithUnits({
    domain: domain2,
    prefix: "d2-",
    title: "Compute Platforms",
    unitTitles: ["Containers on AWS", "Serverless Technologies", "Elastic Beanstalk"],
    sectionBodies,
    unitMarkdown,
    usedTitles,
  });

  addModuleWithUnits({
    domain: domain2,
    prefix: "d2-",
    title: "Reference Architectures & Migration",
    unitTitles: [
      "Classic 3-Tier Web App",
      "Serverless Web App",
      "Serverless Architecture Decision Tree",
      "Migration Patterns",
    ],
    sectionBodies,
    unitMarkdown,
    usedTitles,
  });

  addModuleWithUnits({
    domain: domain3,
    prefix: "d3-",
    title: "Compute & Networking Performance",
    unitTitles: ["Compute for High Performance", "Networking for High Performance", "HPC (High Performance Computing)"],
    sectionBodies,
    unitMarkdown,
    usedTitles,
  });

  addModuleWithUnits({
    domain: domain3,
    prefix: "d3-",
    title: "Data, Analytics & ML",
    unitTitles: [
      "Databases (Detailed)",
      "Data Ingestion & Analytics",
      "Machine Learning Services (Know the Use Cases)",
    ],
    sectionBodies,
    unitMarkdown,
    usedTitles,
  });

  addModuleWithUnits({
    domain: domain4,
    prefix: "d4-",
    title: "Cost Optimization",
    unitTitles: ["Cost Management Tools", "Cost Optimization Patterns"],
    sectionBodies,
    unitMarkdown,
    usedTitles,
  });

  addModuleWithUnits({
    domain: monitoring,
    prefix: "ops-",
    title: "Monitoring, Audit & Governance",
    unitTitles: ["CloudWatch", "CloudTrail", "AWS Config"],
    sectionBodies,
    unitMarkdown,
    usedTitles,
  });

  // Anything we failed to categorize still shows up instead of vanishing.
  const allSectionTitles = Object.keys(sectionBodies);
  const remaining = allSectionTitles.filter((t) => !usedTitles.has(t) && sectionBodies[t]?.trim().length);
  if (remaining.length) {
    const extras = ensureDomain(domains, { id: "additional", title: "Additional Topics" });
    addModuleWithUnits({
      domain: extras,
      prefix: "extra-",
      title: "Unsorted Notes",
      unitTitles: remaining,
      sectionBodies,
      unitMarkdown,
      usedTitles,
    });
  }

  // Keep domains ordered: Overview -> Domains 1-4 -> everything else
  const priority = ["overview", "domain-1", "domain-2", "domain-3", "domain-4"];
  domains.sort((a, b) => {
    const ai = priority.indexOf(a.id);
    const bi = priority.indexOf(b.id);
    if (ai !== -1 || bi !== -1) {
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    }
    return a.title.localeCompare(b.title);
  });

  return { domains, unitMarkdown };
}
