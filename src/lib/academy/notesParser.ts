import "server-only";

import { slugify } from "@/lib/format";
import type { AcademyDomain, PracticeQuestion } from "@/lib/academy/types";
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

function cleanInlineMarkdown(text: string) {
  const cleaned = text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  return unescapeMarkdownPunctuation(cleaned);
}

function normalizeStatementLine(line: string) {
  return cleanInlineMarkdown(
    line
      .replace(/^[-*+]\s+/, "")
      .replace(/^\d+\.\s+/, "")
      .replace(/^>\s+/, "")
      .trim(),
  );
}

function extractStatements(markdownBody: string) {
  const lines = normalizeNewlines(markdownBody).split("\n");
  const out: string[] = [];
  const seen = new Set<string>();

  let inCode = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("```")) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    if (line.length === 0) continue;
    if (line.startsWith("#")) continue;
    if (line === "---") continue;
    if (isMarkdownTableSeparatorRow(line)) continue;
    if (line.startsWith("|")) continue;

    const normalized = normalizeStatementLine(line);
    if (normalized.length < 18) continue;
    if (normalized.length > 240) continue;

    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(normalized);
  }

  return out;
}

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], rnd: () => number) {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rnd() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

type TermDef = { term: string; definition: string };

function extractTermDefinitions(markdownBody: string): TermDef[] {
  const lines = normalizeNewlines(markdownBody).split("\n");
  const out: TermDef[] = [];
  const seen = new Set<string>();

  for (const rawLine of lines) {
    const raw = rawLine.trim();
    if (raw.length === 0) continue;
    if (raw.startsWith("#")) continue;
    if (raw === "---") continue;
    if (raw.startsWith("|")) continue;
    if (isMarkdownTableSeparatorRow(raw)) continue;

    const line = raw.replace(/^[-*+]\s+/, "").trim();
    const mBold = /^\*\*([^*]{2,80})\*\*\s*[—-]\s*(.+)$/.exec(line);
    const mPlain = /^([A-Za-z0-9][A-Za-z0-9 /()&+._:-]{1,80})\s*[—-]\s*(.+)$/.exec(line);
    const term = cleanInlineMarkdown((mBold?.[1] ?? mPlain?.[1] ?? "").trim()).replace(/:$/, "").trim();
    if (term.length < 3 || term.length > 60) continue;

    const definitionRaw = (mBold?.[2] ?? mPlain?.[2] ?? "").trim();
    const definition = cleanInlineMarkdown(definitionRaw).slice(0, 220);
    if (definition.length < 12) continue;

    const key = term.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ term, definition });
  }

  return out;
}

function toChoices(choices: string[]): [string, string, string, string] {
  if (choices.length !== 4) {
    throw new Error(`Invalid choices length: ${choices.length}`);
  }
  return [choices[0]!, choices[1]!, choices[2]!, choices[3]!];
}

