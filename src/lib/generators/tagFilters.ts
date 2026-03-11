import {
  GENERIC_LOW_SIGNAL_FORMAT_WORDS,
  GLOBAL_EXACT_EXCLUSIONS,
  GLOBAL_SUBSTRING_EXCLUSIONS,
} from "../../../data/keyword-exclusions/global";
import { PLATFORM_EXACT_EXCLUSIONS } from "../../../data/keyword-exclusions/platform";
import {
  dedupeStrings,
  sanitizePhrase,
  splitIntoSegments,
  titleCase,
  toComparisonKey,
  wordsForComparison,
} from "@/lib/utils/text";

export type TagCandidateSource = "topic" | "keyword" | "title" | "tag" | "format";

export type TagCandidate = {
  phrase: string;
  normalized: string;
  source: TagCandidateSource;
};

function shouldRejectPhrase(phrase: string, platform: string): boolean {
  const normalized = toComparisonKey(phrase);
  if (!normalized) return true;
  if (normalized.length < 3) return true;
  if (/^\d+$/.test(normalized)) return true;
  if (GLOBAL_EXACT_EXCLUSIONS.has(normalized)) return true;
  if (PLATFORM_EXACT_EXCLUSIONS[platform]?.has(normalized)) return true;
  if ([...GLOBAL_SUBSTRING_EXCLUSIONS].some((part) => normalized.includes(part))) return true;

  const words = wordsForComparison(normalized);
  if (!words.length) return true;
  if (words.length === 1 && GENERIC_LOW_SIGNAL_FORMAT_WORDS.has(words[0])) return true;

  return false;
}

function collectRawCandidates(input: {
  platform: string;
  topic: string;
  videoFormat: string;
  extractedKeywords: string[];
  referenceTitles: string[];
  referenceTags: string[];
}): TagCandidate[] {
  const titleSegments = input.referenceTitles.flatMap((title) => splitIntoSegments(title));

  const raw: TagCandidate[] = [
    { phrase: input.topic, normalized: toComparisonKey(input.topic), source: "topic" },
    { phrase: input.videoFormat, normalized: toComparisonKey(input.videoFormat), source: "format" },
    ...input.extractedKeywords.map((phrase) => ({
      phrase,
      normalized: toComparisonKey(phrase),
      source: "keyword" as const,
    })),
    ...titleSegments.map((phrase) => ({
      phrase,
      normalized: toComparisonKey(phrase),
      source: "title" as const,
    })),
    ...input.referenceTags.map((phrase) => ({
      phrase,
      normalized: toComparisonKey(phrase),
      source: "tag" as const,
    })),
  ];

  return raw
    .map((item) => ({
      ...item,
      phrase: titleCase(sanitizePhrase(item.phrase)),
      normalized: toComparisonKey(item.phrase),
    }))
    .filter((item) => item.phrase.length >= 3);
}

export function filterTagCandidates(input: {
  platform: string;
  topic: string;
  videoFormat: string;
  extractedKeywords: string[];
  referenceTitles: string[];
  referenceTags: string[];
}): {
  candidates: TagCandidate[];
  removedTags: string[];
} {
  const removedTags: string[] = [];
  const rawCandidates = collectRawCandidates(input);

  const unique = new Map<string, TagCandidate>();

  for (const candidate of rawCandidates) {
    if (shouldRejectPhrase(candidate.phrase, input.platform)) {
      removedTags.push(candidate.phrase);
      continue;
    }

    const normalized = candidate.normalized;
    if (!normalized) {
      removedTags.push(candidate.phrase);
      continue;
    }

    const existing = unique.get(normalized);
    if (!existing) {
      unique.set(normalized, candidate);
      continue;
    }

    if (existing.source !== "tag" && candidate.source === "tag") {
      unique.set(normalized, candidate);
    }
  }

  const candidates = [...unique.values()].filter((candidate) => {
    const comparison = candidate.normalized;

    const isWeakerSubset = [...unique.values()].some((other) => {
      if (other.normalized === comparison) return false;
      if (other.normalized.length <= comparison.length) return false;

      return other.normalized.includes(comparison);
    });

    if (isWeakerSubset && wordsForComparison(candidate.phrase).length === 1) {
      removedTags.push(candidate.phrase);
      return false;
    }

    return true;
  });

  return {
    candidates: dedupeStrings(candidates.map((item) => item.phrase)).map((phrase) => {
      const existing = candidates.find(
        (candidate) => toComparisonKey(candidate.phrase) === toComparisonKey(phrase)
      );
      return (
        existing ?? {
          phrase,
          normalized: toComparisonKey(phrase),
          source: "keyword" as const,
        }
      );
    }),
    removedTags: dedupeStrings(removedTags),
  };
}