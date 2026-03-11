"use client";

import { useState } from "react";
import {
  buildYouTubePackaging,
  ReferenceTrendItem,
  YouTubePackagingResult,
} from "@/lib/generators/youtubePackaging";

type TrendResponse = {
  source: "youtube";
  mode: "mostPopular" | "topicSearch";
  query: string;
  regionCode: string;
  videoCategoryId: string;
  fetchedAt: string;
  items: ReferenceTrendItem[];
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

const isDevelopment = process.env.NODE_ENV !== "production";

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
  const [packaging, setPackaging] = useState<YouTubePackagingResult | null>(null);
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

      const nextPackaging = buildYouTubePackaging({
        topic,
        tone,
        creatorName,
        videoFormat,
        extractedKeywords: json.extractedKeywords ?? [],
        items: json.items ?? [],
      });

      setPackaging(nextPackaging);
      setEditableTitles(nextPackaging.titles);
      setEditableDescriptions(nextPackaging.descriptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setData(null);
      setPackaging(null);
      setEditableTitles([]);
      setEditableDescriptions([]);
    } finally {
      setLoading(false);
    }
  }

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
  }

  function copyList(values: string[]) {
    navigator.clipboard.writeText(values.join(", "));
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
            Topic-aware keyword extraction with cleaner title logic, structured descriptions,
            and a first dedicated tag bundle output.
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
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setRegionCode(e.target.value)
                  }
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
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setVideoCategoryId(e.target.value)
                  }
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
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setTone(e.target.value)
                  }
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTopic(e.target.value)
                  }
                  placeholder="Example: Tony Soprano video essay, brother prank, phonk drift edit"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Creator / username</label>
                <input
                  type="text"
                  value={creatorName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCreatorName(e.target.value)
                  }
                  placeholder="Example: BingusTheWizard"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Used in description drafts, not forced into every title.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Video type / genre</label>
                <input
                  type="text"
                  value={videoFormat}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setVideoFormat(e.target.value)
                  }
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
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Trend keywords</h2>
                  <p className="mt-2 text-sm text-gray-600">
                    Source mode:{" "}
                    {data?.mode === "topicSearch"
                      ? "topic-aware YouTube search"
                      : "YouTube mostPopular chart"}
                  </p>
                </div>

                {packaging?.keywordChips?.length ? (
                  <button
                    onClick={() => copyList(packaging.keywordChips)}
                    className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium"
                  >
                    Copy all
                  </button>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {packaging?.keywordChips?.length ? (
                  packaging.keywordChips.map((keyword) => (
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
                    Run a search to populate cleaner keyword chips.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="text-lg font-semibold">Editable title starters</h2>
              <p className="mt-2 text-sm text-gray-600">
                Routed through slot-based templates with repetition guards and fallback titles.
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {editableTitles.length ? (
                  editableTitles.map((title, index) => (
                    <div
                      key={`title-${index}`}
                      className="rounded-xl border border-gray-200 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
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
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          updateTitle(index, e.target.value)
                        }
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
                Generated from the same classified signal layer so the titles and descriptions
                stop fighting each other.
              </p>

              <div className="mt-4 grid gap-4">
                {editableDescriptions.length ? (
                  editableDescriptions.map((description, index) => (
                    <div
                      key={`description-${index}`}
                      className="rounded-xl border border-gray-200 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
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
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          updateDescription(index, e.target.value)
                        }
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
              <h2 className="text-lg font-semibold">Tag bundles</h2>
              <p className="mt-2 text-sm text-gray-600">
                Filtered, ranked, deduplicated, and grouped so the output is less junky and more
                strategic.
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {[
                  {
                    label: "Core topic tags",
                    values: packaging?.tags.coreTopicTags ?? [],
                  },
                  {
                    label: "Format / angle tags",
                    values: packaging?.tags.formatAngleTags ?? [],
                  },
                  {
                    label: "Adjacent discovery tags",
                    values: packaging?.tags.adjacentDiscoveryTags ?? [],
                  },
                ].map((group) => (
                  <div key={group.label} className="rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold">{group.label}</h3>
                      {group.values.length ? (
                        <button
                          onClick={() => copyList(group.values)}
                          className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium"
                        >
                          Copy all
                        </button>
                      ) : null}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {group.values.length ? (
                        group.values.map((tag) => (
                          <button
                            key={`${group.label}-${tag}`}
                            onClick={() => copyText(tag)}
                            className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                          >
                            {tag}
                          </button>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No tags yet.</p>
                      )}
                    </div>
                  </div>
                ))}
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

            {isDevelopment && packaging ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-5">
                <h2 className="text-lg font-semibold">Debug notes</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Keep this visible in development while you test odd edge cases. Tiny goblin trap
                  detector.
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-gray-200 p-4">
                    <h3 className="text-sm font-semibold">Classified slots</h3>
                    <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-5 text-gray-700">
                      {JSON.stringify(packaging.debug.classified, null, 2)}
                    </pre>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-4">
                    <h3 className="text-sm font-semibold">Removed titles</h3>
                    <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-5 text-gray-700">
                      {JSON.stringify(packaging.debug.removedTitles, null, 2)}
                    </pre>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-4">
                    <h3 className="text-sm font-semibold">Removed tags</h3>
                    <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-5 text-gray-700">
                      {JSON.stringify(packaging.debug.removedTags, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </section>
    </main>
  );
}