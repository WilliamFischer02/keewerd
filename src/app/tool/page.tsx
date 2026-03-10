"use client";

import { useState } from "react";

type TrendItem = {
  videoId: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  description: string;
  tags: string[];
  url: string;
};

type TrendResponse = {
  source: "youtube";
  mode: "mostPopular" | "topicSearch";
  query: string;
  regionCode: string;
  videoCategoryId: string;
  fetchedAt: string;
  items: TrendItem[];
  extractedKeywords: string[];
};

const categoryOptions = [
  { label: "All categories", value: "0" },
  { label: "Music", value: "10" },
  { label: "Gaming", value: "20" },
  { label: "Film & Animation", value: "1" },
  { label: "Sports", value: "17" },
  { label: "People & Blogs", value: "22" },
];

function titleCase(input: string): string {
  return input
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function cleanKeyword(keyword: string): string {
  return keyword
    .replace(/https?|www|com/gi, "")
    .replace(/[^\w\s#-]/g, "")
    .trim();
}

function hashtagify(words: string[]): string[] {
  return words
    .map((word) => cleanKeyword(word))
    .filter((word) => word.length >= 3)
    .slice(0, 5)
    .map((word) => `#${word.replace(/\s+/g, "")}`);
}

function pickKeywords(keywords: string[], topic: string): string[] {
  const cleanedTopic = topic.toLowerCase().trim();
  const topicWords = cleanedTopic.split(/\s+/).filter(Boolean);

  const usable = keywords
    .map(cleanKeyword)
    .filter((word) => word && word.length >= 4);

  if (!cleanedTopic) {
    return usable.slice(0, 5);
  }

  const overlapping = usable.filter((keyword) =>
    topicWords.some(
      (topicWord) =>
        keyword.toLowerCase().includes(topicWord) ||
        topicWord.includes(keyword.toLowerCase())
    )
  );

  const merged = [...overlapping, ...usable];
  return [...new Set(merged)].slice(0, 5);
}

function buildHook(topic: string, tone: string, primaryKeyword: string): string {
  const displayTopic = titleCase(topic || "Your Topic");
  const displayTone = titleCase(tone);
  const displayKeyword = titleCase(primaryKeyword || "");

  if (displayKeyword && topic) {
    return `${displayKeyword} ${displayTopic}`;
  }

  if (topic) {
    return `${displayTone} ${displayTopic}`;
  }

  return displayKeyword || `${displayTone} Video`;
}

function buildTitleIdeas(
  topic: string,
  tone: string,
  creatorName: string,
  videoFormat: string,
  keywords: string[]
): string[] {
  const displayTopic = titleCase(topic || "Your Topic");
  const displayTone = titleCase(tone);
  const displayCreator = creatorName.trim() || "[USERNAME]";
  const displayFormat = videoFormat.trim() || "Video";
  const picked = pickKeywords(keywords, topic);
  const primaryKeyword = picked[0] || "";
  const secondaryKeyword = picked[1] || "";
  const hook = buildHook(topic, tone, primaryKeyword);

  const templates = [
    `${hook} | ${displayCreator} | ${displayFormat}`,
    `${displayTopic}: ${displayTone} ${displayFormat} | ${displayCreator}`,
    `${displayTopic} but ${titleCase(
      secondaryKeyword || primaryKeyword || tone
    )} Changes Everything | ${displayFormat}`,
    `Why ${displayTopic} Hits So Hard | ${displayCreator} | ${displayFormat}`,
    `${titleCase(primaryKeyword || displayTopic)} ${displayFormat} | ${displayCreator}`,
    `${displayTone} ${displayFormat} for ${displayTopic} | ${displayCreator}`,
  ];

  return [...new Set(templates.map((t) => t.trim()).filter(Boolean))];
}

function buildDescriptionIdeas(
  topic: string,
  tone: string,
  creatorName: string,
  videoFormat: string,
  keywords: string[]
): string[] {
  const displayTopic = topic.trim() || "your topic";
  const displayTone = tone.toLowerCase();
  const displayFormat = (videoFormat.trim() || "video").toLowerCase();
  const displayCreator = creatorName.trim() || "[USERNAME]";
  const picked = pickKeywords(keywords, topic);
  const keywordLine = picked.length ? picked.join(", ") : "trend signals, creator strategy, publishing ideas";
  const hashtags = hashtagify([displayTopic, ...picked]).join(" ");

  const seoFirst = `${titleCase(displayTopic)} ${displayFormat} with a ${displayTone} angle focused on ${keywordLine}.

This ${displayFormat} is built for viewers interested in ${displayTopic}, ${keywordLine}, and creator-friendly packaging ideas.

🔗 Links / sponsor / gear:
[PRIMARY LINK]
[SECONDARY LINK]

⏱ Chapters:
00:00 Intro
00:00 Main section
00:00 Outro

Created by ${displayCreator}
${hashtags}`.trim();

  const creatorFirst = `A ${displayTone} ${displayFormat} built around ${displayTopic}.

Expect ${keywordLine}, a clear visual angle, and a streamlined format designed to help viewers understand the topic quickly.

📌 Credits / links / CTA:
[SUBSCRIBE CTA]
[COLLAB / SPONSOR LINK]
[MORE FROM ${displayCreator}]

${hashtags}`.trim();

  return [seoFirst, creatorFirst];
}

export default function ToolPage() {
  const [regionCode, setRegionCode] = useState("US");
  const [videoCategoryId, setVideoCategoryId] = useState("0");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Cinematic");
  const [creatorName, setCreatorName] = useState("");
  const [videoFormat, setVideoFormat] = useState("Edit");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<TrendResponse | null>(null);
  const [editableTitles, setEditableTitles] = useState<string[]>([]);
  const [editableDescriptions, setEditableDescriptions] = useState<string[]>([]);

  async function handleGenerate() {
    setLoading(true);
    setError("");

    try {
      const topicParam = topic.trim()
        ? `&topic=${encodeURIComponent(topic.trim())}`
        : "";

      const res = await fetch(
        `/api/youtube/trends?regionCode=${regionCode}&videoCategoryId=${videoCategoryId}${topicParam}`
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Failed to fetch YouTube trends");
      }

      setData(json);

      const keywords = json.extractedKeywords ?? [];

      setEditableTitles(
        buildTitleIdeas(topic, tone, creatorName, videoFormat, keywords)
      );

      setEditableDescriptions(
        buildDescriptionIdeas(topic, tone, creatorName, videoFormat, keywords)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setData(null);
      setEditableTitles([]);
      setEditableDescriptions([]);
    } finally {
      setLoading(false);
    }
  }

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
  }

  function updateTitle(index: number, value: string) {
    setEditableTitles((prev) => prev.map((item, i) => (i === index ? value : item)));
  }

  function updateDescription(index: number, value: string) {
    setEditableDescriptions((prev) =>
      prev.map((item, i) => (i === index ? value : item))
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-black">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
            Keewerd Tool
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            YouTube trend helper
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
            Topic-aware keyword extraction plus editable title and description drafts.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="text-lg font-semibold">Inputs</h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Platform</label>
                <select
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                  defaultValue="YouTube"
                  disabled
                >
                  <option>YouTube</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Region</label>
                <select
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                  value={regionCode}
                  onChange={(e) => setRegionCode(e.target.value)}
                >
                  <option value="US">US</option>
                  <option value="CA">CA</option>
                  <option value="GB">GB</option>
                  <option value="AU">AU</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Category</label>
                <select
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                  value={videoCategoryId}
                  onChange={(e) => setVideoCategoryId(e.target.value)}
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Tone</label>
                <select
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  <option>Cinematic</option>
                  <option>Hype</option>
                  <option>Educational</option>
                  <option>Funny</option>
                  <option>Dramatic</option>
                  <option>Professional</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Topic / subject</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Example: car edit, horror short, phonk drift reel"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Creator / username</label>
                <input
                  type="text"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder="Example: BingusTheWizard"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Video type / genre</label>
                <input
                  type="text"
                  value={videoFormat}
                  onChange={(e) => setVideoFormat(e.target.value)}
                  placeholder="Example: Edit, Breakdown, AMV, Short Film"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Generate suggestions"}
              </button>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}
            </div>
          </aside>

          <section className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="text-lg font-semibold">Trend keywords</h2>
              <p className="mt-2 text-sm text-gray-600">
                Source mode: {data?.mode === "topicSearch" ? "topic-aware YouTube search" : "YouTube mostPopular chart"}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {data?.extractedKeywords?.length ? (
                  data.extractedKeywords.map((keyword) => (
                    <button
                      key={keyword}
                      onClick={() => copyText(keyword)}
                      className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                    >
                      {keyword}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    Run a search to populate keywords.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="text-lg font-semibold">Editable title starters</h2>
              <p className="mt-2 text-sm text-gray-600">
                Curated packaging templates filled with current topic-aware keywords.
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {editableTitles.length ? (
                  editableTitles.map((title, index) => (
                    <div
                      key={`title-${index}`}
                      className="rounded-xl border border-gray-200 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">Title variant {index + 1}</h3>
                        <button
                          onClick={() => copyText(title)}
                          className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium"
                        >
                          Copy
                        </button>
                      </div>

                      <textarea
                        value={title}
                        onChange={(e) => updateTitle(index, e.target.value)}
                        rows={3}
                        className="mt-3 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm leading-6 text-gray-700"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    Run a search to populate editable title ideas.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="text-lg font-semibold">Editable description drafts</h2>
              <p className="mt-2 text-sm text-gray-600">
                Structured for discoverability, links, and optional chapters.
              </p>

              <div className="mt-4 grid gap-4">
                {editableDescriptions.length ? (
                  editableDescriptions.map((description, index) => (
                    <div
                    key={`description-${index}`}
                    className="rounded-xl border border-gray-200 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">
                          Description variant {index + 1}
                        </h3>
                        <button
                          onClick={() => copyText(description)}
                          className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium"
                        >
                          Copy
                        </button>
                      </div>

                      <textarea
                        value={description}
                        onChange={(e) => updateDescription(index, e.target.value)}
                        rows={10}
                        className="mt-3 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm leading-6 text-gray-700"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    Run a search to populate editable description drafts.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="text-lg font-semibold">Popular videos used as reference titles</h2>

              <div className="mt-4 space-y-3">
                {data?.items?.length ? (
                  data.items.slice(0, 6).map((item) => (
                    <div
                      key={item.videoId}
                      className="rounded-xl border border-gray-200 p-4"
                    >
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium underline"
                      >
                        {item.title}
                      </a>
                      <p className="mt-1 text-sm text-gray-600">{item.channelTitle}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    Reference titles will appear here after a search.
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}