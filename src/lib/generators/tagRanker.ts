import { TagCandidate } from "@/lib/generators/tagFilters";
import { overlapCount, toComparisonKey, wordsForComparison } from "@/lib/utils/text";

export type RankedTag = TagCandidate & {
  score: number;
};

export function rankTagCandidates(options: {
  candidates: TagCandidate[];
  topic: string;
  videoFormat: string;
}): RankedTag[] {
  const topicKey = toComparisonKey(options.topic);
  const formatKey = toComparisonKey(options.videoFormat);

  return options.candidates
    .map((candidate) => {
      const wordCount = wordsForComparison(candidate.phrase).length;
      let score = 0;

      if (candidate.source === "topic") score += 8;
      if (candidate.source === "tag") score += 6;
      if (candidate.source === "title") score += 4;
      if (candidate.source === "keyword") score += 3;
      if (candidate.source === "format") score += 2;

      if (wordCount >= 2) score += 4;
      if (wordCount >= 3) score += 2;
      if (topicKey && overlapCount(candidate.phrase, options.topic) >= 1) score += 5;
      if (formatKey && overlapCount(candidate.phrase, options.videoFormat) >= 1) score += 2;
      if (
        /\b(vs|explained|breakdown|analysis|review|commentary|essay|study)\b/i.test(
          candidate.phrase
        )
      ) {
        score += 3;
      }

      return {
        ...candidate,
        score,
      };
    })
    .sort((a, b) => b.score - a.score || a.phrase.localeCompare(b.phrase));
}