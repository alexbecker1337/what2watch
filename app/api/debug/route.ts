import { NextResponse } from "next/server";

export async function GET() {
  const API_KEY = process.env.TMDB_API_KEY;
  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=35|10749|10751&sort_by=popularity.desc&vote_count.gte=100&page=1`;

  const res = await fetch(url);
  const data = await res.json();

  return NextResponse.json({
    keyPresent: !!API_KEY,
    keyLength: API_KEY?.length,
    tmdbStatus: res.status,
    totalResults: data.total_results,
    firstResult: data.results?.[0]?.title || null,
    rawUrl: url.replace(API_KEY || "", "***"),
  });
}
