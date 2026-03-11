const MEANINGLESS_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "how",
  "in",
  "into",
  "is",
  "it",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
  "your",
]);

export function stripUrls(input: string): string {
  return input.replace(/https?:\/\/\S+|www\.\S+/gi, " ");
}

export function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

export function sanitizePhrase(input: string): string {
  return normalizeWhitespace(
    stripUrls(input)
      .replace(/[\[\]{}<>]/g, " ")
      .replace(/["“”‘’]/g, "")
      .replace(/[|]+/g, " | ")
      .replace(/[/:]+/g, " ")
      .replace(/[()]+/g, " ")
      .replace(/[^\w\s#&'+-]/g, " ")
  );
}

export function toComparisonKey(input: string): string {
  return sanitizePhrase(input)
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function titleCase(input: string): string {
  return normalizeWhitespace(input)
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      if (word.toUpperCase() === word && word.length <= 4) {
        return word;
      }

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export function wordsForComparison(input: string): string[] {
  return toComparisonKey(input)
    .split(/\s+/)
    .filter((word) => word.length >= 3 && !MEANINGLESS_WORDS.has(word));
}

export function dedupeStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const value of values) {
    const normalized = normalizeWhitespace(value);
    if (!normalized) continue;

    const key = toComparisonKey(normalized);
    if (!key || seen.has(key)) continue;

    seen.add(key);
    output.push(normalized);
  }

  return output;
}

export function removeEmptySeparators(input: string): string {
  return normalizeWhitespace(
    input
      .replace(/\s*\|\s*\|+/g, " | ")
      .replace(/^\|\s*|\s*\|$/g, "")
      .replace(/\s*:\s*:\s*/g, ": ")
      .replace(/\s*-\s*-\s*/g, " - ")
      .replace(/\s+\|\s+/g, " | ")
      .replace(/\s+:\s+/g, ": ")
      .replace(/\s+-\s+/g, " - ")
  );
}

export function hasHeavyRepeatedWords(input: string): boolean {
  const meaningfulWords = wordsForComparison(input);

  if (meaningfulWords.length < 3) {
    return false;
  }

  const counts = new Map<string, number>();

  for (const word of meaningfulWords) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  const repeatedWordCount = [...counts.values()].filter((count) => count >= 2).length;
  return repeatedWordCount >= 1;
}

export function overlapCount(a: string, b: string): number {
  const aWords = new Set(wordsForComparison(a));
  const bWords = new Set(wordsForComparison(b));

  let count = 0;
  for (const word of aWords) {
    if (bWords.has(word)) {
      count += 1;
    }
  }

  return count;
}

export function buildHashtag(input: string): string {
  const compact = sanitizePhrase(input).replace(/\s+/g, "");
  return compact ? `#${compact}` : "";
}

export function splitIntoSegments(input: string): string[] {
  return sanitizePhrase(input)
    .split(/\s*\|\s*|\s*[-–—:]\s*|\s*[,/]\s*/)
    .map((segment) => normalizeWhitespace(segment))
    .filter(Boolean);
}

export function removeContainedPhrases(values: string[]): string[] {
  return values.filter((value, index) => {
    const key = toComparisonKey(value);
    if (!key) return false;

    return !values.some((other, otherIndex) => {
      if (index === otherIndex) return false;

      const otherKey = toComparisonKey(other);
      if (!otherKey || otherKey === key) return false;

      return otherKey.includes(key) && otherKey.length > key.length + 2;
    });
  });
}