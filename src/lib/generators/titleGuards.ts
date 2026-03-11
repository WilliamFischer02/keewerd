import {
  dedupeStrings,
  hasHeavyRepeatedWords,
  normalizeWhitespace,
  overlapCount,
  removeEmptySeparators,
  wordsForComparison,
} from "@/lib/utils/text";

function cleanTitleCandidate(candidate: string): string {
  return removeEmptySeparators(
    candidate
      .replace(/\s+\|\s+\|/g, " | ")
      .replace(/^[:|\-\s]+|[:|\-\s]+$/g, "")
      .replace(/\s{2,}/g, " ")
  );
}

function isMalformedTitle(candidate: string, subject: string): boolean {
  const cleaned = cleanTitleCandidate(candidate);
  if (!cleaned) return true;
  if (cleaned.length < 6) return true;
  if (hasHeavyRepeatedWords(cleaned)) return true;

  const words = wordsForComparison(cleaned);
  if (words.length >= 3 && new Set(words).size <= Math.max(1, words.length - 2)) {
    return true;
  }

  if (subject && overlapCount(cleaned, subject) >= 2) {
    const cleanedWords = wordsForComparison(cleaned);
    const subjectWords = wordsForComparison(subject);
    const cleanedUnique = new Set(cleanedWords);

    if (subjectWords.length >= 2 && cleanedUnique.size <= subjectWords.length + 1) {
      return true;
    }
  }

  return false;
}

export function applyTitleGuards(options: {
  candidates: string[];
  fallbackCandidates: string[];
  subject: string;
  maxItems?: number;
}): {
  titles: string[];
  removedTitles: string[];
} {
  const maxItems = options.maxItems ?? 6;
  const removedTitles: string[] = [];

  const validPrimary = dedupeStrings(options.candidates)
    .map(cleanTitleCandidate)
    .filter((candidate) => {
      const invalid = isMalformedTitle(candidate, options.subject);
      if (invalid) {
        removedTitles.push(candidate);
        return false;
      }

      return true;
    });

  const validFallback = dedupeStrings(options.fallbackCandidates)
    .map(cleanTitleCandidate)
    .filter((candidate) => {
      const invalid = isMalformedTitle(candidate, options.subject);
      if (invalid) {
        removedTitles.push(candidate);
        return false;
      }

      return true;
    });

  const titles = dedupeStrings([...validPrimary, ...validFallback])
    .map((title) => normalizeWhitespace(title))
    .slice(0, maxItems);

  const finalTitles = titles.length
    ? titles
    : [`${options.subject} | Video`, `Understanding ${options.subject}`];

  return {
    titles: finalTitles,
    removedTitles: dedupeStrings(removedTitles),
  };
}