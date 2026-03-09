import { NextRequest, NextResponse } from "next/server";
import { searchMulti } from "@/lib/tmdb";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const query = searchParams.get("q");

  if (!query) return NextResponse.json({ results: [] });

  try {
    const data = await searchMulti(query);
    // Only return movies and TV shows, skip people
    const filtered = (data.results || []).filter(
      (r: { media_type: string; poster_path: string | null }) =>
        (r.media_type === "movie" || r.media_type === "tv") && r.poster_path
    );
    return NextResponse.json({ results: filtered });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
