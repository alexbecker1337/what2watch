const TMDB_BASE = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY!;

export const IMG_BASE = "https://image.tmdb.org/t/p/w500";

export interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  media_type?: "movie" | "tv";
}

export interface DetailedMovie extends Movie {
  genres: { id: number; name: string }[];
  runtime?: number;
  number_of_seasons?: number;
  tagline?: string;
}

async function tmdb(path: string, params: Record<string, string> = {}) {
  const query = new URLSearchParams({ api_key: API_KEY });
  for (const [k, v] of Object.entries(params)) {
    query.set(k, v);
  }
  // Use string concat to preserve literal | for TMDB OR genre logic (URLSearchParams encodes | as %7C which TMDB rejects)
  const qs = query.toString().replace(/with_genres=[^&]+/, `with_genres=${params.with_genres || ""}`);
  const url = `${TMDB_BASE}${path}?${qs}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
}

export async function discoverByMood(
  genreIds: number[],
  sortBy: string,
  page = 1
) {
  return tmdb("/discover/movie", {
    with_genres: genreIds.join("|"),
    sort_by: sortBy,
    "vote_count.gte": "100",
    page: String(page),
  });
}

export async function discoverTVByMood(
  genreIds: number[],
  sortBy: string,
  page = 1
) {
  return tmdb("/discover/tv", {
    with_genres: genreIds.join("|"),
    sort_by: sortBy,
    "vote_count.gte": "50",
    page: String(page),
  });
}

export async function searchMulti(query: string) {
  return tmdb("/search/multi", { query, include_adult: "false" });
}

export async function getSimilar(id: number, type: "movie" | "tv", page = 1) {
  return tmdb(`/${type}/${id}/similar`, { page: String(page) });
}

export async function getRecommendations(id: number, type: "movie" | "tv", page = 1) {
  return tmdb(`/${type}/${id}/recommendations`, { page: String(page) });
}

export async function getDetails(id: number, type: "movie" | "tv"): Promise<DetailedMovie> {
  return tmdb(`/${type}/${id}`);
}

export async function getKeywordIds(keywords: string[]): Promise<string> {
  const ids = await Promise.all(
    keywords.map(async (kw) => {
      const data = await tmdb("/search/keyword", { query: kw });
      return data.results?.[0]?.id;
    })
  );
  return ids.filter(Boolean).join(",");
}
