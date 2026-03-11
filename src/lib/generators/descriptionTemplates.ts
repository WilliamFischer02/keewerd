import { ClassifiedContent } from "@/lib/generators/contentClassifier";
import { buildHashtag, dedupeStrings, titleCase } from "@/lib/utils/text";

export function buildYouTubeDescriptions(options: {
  content: ClassifiedContent;
  topTags: string[];
}): string[] {
  const { content, topTags } = options;
  const keywordLine = topTags.length
    ? topTags.slice(0, 6).join(", ")
    : [content.subject, content.primaryKeyword, content.formatLabel]
        .filter(Boolean)
        .join(", ");

  const hashtags = dedupeStrings([
    buildHashtag(content.subject),
    buildHashtag(content.primaryKeyword),
    buildHashtag(content.formatLabel),
    ...topTags.slice(0, 3).map((tag) => buildHashtag(tag)),
  ])
    .filter(Boolean)
    .slice(0, 5)
    .join(" ");

  const creatorCredit = content.creatorName
    ? `Created by ${content.creatorName}`
    : "Created with Keewerd";
  const formatLine = `${titleCase(content.subject)} ${content.formatLabel.toLowerCase()} with a ${content.toneDescriptor} angle focused on ${keywordLine}.`;

  const seoFirst = `${formatLine}

This upload is aimed at viewers looking for ${keywordLine}, with a structure built to make ${content.subject} easy to follow.

🔗 Links / sponsor / gear:
[PRIMARY LINK]
[SECONDARY LINK]

⏱ Chapters:
00:00 Intro
00:00 Main section
00:00 Outro

${creatorCredit}
${hashtags}`.trim();

  const creatorFirst = `${titleCase(content.subject)} with a ${content.toneDescriptor} ${content.formatLabel.toLowerCase()} approach.

Expect ${keywordLine}, a strong opening hook, and a format that gets to the point without losing the vibe.

📌 Credits / links / CTA:
[SUBSCRIBE CTA]
[COLLAB / SPONSOR LINK]
[MORE FROM THIS CREATOR]

${creatorCredit}
${hashtags}`.trim();

  return dedupeStrings([seoFirst, creatorFirst]);
}