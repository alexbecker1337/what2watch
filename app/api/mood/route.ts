import { NextRequest, NextResponse } from "next/server";
import { discoverByMood, discoverTVByMood } from "@/lib/tmdb";
import { MOODS } from "@/lib/moods";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const moodId = searchParams.get("mood");
  const mediaType = searchParams.get("type") || "movie";
  const page = Number(searchParams.get("page") || "1");

  const mood = MOODS.find((m) => m.id === moodId);
  if (!mood) {
    return NextResponse.json({ error: "Unknown mood" }, { status: 400 });
  }

  try {
    let data;
    if (mediaType === "tv") {
      data = await discoverTVByMood(mood.tvGenres, mood.sortBy, page);
    } else {
      data = await discoverByMood(mood.movieGenres, mood.sortBy, page);
    }
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
