import { ClassifiedContent } from "@/lib/generators/contentClassifier";
import { dedupeStrings, titleCase } from "@/lib/utils/text";

type TemplateBuilder = (content: ClassifiedContent) => string;

const YOUTUBE_TEMPLATE_BUILDERS: TemplateBuilder[] = [
  (content) => `${content.subject} | ${content.formatLabel}`,
  (content) => `Why ${content.subject} ${content.angle}`,
  (content) =>
    content.primaryKeyword
      ? `The ${titleCase(content.primaryKeyword)} of ${content.subject}`
      : "",
  (content) =>
    content.secondaryKeyword
      ? `${content.subject} vs ${titleCase(content.secondaryKeyword)}`
      : "",
  (content) =>
    content.primaryKeyword
      ? `${content.subject}: ${titleCase(content.primaryKeyword)}`
      : "",
  (content) =>
    content.actionPhrase
      ? `${content.actionPhrase} | ${content.formatLabel}`
      : "",
  (content) => `Understanding ${content.subject} | ${content.formatLabel}`,
  (content) =>
    content.primaryKeyword
      ? `${titleCase(content.primaryKeyword)} ${content.formatLabel}`
      : `${content.subject} ${content.formatLabel}`,
  (content) =>
    content.secondaryKeyword
      ? `${content.subject} but ${titleCase(content.secondaryKeyword)} changes everything`
      : "",
];

export function buildYouTubeTitleCandidates(content: ClassifiedContent): {
  primary: string[];
  fallback: string[];
} {
  const primary = dedupeStrings(
    YOUTUBE_TEMPLATE_BUILDERS.map((builder) => builder(content)).filter(Boolean)
  );

  const fallback = dedupeStrings([
    `${content.subject} | ${content.formatLabel}`,
    `Understanding ${content.subject}`,
    content.primaryKeyword ? `${content.subject}: ${content.primaryKeyword}` : "",
    content.actionPhrase || "",
    content.subject,
  ]);

  return { primary, fallback };
}