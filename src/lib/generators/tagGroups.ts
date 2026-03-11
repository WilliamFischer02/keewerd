import { RankedTag } from "@/lib/generators/tagRanker";
import { dedupeStrings } from "@/lib/utils/text";

export type TagGroups = {
  coreTopicTags: string[];
  formatAngleTags: string[];
  adjacentDiscoveryTags: string[];
};

const FORMAT_OR_ANGLE_PATTERN =
  /\b(video essay|character study|breakdown|explained|analysis|review|reaction|commentary|edit|amv|short film|documentary|recap|comparison|ranking|deep dive)\b/i;

export function groupRankedTags(tags: RankedTag[]): TagGroups {
  const coreTopicTags: string[] = [];
  const formatAngleTags: string[] = [];
  const adjacentDiscoveryTags: string[] = [];

  for (const tag of tags) {
    if (FORMAT_OR_ANGLE_PATTERN.test(tag.phrase)) {
      formatAngleTags.push(tag.phrase);
      continue;
    }

    if (coreTopicTags.length < 6) {
      coreTopicTags.push(tag.phrase);
      continue;
    }

    adjacentDiscoveryTags.push(tag.phrase);
  }

  return {
    coreTopicTags: dedupeStrings(coreTopicTags).slice(0, 6),
    formatAngleTags: dedupeStrings(formatAngleTags).slice(0, 6),
    adjacentDiscoveryTags: dedupeStrings(adjacentDiscoveryTags).slice(0, 6),
  };
}