import { NextRequest, NextResponse } from "next/server";
import { getSimilar, getRecommendations } from "@/lib/tmdb";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const id = Number(searchParams.get("id"));
  const type = (searchParams.get("type") || "movie") as "movie" | "tv";
  const page = Number(searchParams.get("page") || "1");

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    // Fetch both similar and recommendations, merge and dedupe
    const [similar, recs] = await Promise.all([
      getSimilar(id, type, page),
      getRecommendations(id, type, page),
    ]);

    const seen = new Set<number>();
    const merged = [];
    for (const item of [...(recs.results || []), ...(similar.results || [])]) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        merged.push({ ...item, media_type: type });
      }
    }

    return NextResponse.json({
      results: merged,
      total_pages: Math.max(similar.total_pages || 1, recs.total_pages || 1),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
