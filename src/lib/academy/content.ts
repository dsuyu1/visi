import "server-only";

import { cache } from "react";
import fs from "node:fs/promises";
import path from "node:path";

import type {
  AcademyCertification,
  AcademyCertificationMetadata,
  AcademyDomain,
  AcademyIndex,
  AcademyModule,
  AcademyUnit,
  PracticeQuestion,
} from "@/lib/academy/types";
import { parseSaaC03Notes } from "@/lib/academy/notesParser";
import { parseNcpAiolNotes } from "@/lib/academy/notesParserNcpAiol";
import { buildUnitQuizQuestions, type UnitQuizSource } from "@/lib/academy/unitQuiz";

function academyRoot() {
  return path.join(process.cwd(), "content", "academy");
}

async function readJsonFile<T>(absolutePath: string): Promise<T> {
  const raw = await fs.readFile(absolutePath, "utf8");
  return JSON.parse(raw) as T;
}

export const getAcademyIndex = cache(async (): Promise<AcademyIndex> => {
  return readJsonFile<AcademyIndex>(path.join(academyRoot(), "index.json"));
});

const getCertificationMetadata = cache(
  async (certId: string): Promise<AcademyCertificationMetadata> => {
    return readJsonFile<AcademyCertificationMetadata>(
      path.join(academyRoot(), certId, "certification.json"),
    );
  },
);

type ParsedCertification = {
  domains: AcademyDomain[];
  unitMarkdown: Record<string, string>;
  unitQuizQuestions: Record<string, PracticeQuestion[]>;
};

const getParsedCertification = cache(async (certId: string): Promise<ParsedCertification> => {
  const meta = await getCertificationMetadata(certId);

  const notesPath = path.join(academyRoot(), certId, meta.notesFile);
  const notes = await fs.readFile(notesPath, "utf8");

  const sourcesFor = (parsed: { domains: AcademyDomain[]; unitMarkdown: Record<string, string> }) => {
    const sources: UnitQuizSource[] = [];
    for (const domain of parsed.domains) {
      for (const academyModule of domain.modules) {
        for (const unit of academyModule.units) {
          const key = `${academyModule.id}::${unit.id}`;
          const markdown = parsed.unitMarkdown[key];
          if (!markdown) continue;
          sources.push({ key, title: unit.title, markdown });
        }
      }
    }
    return sources;
  };

  switch (certId) {
    case "aws-saa-c03":
      {
        const parsed = parseSaaC03Notes(notes);
        const unitQuizQuestions = buildUnitQuizQuestions(sourcesFor(parsed), { desiredCount: 3 });
        return { ...parsed, unitQuizQuestions };
      }
    case "nvidia-ncp-aiol":
      {
        const parsed = parseNcpAiolNotes(notes);
        const unitQuizQuestions = buildUnitQuizQuestions(sourcesFor(parsed), { desiredCount: 3 });
        return { ...parsed, unitQuizQuestions };
      }
    default:
      throw new Error(`Unknown certification: ${certId}`);
  }
});

export const getCertification = cache(async (certId: string): Promise<AcademyCertification> => {
  const meta = await getCertificationMetadata(certId);
  const parsed = await getParsedCertification(certId);
  return { ...meta, domains: parsed.domains };
});

export async function getModule(
  certId: string,
  moduleId: string,
): Promise<AcademyModule | null> {
  const parsed = await getParsedCertification(certId);
  for (const domain of parsed.domains) {
    const match = domain.modules.find((m) => m.id === moduleId);
    if (match) return match;
  }
  return null;
}

export async function getUnit(
  certId: string,
  moduleId: string,
  unitId: string,
): Promise<
  | {
      academyModule: AcademyModule;
      unit: AcademyUnit;
      markdown: string;
      quizQuestions: PracticeQuestion[];
    }
  | null
> {
  const parsed = await getParsedCertification(certId);
  const academyModule = await getModule(certId, moduleId);
  if (!academyModule) return null;

  const unit = academyModule.units.find((u) => u.id === unitId);
  if (!unit) return null;

  const markdown = parsed.unitMarkdown[`${academyModule.id}::${unit.id}`];
  if (!markdown) return null;

  const quizDisabledForSection = academyModule.id.startsWith("overview-");
  const quizQuestions = quizDisabledForSection
    ? []
    : (parsed.unitQuizQuestions[`${academyModule.id}::${unit.id}`] ?? []);

  return { academyModule, unit, markdown, quizQuestions };
}
