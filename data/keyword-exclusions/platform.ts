export const PLATFORM_EXACT_EXCLUSIONS: Record<string, Set<string>> = {
  youtube: new Set([
    "most popular",
    "topic search",
    "category",
    "region",
    "youtube shorts",
    "youtube video",
  ]),
};

export const PLATFORM_FORMAT_TERMS: Record<string, string[]> = {
  youtube: [
    "video essay",
    "character study",
    "breakdown",
    "explained",
    "analysis",
    "review",
    "reaction",
    "commentary",
    "edit",
    "amv",
    "short film",
    "documentary",
    "recap",
    "comparison",
    "ranking",
    "deep dive",
  ],
};