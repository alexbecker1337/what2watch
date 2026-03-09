import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY!;

async function tmdb(path: string) {
  const url = `${TMDB_BASE}${path}?api_key=${API_KEY}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type") === "tv" ? "tv" : "movie";

  try {
    const data = await tmdb(`/trending/${type}/week`);
    const results = (data.results || [])
      .filter((r: { poster_path: string | null }) => r.poster_path)
      .map((r: Record<string, unknown>) => ({ ...r, media_type: type }));
    return NextResponse.json({ results });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch trending" }, { status: 500 });
  }
}
