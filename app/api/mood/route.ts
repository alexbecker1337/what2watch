import { NextRequest, NextResponse } from "next/server";
import { discoverByMood, discoverTVByMood, type DiscoverFilters } from "@/lib/tmdb";
import { MOODS } from "@/lib/moods";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const moodId = searchParams.get("mood");
  const mediaType = searchParams.get("type") || "movie";
  const page = Number(searchParams.get("page") || "1");

  // Year range filters
  const yearFrom = searchParams.get("yearFrom") ? Number(searchParams.get("yearFrom")) : undefined;
  const yearTo = searchParams.get("yearTo") ? Number(searchParams.get("yearTo")) : undefined;

  // Runtime filters (movies only)
  const runtimeMin = searchParams.get("runtimeMin") ? Number(searchParams.get("runtimeMin")) : undefined;
  const runtimeMax = searchParams.get("runtimeMax") ? Number(searchParams.get("runtimeMax")) : undefined;

  // Sub-mood genre override — separate params for movie vs TV
  const genreOverrideMovie = searchParams.get("genres");
  const genreOverrideTv = searchParams.get("tvGenres");

  const mood = MOODS.find((m) => m.id === moodId);
  if (!mood) {
    return NextResponse.json({ error: "Unknown mood" }, { status: 400 });
  }

  // Provider filter
  const providerId = searchParams.get("provider") ? Number(searchParams.get("provider")) : undefined;
  const region = searchParams.get("region") || undefined;

  const sortByParam = searchParams.get("sortBy") || mood.sortBy;

  const filters: DiscoverFilters = { yearFrom, yearTo, runtimeMin, runtimeMax, providerId, watchRegion: region };

  try {
    let data;
    if (mediaType === "tv") {
      const withGenres = genreOverrideTv
        ? genreOverrideTv.split(",").map(Number).filter(Boolean)
        : undefined;
      data = await discoverTVByMood(mood.tvGenres, sortByParam, page, { ...filters, withGenres });
    } else {
      const withGenres = genreOverrideMovie
        ? genreOverrideMovie.split(",").map(Number).filter(Boolean)
        : undefined;
      data = await discoverByMood(mood.movieGenres, sortByParam, page, { ...filters, withGenres });
    }
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
