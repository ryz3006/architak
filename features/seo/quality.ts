export type SeoQualityCheck = {
  id: string;
  label: string;
  score: number;
  weight: number;
  hint?: string;
};

export type SeoQualityResult = {
  score: number;
  grade: "Excellent" | "Good" | "Needs Work" | "Poor";
  checks: SeoQualityCheck[];
};

function lengthScore(value: string, optimalMin: number, optimalMax: number, okMin: number, okMax: number): number {
  const len = value.trim().length;
  if (len >= optimalMin && len <= optimalMax) return 100;
  if (len >= okMin && len <= okMax) return 70;
  if (len === 0) return 0;
  if (len < okMin) return Math.max(10, Math.round((len / okMin) * 50));
  return Math.max(10, Math.round((okMax / len) * 50));
}

export function scoreSeoEntry(input: {
  title: string | null | undefined;
  description: string | null | undefined;
  canonicalUrl?: string | null;
  robots?: string | null;
  openGraph?: unknown;
  allTitles?: string[];
  allDescriptions?: string[];
}): SeoQualityResult {
  const title = input.title?.trim() ?? "";
  const description = input.description?.trim() ?? "";
  const og =
    input.openGraph && typeof input.openGraph === "object" && !Array.isArray(input.openGraph)
      ? (input.openGraph as Record<string, unknown>)
      : {};

  const checks: SeoQualityCheck[] = [
    {
      id: "title_length",
      label: "Title length",
      weight: 15,
      score: lengthScore(title, 50, 60, 30, 70),
      hint: title.length ? `${title.length} chars` : "Missing title",
    },
    {
      id: "description_length",
      label: "Description length",
      weight: 15,
      score: lengthScore(description, 120, 160, 80, 200),
      hint: description.length ? `${description.length} chars` : "Missing description",
    },
    {
      id: "title_brand",
      label: "Title has brand",
      weight: 5,
      score: /architak/i.test(title) ? 100 : 40,
    },
    {
      id: "description_location",
      label: "Description has location",
      weight: 5,
      score: /kochi|kerala/i.test(description) ? 100 : 40,
    },
    {
      id: "canonical",
      label: "Canonical URL",
      weight: 10,
      score: input.canonicalUrl ? 100 : 60,
      hint: input.canonicalUrl ? undefined : "Optional — defaults to page URL",
    },
    {
      id: "og_title",
      label: "OG title",
      weight: 10,
      score: typeof og.title === "string" || title ? 100 : 0,
    },
    {
      id: "og_description",
      label: "OG description",
      weight: 10,
      score: typeof og.description === "string" || description ? 100 : 0,
    },
    {
      id: "og_type",
      label: "OG type",
      weight: 5,
      score: typeof og.type === "string" || true ? 100 : 0,
    },
    {
      id: "robots",
      label: "Robots not blocking",
      weight: 10,
      score: input.robots && /noindex/i.test(input.robots) ? 0 : 100,
    },
    {
      id: "unique_title",
      label: "Unique title",
      weight: 10,
      score:
        input.allTitles && title
          ? input.allTitles.filter((t) => t === title).length <= 1
            ? 100
            : 20
          : 100,
    },
    {
      id: "unique_description",
      label: "Unique description",
      weight: 5,
      score:
        input.allDescriptions && description
          ? input.allDescriptions.filter((d) => d === description).length <= 1
            ? 100
            : 20
          : 100,
    },
  ];

  const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0);
  const weighted = checks.reduce((sum, c) => sum + c.score * c.weight, 0);
  const score = Math.round(weighted / totalWeight);
  const grade =
    score >= 90 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Needs Work" : "Poor";

  return { score, grade, checks };
}
