type YouTubeVideoItem = {
  id: string;
  snippet?: {
    title?: string;
    description?: string;
    channelTitle?: string;
    publishedAt?: string;
    tags?: string[];
    categoryId?: string;
  };
};

type YouTubeSearchItem = {
  id?: {
    videoId?: string;
  };
};

export type KeewerdTrendCard = {
  videoId: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  description: string;
  tags: string[];
  url: string;
};

export type YouTubeTrendResponse = {
  source: "youtube";
  mode: "mostPopular" | "topicSearch";
  query: string;
  regionCode: string;
  videoCategoryId: string;
  fetchedAt: string;
  items: KeewerdTrendCard[];
  extractedKeywords: string[];
};

const YOUTUBE_VIDEOS_API = "https://www.googleapis.com/youtube/v3/videos";
const YOUTUBE_SEARCH_API = "https://www.googleapis.com/youtube/v3/search";

const STOPWORDS = new Set([
  "http",
  "https",
  "www",
  "com",
  "youtube",
  "youtu",
  "watch",
  "video",
  "videos",
  "official",
  "shorts",
  "music",
  "trailer",
  "season",
  "episode",
  "with",
  "this",
  "that",
  "from",
  "your",
  "into",
  "just",
  "have",
  "what",
  "when",
  "where",
  "will",
  "best",
  "more",
  "about",
  "they",
  "them",
  "their",
  "than",
  "then",
  "there",
  "were",
  "been",
  "also",
  "only",
  "really",
  "make",
  "made",
  "making",
  "after",
  "before",
  "over",
  "under",
  "visualizer",
  "subscribe",
]);

const REGION_TO_LANGUAGE: Record<string, string> = {
  US: "en",
  CA: "en",
  GB: "en",
  AU: "en",
};

function requireApiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    throw new Error("Missing YOUTUBE_API_KEY in .env.local");
  }
  return key;
}

function stripUrls(text: string): string {
  return text.replace(/https?:\/\/\S+|www\.\S+/gi, " ");
}

function normalizeKeyword(text: string): string[] {
  return stripUrls(text)
    .toLowerCase()
    .replace(/[^\w\s#-]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => {
      if (!word) return false;
      if (word.length < 4) return false;
      if (/^\d+$/.test(word)) return false;
      if (STOPWORDS.has(word)) return false;
      return true;
    });
}

function extractKeywords(items: KeewerdTrendCard[], topic?: string): string[] {
  const counts = new Map<string, number>();
  const topicWords = normalizeKeyword(topic ?? "");

  for (const item of items) {
    const sourceWords = [
      ...normalizeKeyword(item.title),
      ...normalizeKeyword(item.description),
      ...item.tags.flatMap((tag) => normalizeKeyword(tag)),
    ];

    for (const word of sourceWords) {
      const weight = topicWords.some(
        (topicWord) =>
          word.includes(topicWord) || topicWord.includes(word)
      )
        ? 3
        : 1;

      counts.set(word, (counts.get(word) ?? 0) + weight);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}

function mapVideoItems(items: YouTubeVideoItem[]): KeewerdTrendCard[] {
  return items.map((item) => ({
    videoId: item.id,
    title: item.snippet?.title ?? "Untitled",
    channelTitle: item.snippet?.channelTitle ?? "Unknown channel",
    publishedAt: item.snippet?.publishedAt ?? "",
    description: item.snippet?.description ?? "",
    tags: item.snippet?.tags ?? [],
    url: `https://www.youtube.com/watch?v=${item.id}`,
  }));
}

async function fetchVideoDetailsByIds(ids: string[]): Promise<KeewerdTrendCard[]> {
  if (!ids.length) return [];

  const apiKey = requireApiKey();

  const params = new URLSearchParams({
    key: apiKey,
    part: "snippet",
    id: ids.join(","),
    fields:
      "items(id,snippet(title,description,channelTitle,publishedAt,tags,categoryId))",
  });

  const res = await fetch(`${YOUTUBE_VIDEOS_API}?${params.toString()}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`YouTube video hydrate error ${res.status}: ${errorText}`);
  }

  const data = (await res.json()) as { items?: YouTubeVideoItem[] };
  const mapped = mapVideoItems(data.items ?? []);

  const byId = new Map(mapped.map((item) => [item.videoId, item]));
  return ids.map((id) => byId.get(id)).filter(Boolean) as KeewerdTrendCard[];
}

export async function fetchYouTubeMostPopular(options?: {
  regionCode?: string;
  videoCategoryId?: string;
  maxResults?: number;
}): Promise<YouTubeTrendResponse> {
  const apiKey = requireApiKey();

  const regionCode = options?.regionCode ?? "US";
  const videoCategoryId = options?.videoCategoryId ?? "0";
  const maxResults = options?.maxResults ?? 12;

  const params = new URLSearchParams({
    key: apiKey,
    part: "snippet",
    chart: "mostPopular",
    regionCode,
    videoCategoryId,
    maxResults: String(maxResults),
    fields:
      "items(id,snippet(title,description,channelTitle,publishedAt,tags,categoryId))",
  });

  const res = await fetch(`${YOUTUBE_VIDEOS_API}?${params.toString()}`, {
    next: { revalidate: 1800 },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`YouTube API error ${res.status}: ${errorText}`);
  }

  const data = (await res.json()) as { items?: YouTubeVideoItem[] };
  const items = mapVideoItems(data.items ?? []);

  return {
    source: "youtube",
    mode: "mostPopular",
    query: "",
    regionCode,
    videoCategoryId,
    fetchedAt: new Date().toISOString(),
    items,
    extractedKeywords: extractKeywords(items),
  };
}

export async function fetchYouTubeByTopic(options: {
  topic: string;
  regionCode?: string;
  videoCategoryId?: string;
  maxResults?: number;
}): Promise<YouTubeTrendResponse> {
  const apiKey = requireApiKey();

  const topic = options.topic.trim();
  const regionCode = options.regionCode ?? "US";
  const videoCategoryId = options.videoCategoryId ?? "0";
  const maxResults = options.maxResults ?? 12;
  const relevanceLanguage = REGION_TO_LANGUAGE[regionCode] ?? "en";

  const searchParams = new URLSearchParams({
    key: apiKey,
    part: "snippet",
    type: "video",
    q: topic,
    order: "relevance",
    regionCode,
    relevanceLanguage,
    maxResults: String(maxResults),
    safeSearch: "moderate",
  });

  const searchRes = await fetch(`${YOUTUBE_SEARCH_API}?${searchParams.toString()}`, {
    next: { revalidate: 3600 },
  });

  if (!searchRes.ok) {
    const errorText = await searchRes.text();
    throw new Error(`YouTube topic search error ${searchRes.status}: ${errorText}`);
  }

  const searchData = (await searchRes.json()) as { items?: YouTubeSearchItem[] };
  const ids = (searchData.items ?? [])
    .map((item) => item.id?.videoId)
    .filter(Boolean) as string[];

  const items = await fetchVideoDetailsByIds(ids);

  return {
    source: "youtube",
    mode: "topicSearch",
    query: topic,
    regionCode,
    videoCategoryId,
    fetchedAt: new Date().toISOString(),
    items,
    extractedKeywords: extractKeywords(items, topic),
  };
}