function generatePracticeQuestionsForModule(args: {
  moduleId: string;
  moduleTitle: string;
  combinedBody: string;
  statementPool: string[];
  unitTitles: string[];
  unitTitlePool: string[];
  desiredCount?: number;
}): PracticeQuestion[] {
  const { moduleId, moduleTitle, combinedBody, statementPool, unitTitles, unitTitlePool } = args;
  const desiredCount = args.desiredCount ?? 2;

  const rnd = mulberry32(hashSeed(moduleId));

  const moduleStatements = extractStatements(combinedBody);
  const moduleStatementsSet = new Set(moduleStatements.map((s) => s.toLowerCase()));
  const otherStatements = statementPool.filter((s) => !moduleStatementsSet.has(s.toLowerCase()));

  const termDefs = extractTermDefinitions(combinedBody);
  const shuffledTermDefs = shuffle(termDefs, rnd);
  const shuffledModuleStatements = shuffle(moduleStatements, rnd);
  const shuffledOtherStatements = shuffle(otherStatements, rnd);

  const questions: PracticeQuestion[] = [];

  const tryDefinitionQuestion = () => {
    if (shuffledTermDefs.length < 4) return false;
    const picked = shuffledTermDefs.splice(0, 4);
    const correct = picked[0]!;
    const distractors = picked.slice(1);
    const all = shuffle([correct, ...distractors], rnd);
    const answerIndex = all.findIndex((x) => x.term === correct.term) as 0 | 1 | 2 | 3;
    questions.push({
      prompt: `According to the notes, what best describes "${correct.term}"?`,
      choices: toChoices(all.map((x) => x.definition)),
      answerIndex,
      explanation: `Notes: ${correct.term} — ${correct.definition}`,
    });
    return true;
  };

  const tryStatementQuestion = () => {
    if (shuffledModuleStatements.length < 1) return false;
    if (shuffledOtherStatements.length < 3) return false;

    const correct = shuffledModuleStatements.shift()!;
    const distractors = shuffledOtherStatements.splice(0, 3);
    const all = shuffle([correct, ...distractors], rnd);
    const answerIndex = all.findIndex((x) => x === correct) as 0 | 1 | 2 | 3;
    questions.push({
      prompt: `Which statement appears in the "${moduleTitle}" module notes?`,
      choices: toChoices(all),
      answerIndex,
      explanation: `This module’s notes include: ${correct}`,
    });
    return true;
  };

  const tryUnitTitleQuestion = () => {
    if (unitTitles.length === 0) return false;
    const pool = unitTitlePool.filter((t) => !unitTitles.includes(t));
    if (pool.length < 3) return false;

    const correct = shuffle(unitTitles, rnd)[0]!;
    const distractors = shuffle(pool, rnd).slice(0, 3);
    const all = shuffle([correct, ...distractors], rnd);
    const answerIndex = all.findIndex((x) => x === correct) as 0 | 1 | 2 | 3;
    questions.push({
      prompt: `Which topic is included as a unit in the "${moduleTitle}" module?`,
      choices: toChoices(all),
      answerIndex,
      explanation: `This module includes a unit titled: ${correct}`,
    });
    return true;
  };

  while (questions.length < desiredCount) {
    if (tryDefinitionQuestion()) continue;
    if (tryStatementQuestion()) continue;
    if (tryUnitTitleQuestion()) continue;
    break;
  }

  return questions.slice(0, desiredCount);
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
  statementPool: string[];
  unitTitlePool: string[];
}) {
  const { domain, prefix, title, unitTitles, sectionBodies, unitMarkdown, usedTitles, statementPool, unitTitlePool } = args;

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
    practiceQuestions: generatePracticeQuestionsForModule({
      moduleId,
      moduleTitle: title,
      combinedBody,
      statementPool,
      unitTitles,
      unitTitlePool,
      desiredCount: 2,
    }),
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
  const statementPool = (() => {
    const all = Object.values(sectionBodies).flatMap((b) => extractStatements(b));
    const seen = new Set<string>();
    const deduped: string[] = [];
    for (const s of all) {
      const k = s.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      deduped.push(s);
    }
    return deduped;
  })();
  const unitTitlePool = Object.keys(sectionBodies);
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

  addModuleWithUnits({
    domain: overview,
    prefix: "overview-",
    title: "Start Here",
    unitTitles: ["Study Guide Intro", "Exam Logistics", "Domain Weightings", "AWS Global Infrastructure"],
    sectionBodies,
    unitMarkdown,
    usedTitles,
    statementPool,
    unitTitlePool,
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
      statementPool,
      unitTitlePool,
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
    statementPool,
    unitTitlePool,
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
    statementPool,
    unitTitlePool,
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
    statementPool,
    unitTitlePool,
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
    statementPool,
    unitTitlePool,
  });

  addModuleWithUnits({
    domain: domain2,
    prefix: "d2-",
    title: "Compute Platforms",
    unitTitles: ["Containers on AWS", "Serverless Technologies", "Elastic Beanstalk"],
    sectionBodies,
    unitMarkdown,
    usedTitles,
    statementPool,
    unitTitlePool,
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
    statementPool,
    unitTitlePool,
  });

  addModuleWithUnits({
    domain: domain3,
    prefix: "d3-",
    title: "Compute & Networking Performance",
    unitTitles: ["Compute for High Performance", "Networking for High Performance", "HPC (High Performance Computing)"],
    sectionBodies,
    unitMarkdown,
    usedTitles,
    statementPool,
    unitTitlePool,
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
    statementPool,
    unitTitlePool,
  });

  addModuleWithUnits({
    domain: domain4,
    prefix: "d4-",
    title: "Cost Optimization",
    unitTitles: ["Cost Management Tools", "Cost Optimization Patterns"],
    sectionBodies,
    unitMarkdown,
    usedTitles,
    statementPool,
    unitTitlePool,
  });

  addModuleWithUnits({
    // Exam domains are the primary grouping (Domains 1-4).
    // These services show up across domains, but they fit best under security/governance.
    domain: domain1,
    prefix: "ops-",
    title: "Monitoring, Audit & Governance",
    unitTitles: ["CloudWatch", "CloudTrail", "AWS Config"],
    sectionBodies,
    unitMarkdown,
    usedTitles,
    statementPool,
    unitTitlePool,
  });

  // Anything we failed to categorize still shows up instead of vanishing.
  const allSectionTitles = Object.keys(sectionBodies);
  const remaining = allSectionTitles.filter((t) => !usedTitles.has(t) && sectionBodies[t]?.trim().length);
  if (remaining.length) {
    addModuleWithUnits({
      // Keep every note discoverable, but avoid creating a non-domain category in the UI.
      // If something is truly "misc", it's still exam-relevant and we tuck it under Domain 1.
      domain: domain1,
      prefix: "extra-",
      title: "Unsorted Notes",
      unitTitles: remaining,
      sectionBodies,
      unitMarkdown,
      usedTitles,
      statementPool,
      unitTitlePool,
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
