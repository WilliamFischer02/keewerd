import { NextRequest, NextResponse } from "next/server";
import {
  fetchYouTubeByTopic,
  fetchYouTubeMostPopular,
} from "@/lib/adapters/youtube";

export const runtime = "nodejs";
export const revalidate = 1800;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const regionCode = searchParams.get("regionCode") ?? "US";
    const videoCategoryId = searchParams.get("videoCategoryId") ?? "0";
    const maxResults = Number(searchParams.get("maxResults") ?? "12");
    const topic = searchParams.get("topic")?.trim() ?? "";

    const data = topic
      ? await fetchYouTubeByTopic({
          topic,
          regionCode,
          videoCategoryId,
          maxResults,
        })
      : await fetchYouTubeMostPopular({
          regionCode,
          videoCategoryId,
          maxResults,
        });

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";

    return NextResponse.json(
      {
        source: "youtube",
        error: true,
        message,
      },
      { status: 500 }
    );
  }
}