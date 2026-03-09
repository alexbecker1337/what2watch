import { NextRequest, NextResponse } from "next/server";
import { getSimilar, getRecommendations, type Movie } from "@/lib/tmdb";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = Number(searchParams.get("page") || "1");

  // Multi-seed support: ids=id1,id2 & types=movie,tv
  // Falls back to legacy single id/type params
  const idsParam = searchParams.get("ids");
  const typesParam = searchParams.get("types");
  const singleId = searchParams.get("id");
  const singleType = (searchParams.get("type") || "movie") as "movie" | "tv";

  let seeds: { id: number; type: "movie" | "tv" }[];

  if (idsParam && typesParam) {
    const ids = idsParam.split(",").map(Number).filter(Boolean);
    const types = typesParam.split(",") as ("movie" | "tv")[];
    seeds = ids.map((id, i) => ({ id, type: types[i] || "movie" }));
  } else if (singleId) {
    seeds = [{ id: Number(singleId), type: singleType }];
  } else {
    return NextResponse.json({ error: "Missing id or ids" }, { status: 400 });
  }

  try {
    // Fetch similar + recommendations for each seed in parallel
    const allResultSets = await Promise.all(
      seeds.map(({ id, type }) =>
        Promise.all([
          getSimilar(id, type, page),
          getRecommendations(id, type, page),
        ]).then(([similar, recs]) => ({
          type,
          items: [...(recs.results || []), ...(similar.results || [])],
          total_pages: Math.max(similar.total_pages || 1, recs.total_pages || 1),
        }))
      )
    );

    // Score by frequency across seeds: items appearing in more seeds rank higher
    const scoreMap = new Map<number, { item: Movie; score: number }>();
    for (const { type, items } of allResultSets) {
      for (const item of items) {
        const existing = scoreMap.get(item.id);
        if (existing) {
          existing.score += 1;
        } else {
          scoreMap.set(item.id, {
            item: { ...item, media_type: type },
            score: 1,
          });
        }
      }
    }

    // Sort by score desc, then dedupe
    const merged = Array.from(scoreMap.values())
      .sort((a, b) => b.score - a.score)
      .map((v) => v.item);

    const maxPages = Math.max(...allResultSets.map((r) => r.total_pages));

    return NextResponse.json({
      results: merged,
      total_pages: maxPages,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
