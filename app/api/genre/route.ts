import { NextRequest, NextResponse } from "next/server";
import { type DiscoverFilters } from "@/lib/tmdb";

const TMDB_BASE = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY!;

function tmdbUrl(path: string, params: Record<string, string>) {
  const pairs = [`api_key=${API_KEY}`];
  for (const [k, v] of Object.entries(params)) pairs.push(`${k}=${v}`);
  return `${TMDB_BASE}${path}?${pairs.join("&")}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const genreId = searchParams.get("genre");
  const mediaType = searchParams.get("type") || "movie";
  const page = Number(searchParams.get("page") || "1");

  const filters: DiscoverFilters = {
    yearFrom: searchParams.get("yearFrom") ? Number(searchParams.get("yearFrom")) : undefined,
    yearTo: searchParams.get("yearTo") ? Number(searchParams.get("yearTo")) : undefined,
    runtimeMin: searchParams.get("runtimeMin") ? Number(searchParams.get("runtimeMin")) : undefined,
    runtimeMax: searchParams.get("runtimeMax") ? Number(searchParams.get("runtimeMax")) : undefined,
  };

  if (!genreId) return NextResponse.json({ error: "Missing genre" }, { status: 400 });

  const params: Record<string, string> = {
    with_genres: genreId,
    sort_by: "popularity.desc",
    "vote_count.gte": mediaType === "tv" ? "50" : "100",
    page: String(page),
  };

  if (filters.yearFrom) params[mediaType === "tv" ? "first_air_date.gte" : "primary_release_date.gte"] = `${filters.yearFrom}-01-01`;
  if (filters.yearTo) params[mediaType === "tv" ? "first_air_date.lte" : "primary_release_date.lte"] = `${filters.yearTo}-12-31`;
  if (mediaType === "movie") {
    if (filters.runtimeMin) params["with_runtime.gte"] = String(filters.runtimeMin);
    if (filters.runtimeMax) params["with_runtime.lte"] = String(filters.runtimeMax);
  }

  try {
    const url = tmdbUrl(`/discover/${mediaType}`, params);
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
