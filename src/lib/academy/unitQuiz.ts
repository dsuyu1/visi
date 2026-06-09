import "server-only";

import type { PracticeQuestion } from "@/lib/academy/types";

type TermDef = { term: string; definition: string };

export type UnitQuizSource = {
  key: string;
  title: string;
  markdown: string;
};

function normalizeNewlines(input: string) {
  return input.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function unescapeMarkdownPunctuation(text: string) {
  return text.replace(/\\([\\`*_{}\[\]()#+\-.!|])/g, "$1");
}

function isMarkdownTableSeparatorRow(line: string) {
  if (!line.includes("|")) return false;
  const compact = line.replace(/[|\s]/g, "");
  return compact.length > 0 && /^[-:]+$/.test(compact);
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
    const term = cleanInlineMarkdown((mBold?.[1] ?? mPlain?.[1] ?? "").trim())
      .replace(/:$/, "")
      .trim();
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

function toChoices(choices: string[]): [string, string, string, string] {
  if (choices.length !== 4) {
    throw new Error(`Invalid choices length: ${choices.length}`);
  }
  return [choices[0]!, choices[1]!, choices[2]!, choices[3]!];
}

function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function generateQuizQuestionsForUnit(args: {
  unitKey: string;
  unitTitle: string;
  markdown: string;
  statementPool: string[];
  termDefPool: TermDef[];
  unitTitlePool: string[];
  desiredCount: number;
}): PracticeQuestion[] {
  const desiredCount = clampInt(args.desiredCount, 2, 4);
  const rnd = mulberry32(hashSeed(args.unitKey));

  const unitStatements = extractStatements(args.markdown);
  const unitStatementsSet = new Set(unitStatements.map((s) => s.toLowerCase()));
  const otherStatements = args.statementPool.filter((s) => !unitStatementsSet.has(s.toLowerCase()));

  const unitTermDefs = extractTermDefinitions(args.markdown);
  const unitTermsSet = new Set(unitTermDefs.map((t) => t.term.toLowerCase()));
  const otherTermDefs = args.termDefPool.filter((t) => !unitTermsSet.has(t.term.toLowerCase()));

  const statements = shuffle(unitStatements, rnd);
  const otherStatementsShuffled = shuffle(otherStatements, rnd);
  const termDefs = shuffle(unitTermDefs, rnd);
  const otherTermDefsShuffled = shuffle(otherTermDefs, rnd);

  const questions: PracticeQuestion[] = [];

  const tryDefinitionQuestion = () => {
    if (termDefs.length < 1) return false;
    if (otherTermDefsShuffled.length < 3) return false;
    const correct = termDefs.shift()!;
    const distractors = otherTermDefsShuffled.splice(0, 3);
    const all = shuffle([correct, ...distractors], rnd);
    const answerIndex = all.findIndex((x) => x.term === correct.term) as 0 | 1 | 2 | 3;
    questions.push({
      prompt: `In "${args.unitTitle}", what best describes "${correct.term}"?`,
      choices: toChoices(all.map((x) => x.definition)),
      answerIndex,
      explanation: `Notes: ${correct.term} — ${correct.definition}`,
    });
    return true;
  };

  const tryTermQuestion = () => {
    if (termDefs.length < 1) return false;
    if (otherTermDefsShuffled.length < 3) return false;
    const correct = termDefs.shift()!;
    const distractors = otherTermDefsShuffled.splice(0, 3);
    const all = shuffle([correct, ...distractors], rnd);
    const answerIndex = all.findIndex((x) => x.term === correct.term) as 0 | 1 | 2 | 3;
    questions.push({
      prompt: `Which term matches this definition from "${args.unitTitle}"? ${correct.definition}`,
      choices: toChoices(all.map((x) => x.term)),
      answerIndex,
      explanation: `Notes: ${correct.term} — ${correct.definition}`,
    });
    return true;
  };

  const tryStatementQuestion = () => {
    if (statements.length < 1) return false;
    if (otherStatementsShuffled.length < 3) return false;
    const correct = statements.shift()!;
    const distractors = otherStatementsShuffled.splice(0, 3);
    const all = shuffle([correct, ...distractors], rnd);
    const answerIndex = all.findIndex((x) => x === correct) as 0 | 1 | 2 | 3;
    questions.push({
      prompt: `Which statement appears in the "${args.unitTitle}" unit notes?`,
      choices: toChoices(all),
      answerIndex,
      explanation: `This unit’s notes include: ${correct}`,
    });
    return true;
  };

  const tryUnitTitleFallbackQuestion = () => {
    const pool = args.unitTitlePool.filter((t) => t !== args.unitTitle);
    if (pool.length < 3) return false;
    const distractors = shuffle(pool, rnd).slice(0, 3);
    const all = shuffle([args.unitTitle, ...distractors], rnd);
    const answerIndex = all.findIndex((x) => x === args.unitTitle) as 0 | 1 | 2 | 3;
    questions.push({
      prompt: "Which topic matches this unit?",
      choices: toChoices(all),
      answerIndex,
      explanation: `You are studying: ${args.unitTitle}`,
    });
    return true;
  };

  while (questions.length < desiredCount) {
    if (tryDefinitionQuestion()) continue;
    if (tryStatementQuestion()) continue;
    if (tryTermQuestion()) continue;
    if (tryUnitTitleFallbackQuestion()) continue;
    break;
  }

  while (questions.length < 2) {
    if (!tryUnitTitleFallbackQuestion()) break;
  }

  return questions.slice(0, desiredCount);
}

function buildStatementPool(sources: UnitQuizSource[]) {
  const all = sources.flatMap((s) => extractStatements(s.markdown));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of all) {
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

function buildTermDefPool(sources: UnitQuizSource[]) {
  const all = sources.flatMap((s) => extractTermDefinitions(s.markdown));
  const seen = new Set<string>();
  const out: TermDef[] = [];
  for (const td of all) {
    const key = td.term.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(td);
  }
  return out;
}

function buildUnitTitlePool(sources: UnitQuizSource[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of sources) {
    const title = s.title.trim();
    if (!title) continue;
    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(title);
  }
  return out;
}

export function buildUnitQuizQuestions(
  sources: UnitQuizSource[],
  options?: { desiredCount?: number },
): Record<string, PracticeQuestion[]> {
  const desiredCount = clampInt(options?.desiredCount ?? 3, 2, 4);
  const statementPool = buildStatementPool(sources);
  const termDefPool = buildTermDefPool(sources);
  const unitTitlePool = buildUnitTitlePool(sources);

  const out: Record<string, PracticeQuestion[]> = {};
  for (const unit of sources) {
    out[unit.key] = generateQuizQuestionsForUnit({
      unitKey: unit.key,
      unitTitle: unit.title,
      markdown: unit.markdown,
      statementPool,
      termDefPool,
      unitTitlePool,
      desiredCount,
    });
  }

  return out;
}

