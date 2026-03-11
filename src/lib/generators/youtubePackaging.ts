import {
  classifyContent,
  PackagingInput,
} from "@/lib/generators/contentClassifier";
import { buildYouTubeDescriptions } from "@/lib/generators/descriptionTemplates";
import { filterTagCandidates } from "@/lib/generators/tagFilters";
import { groupRankedTags } from "@/lib/generators/tagGroups";
import { rankTagCandidates } from "@/lib/generators/tagRanker";
import { buildYouTubeTitleCandidates } from "@/lib/generators/titleTemplates";
import { applyTitleGuards } from "@/lib/generators/titleGuards";
import { dedupeStrings } from "@/lib/utils/text";

export type ReferenceTrendItem = {
  videoId: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  description: string;
  tags: string[];
  url: string;
};

export type YouTubePackagingResult = {
  titles: string[];
  descriptions: string[];
  keywordChips: string[];
  tags: {
    coreTopicTags: string[];
    formatAngleTags: string[];
    adjacentDiscoveryTags: string[];
  };
  debug: {
    classified: ReturnType<typeof classifyContent>;
    removedTitles: string[];
    removedTags: string[];
  };
};

export function buildYouTubePackaging(options: {
  topic: string;
  tone: string;
  creatorName: string;
  videoFormat: string;
  extractedKeywords: string[];
  items: ReferenceTrendItem[];
}): YouTubePackagingResult {
  const input: PackagingInput = {
    platform: "youtube",
    topic: options.topic,
    tone: options.tone,
    creatorName: options.creatorName,
    videoFormat: options.videoFormat,
    extractedKeywords: options.extractedKeywords,
    referenceTitles: options.items.map((item) => item.title),
    referenceTags: options.items.flatMap((item) => item.tags ?? []),
  };

  const classified = classifyContent(input);

  const titleCandidates = buildYouTubeTitleCandidates(classified);
  const guardedTitles = applyTitleGuards({
    candidates: titleCandidates.primary,
    fallbackCandidates: titleCandidates.fallback,
    subject: classified.subject,
    maxItems: 6,
  });

  const filteredTags = filterTagCandidates({
    platform: input.platform,
    topic: input.topic,
    videoFormat: input.videoFormat,
    extractedKeywords: input.extractedKeywords,
    referenceTitles: input.referenceTitles,
    referenceTags: input.referenceTags,
  });

  const rankedTags = rankTagCandidates({
    candidates: filteredTags.candidates,
    topic: input.topic,
    videoFormat: input.videoFormat,
  });

  const groupedTags = groupRankedTags(rankedTags);
  const topTags = dedupeStrings([
    ...groupedTags.coreTopicTags,
    ...groupedTags.formatAngleTags,
    ...groupedTags.adjacentDiscoveryTags,
  ]);

  return {
    titles: guardedTitles.titles,
    descriptions: buildYouTubeDescriptions({
      content: classified,
      topTags,
    }),
    keywordChips: topTags.slice(0, 12),
    tags: groupedTags,
    debug: {
      classified,
      removedTitles: guardedTitles.removedTitles,
      removedTags: filteredTags.removedTags,
    },
  };
}