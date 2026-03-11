import { PLATFORM_FORMAT_TERMS } from "../../../data/keyword-exclusions/platform";
import {
  dedupeStrings,
  removeContainedPhrases,
  sanitizePhrase,
  splitIntoSegments,
  titleCase,
  toComparisonKey,
} from "@/lib/utils/text";

export type PackagingPlatform = "youtube";

export type PackagingInput = {
  platform: PackagingPlatform;
  topic: string;
  tone: string;
  creatorName: string;
  videoFormat: string;
  extractedKeywords: string[];
  referenceTitles: string[];
  referenceTags: string[];
};

export type ClassifiedContent = {
  platform: PackagingPlatform;
  topic: string;
  tone: string;
  creatorName: string;
  subject: string;
  primaryKeyword: string;
  secondaryKeyword: string;
  formatLabel: string;
  angle: string;
  actionPhrase: string;
  toneDescriptor: string;
  phrasePool: string[];
};

const FORMAT_FALLBACKS = [
  "Video Essay",
  "Breakdown",
  "Edit",
  "Analysis",
  "Review",
  "Commentary",
  "Short Film",
  "Recap",
  "Character Study",
];

const TONE_TO_DESCRIPTOR: Record<string, string> = {
  cinematic: "cinematic",
  hype: "high-energy",
  educational: "clear",
  funny: "playful",
  dramatic: "dramatic",
  professional: "clean",
};

const TONE_TO_ANGLE: Record<string, string> = {
  cinematic: "hits harder than it should",
  hype: "goes way harder than expected",
  educational: "explained simply",
  funny: "gets absurd fast",
  dramatic: "changes the whole story",
  professional: "broken down clearly",
};

function collectPhrasePool(input: PackagingInput): string[] {
  const raw = [
    input.topic,
    input.videoFormat,
    ...input.extractedKeywords,
    ...input.referenceTags,
    ...input.referenceTitles.flatMap((title) => splitIntoSegments(title)),
  ]
    .map((value) => sanitizePhrase(value))
    .filter(Boolean)
    .filter((value) => value.length >= 3);

  return removeContainedPhrases(dedupeStrings(raw)).slice(0, 40);
}

function detectFormatLabel(
  platform: PackagingPlatform,
  topic: string,
  videoFormat: string,
  phrasePool: string[]
): string {
  const candidateSource = [videoFormat, topic, ...phrasePool].join(" | ").toLowerCase();
  const knownFormats = PLATFORM_FORMAT_TERMS[platform] ?? [];

  const matched = knownFormats.find((format) => candidateSource.includes(format));
  if (matched) {
    return titleCase(matched);
  }

  const fallback = FORMAT_FALLBACKS.find((format) =>
    candidateSource.includes(format.toLowerCase())
  );

  return fallback ?? titleCase(videoFormat.trim() || "Video");
}

function deriveSubject(topic: string, videoFormat: string): string {
  const comparisonFormat = toComparisonKey(videoFormat);

  const cleaned =
    sanitizePhrase(topic)
      .split(
        /\b(?:explained|breakdown|analysis|review|reaction|video essay|edit|amv|short film|recap|commentary)\b/i
      )
      .map((part) => part.trim())
      .filter(Boolean)[0] ?? sanitizePhrase(topic);

  const stripped = comparisonFormat
    ? cleaned.replace(new RegExp(comparisonFormat, "ig"), " ")
    : cleaned;

  const normalized = stripped.replace(/\b(video|youtube|shorts|short)\b/gi, " ").trim();
  return titleCase(normalized || topic || "Your Topic");
}

function pickKeyword(phrasePool: string[], subject: string, exclude: string[] = []): string {
  const subjectKey = toComparisonKey(subject);
  const excluded = new Set(exclude.map((item) => toComparisonKey(item)));

  const found = phrasePool.find((phrase) => {
    const key = toComparisonKey(phrase);
    if (!key || excluded.has(key)) return false;
    if (key === subjectKey) return false;
    if (subjectKey && key.includes(subjectKey)) return false;
    if (subjectKey && subjectKey.includes(key)) return false;
    return true;
  });

  return titleCase(found ?? "");
}

function deriveActionPhrase(topic: string, subject: string): string {
  const source = toComparisonKey(topic);

  if (source.includes("prank")) {
    return `Pranking ${subject}`;
  }

  if (source.includes("explained")) {
    return `${subject}, Explained`;
  }

  if (source.includes("review")) {
    return `Reviewing ${subject}`;
  }

  if (source.includes("breakdown") || source.includes("analysis")) {
    return `Breaking Down ${subject}`;
  }

  return "";
}

export function classifyContent(input: PackagingInput): ClassifiedContent {
  const phrasePool = collectPhrasePool(input);
  const subject = deriveSubject(input.topic, input.videoFormat);
  const formatLabel = detectFormatLabel(
    input.platform,
    input.topic,
    input.videoFormat,
    phrasePool
  );
  const primaryKeyword = pickKeyword(phrasePool, subject, [formatLabel]);
  const secondaryKeyword = pickKeyword(phrasePool, subject, [formatLabel, primaryKeyword]);
  const toneKey = input.tone.trim().toLowerCase();

  return {
    platform: input.platform,
    topic: input.topic.trim(),
    tone: input.tone.trim(),
    creatorName: input.creatorName.trim(),
    subject,
    primaryKeyword,
    secondaryKeyword,
    formatLabel,
    angle: TONE_TO_ANGLE[toneKey] ?? "worth paying attention to",
    actionPhrase: deriveActionPhrase(input.topic, subject),
    toneDescriptor: TONE_TO_DESCRIPTOR[toneKey] ?? "clear",
    phrasePool,
  };
}