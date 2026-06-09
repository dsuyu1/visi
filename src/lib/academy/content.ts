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
} from "@/lib/academy/types";
import { parseSaaC03Notes } from "@/lib/academy/notesParser";
import { parseNcpAiolNotes } from "@/lib/academy/notesParserNcpAiol";

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
};

const getParsedCertification = cache(async (certId: string): Promise<ParsedCertification> => {
  const meta = await getCertificationMetadata(certId);

  const notesPath = path.join(academyRoot(), certId, meta.notesFile);
  const notes = await fs.readFile(notesPath, "utf8");

  switch (certId) {
    case "aws-saa-c03":
      return parseSaaC03Notes(notes);
    case "nvidia-ncp-aiol":
      return parseNcpAiolNotes(notes);
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

  return { academyModule, unit, markdown };
}
