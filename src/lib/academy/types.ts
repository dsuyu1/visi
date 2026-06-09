export type AcademyIndex = {
  certifications: AcademyCertificationSummary[];
};

export type AcademyCertificationSummary = {
  id: string;
  title: string;
  provider: string;
  level: string;
  code?: string;
  description: string;
};

export type AcademyCertificationMetadata = {
  id: string;
  title: string;
  provider: string;
  level: string;
  code?: string;
  description: string;
  recommendedExperience?: string[];
  /** Markdown file used as the source of truth for generating modules/units */
  notesFile: string;
};

export type AcademyCertification = AcademyCertificationMetadata & {
  domains: AcademyDomain[];
};

export type AcademyDomain = {
  id: string;
  title: string;
  weightPercent?: number;
  modules: AcademyModule[];
};

export type AcademyModule = {
  id: string;
  title: string;
  description: string;
  estimatedMinutes?: number;
  objectives?: string[];
  units: AcademyUnit[];
};

export type AcademyUnit = {
  id: string;
  title: string;
  estimatedMinutes?: number;
};
