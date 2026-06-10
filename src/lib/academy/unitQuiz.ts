import "server-only";

import type { PracticeQuestion } from "@/lib/academy/types";

type TermDef = { term: string; definition: string };
type ArrowPair = { left: string; right: string };

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

function extractArrowPairs(markdownBody: string) {
  const lines = normalizeNewlines(markdownBody).split("\n");
  const out: ArrowPair[] = [];
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
    if (!line.includes("→")) continue;

    const normalized = normalizeStatementLine(line);
    const parts = normalized.split("→").map((p) => p.trim()).filter(Boolean);
    if (parts.length !== 2) continue;
    const left = parts[0]!;
    const right = parts[1]!;
    if (left.length < 8) continue;
    if (right.length < 2) continue;
    if (right.length > 140) continue;

    const key = `${left.toLowerCase()}→${right.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ left, right });
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
  markdown: string;
  termDefPool: TermDef[];
  arrowPairPool: ArrowPair[];
  desiredCount: number;
}): PracticeQuestion[] {
  const desiredCount = clampInt(args.desiredCount, 2, 4);
  const rnd = mulberry32(hashSeed(args.unitKey));

  const unitTermDefs = extractTermDefinitions(args.markdown);
  const unitTermsSet = new Set(unitTermDefs.map((t) => t.term.toLowerCase()));
  const otherTermDefs = args.termDefPool.filter((t) => !unitTermsSet.has(t.term.toLowerCase()));

  const unitArrowPairs = extractArrowPairs(args.markdown);
  const unitArrowKeys = new Set(unitArrowPairs.map((p) => `${p.left.toLowerCase()}→${p.right.toLowerCase()}`));
  const otherArrowPairs = args.arrowPairPool.filter(
    (p) => !unitArrowKeys.has(`${p.left.toLowerCase()}→${p.right.toLowerCase()}`),
  );

  const termDefs = shuffle(unitTermDefs, rnd);
  const otherTermDefsShuffled = shuffle(otherTermDefs, rnd);
  const arrowPairs = shuffle(unitArrowPairs, rnd);
  const otherArrowPairsShuffled = shuffle(otherArrowPairs, rnd);

  const questions: PracticeQuestion[] = [];
  const usedWhatIsTerms = new Set<string>();
  const usedTermMatchTerms = new Set<string>();
  const usedArrowScenario = new Set<string>();
  const usedArrowReverse = new Set<string>();

  const tryWhatIsQuestion = () => {
    if (termDefs.length < 1) return false;
    if (otherTermDefsShuffled.length < 3) return false;
    const correct = termDefs.find((t) => !usedWhatIsTerms.has(t.term.toLowerCase()));
    if (!correct) return false;
    usedWhatIsTerms.add(correct.term.toLowerCase());
    const distractors = shuffle(otherTermDefsShuffled, rnd).slice(0, 3);
    const all = shuffle([correct, ...distractors], rnd);
    const answerIndex = all.findIndex((x) => x.term === correct.term) as 0 | 1 | 2 | 3;
    questions.push({
      prompt: `What is ${correct.term}?`,
      choices: toChoices(all.map((x) => x.definition)),
      answerIndex,
      explanation: `Reference: ${correct.term} — ${correct.definition}`,
    });
    return true;
  };

  const tryTermQuestion = () => {
    if (termDefs.length < 1) return false;
    if (otherTermDefsShuffled.length < 3) return false;
    const correct =
      termDefs.find((t) => {
        const key = t.term.toLowerCase();
        return !usedTermMatchTerms.has(key) && !usedWhatIsTerms.has(key);
      }) ??
      termDefs.find((t) => !usedTermMatchTerms.has(t.term.toLowerCase()));
    if (!correct) return false;
    usedTermMatchTerms.add(correct.term.toLowerCase());
    const distractors = shuffle(otherTermDefsShuffled, rnd).slice(0, 3);
    const all = shuffle([correct, ...distractors], rnd);
    const answerIndex = all.findIndex((x) => x.term === correct.term) as 0 | 1 | 2 | 3;
    questions.push({
      prompt: `Which term matches this definition? ${correct.definition}`,
      choices: toChoices(all.map((x) => x.term)),
      answerIndex,
      explanation: `Reference: ${correct.term} — ${correct.definition}`,
    });
    return true;
  };

  const tryArrowScenarioQuestion = () => {
    if (arrowPairs.length < 1) return false;
    const correct = arrowPairs.find((p) => !usedArrowScenario.has(`${p.left.toLowerCase()}→${p.right.toLowerCase()}`));
    if (!correct) return false;
    const pool = [...arrowPairs, ...otherArrowPairsShuffled].map((p) => p.right);
    const distractors = shuffle(pool.filter((x) => x !== correct.right), rnd).slice(0, 3);
    if (distractors.length < 3) return false;
    usedArrowScenario.add(`${correct.left.toLowerCase()}→${correct.right.toLowerCase()}`);
    const all = shuffle([correct.right, ...distractors], rnd);
    const answerIndex = all.findIndex((x) => x === correct.right) as 0 | 1 | 2 | 3;
    questions.push({
      prompt: `Which option best fits this scenario: ${correct.left}?`,
      choices: toChoices(all),
      answerIndex,
      explanation: `${correct.left} → ${correct.right}`,
    });
    return true;
  };

  const tryArrowReverseQuestion = () => {
    if (arrowPairs.length < 1) return false;
    const correct =
      arrowPairs.find((p) => {
        const key = `${p.left.toLowerCase()}→${p.right.toLowerCase()}`;
        return !usedArrowReverse.has(key) && !usedArrowScenario.has(key);
      }) ??
      arrowPairs.find(
        (p) => !usedArrowReverse.has(`${p.left.toLowerCase()}→${p.right.toLowerCase()}`),
      );
    if (!correct) return false;
    const pool = [...arrowPairs, ...otherArrowPairsShuffled].map((p) => p.left);
    const distractors = shuffle(pool.filter((x) => x !== correct.left), rnd).slice(0, 3);
    if (distractors.length < 3) return false;
    usedArrowReverse.add(`${correct.left.toLowerCase()}→${correct.right.toLowerCase()}`);
    const all = shuffle([correct.left, ...distractors], rnd);
    const answerIndex = all.findIndex((x) => x === correct.left) as 0 | 1 | 2 | 3;
    questions.push({
      prompt: `"${correct.right}" is the right solution for which of the following?`,
      choices: toChoices(all),
      answerIndex,
      explanation: `${correct.left} → ${correct.right}`,
    });
    return true;
  };

  while (questions.length < desiredCount) {
    if (tryWhatIsQuestion()) continue;
    if (tryTermQuestion()) continue;
    if (tryArrowScenarioQuestion()) continue;
    if (tryArrowReverseQuestion()) continue;
    break;
  }

  return questions.slice(0, desiredCount);
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

function buildArrowPairPool(sources: UnitQuizSource[]) {
  const all = sources.flatMap((s) => extractArrowPairs(s.markdown));
  const seen = new Set<string>();
  const out: ArrowPair[] = [];
  for (const p of all) {
    const key = `${p.left.toLowerCase()}→${p.right.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

export function buildUnitQuizQuestions(
  sources: UnitQuizSource[],
  options?: { desiredCount?: number },
): Record<string, PracticeQuestion[]> {
  const desiredCount = clampInt(options?.desiredCount ?? 3, 2, 4);
  const termDefPool = buildTermDefPool(sources);
  const arrowPairPool = buildArrowPairPool(sources);

  const out: Record<string, PracticeQuestion[]> = {};
  for (const unit of sources) {
    out[unit.key] = generateQuizQuestionsForUnit({
      unitKey: unit.key,
      markdown: unit.markdown,
      termDefPool,
      arrowPairPool,
      desiredCount,
    });
  }

  return out;
}
