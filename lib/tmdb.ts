const TMDB_BASE = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY!;

export const IMG_BASE = "https://image.tmdb.org/t/p/w500";
export const IMG_ORIGINAL = "https://image.tmdb.org/t/p/original";
export const BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";

export const GENRE_NAMES: Record<number, string> = {
  // Movie genres
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  53: "Thriller",
  10752: "War",
  37: "Western",
  // TV genres
  10759: "Action & Adventure",
  10762: "Kids",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
};

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
  number_of_episodes?: number;
  tagline?: string;
  status?: string;
  spoken_languages?: { english_name: string }[];
  production_countries?: { name: string }[];
  budget?: number;
  revenue?: number;
  created_by?: { name: string; profile_path: string | null }[];
  networks?: { name: string; logo_path: string | null }[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface DiscoverFilters {
  yearFrom?: number;
  yearTo?: number;
  runtimeMin?: number;
  runtimeMax?: number;
  withGenres?: number[];
  providerId?: number;
  watchRegion?: string;
}

async function tmdb(path: string, params: Record<string, string> = {}) {
  const pairs = [`api_key=${API_KEY}`];
  for (const [k, v] of Object.entries(params)) {
    pairs.push(`${k}=${v}`);
  }
  const url = `${TMDB_BASE}${path}?${pairs.join("&")}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
}

export async function discoverByMood(
  genreIds: number[],
  sortBy: string,
  page = 1,
  filters: DiscoverFilters = {}
) {
  const params: Record<string, string> = {
    with_genres: (filters.withGenres ?? genreIds).join("|"),
    sort_by: sortBy,
    "vote_count.gte": "100",
    page: String(page),
  };
  if (filters.yearFrom) params["primary_release_date.gte"] = `${filters.yearFrom}-01-01`;
  if (filters.yearTo) params["primary_release_date.lte"] = `${filters.yearTo}-12-31`;
  if (filters.runtimeMin) params["with_runtime.gte"] = String(filters.runtimeMin);
  if (filters.runtimeMax) params["with_runtime.lte"] = String(filters.runtimeMax);
  if (filters.providerId) params["with_watch_providers"] = String(filters.providerId);
  if (filters.watchRegion) params["watch_region"] = filters.watchRegion;
  return tmdb("/discover/movie", params);
}

export async function discoverTVByMood(
  genreIds: number[],
  sortBy: string,
  page = 1,
  filters: DiscoverFilters = {}
) {
  const params: Record<string, string> = {
    with_genres: (filters.withGenres ?? genreIds).join("|"),
    sort_by: sortBy,
    "vote_count.gte": "50",
    page: String(page),
  };
  if (filters.yearFrom) params["first_air_date.gte"] = `${filters.yearFrom}-01-01`;
  if (filters.yearTo) params["first_air_date.lte"] = `${filters.yearTo}-12-31`;
  if (filters.providerId) params["with_watch_providers"] = String(filters.providerId);
  if (filters.watchRegion) params["watch_region"] = filters.watchRegion;
  return tmdb("/discover/tv", params);
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

export async function getCredits(id: number, type: "movie" | "tv") {
  const endpoint = type === "movie" ? `/movie/${id}/credits` : `/tv/${id}/aggregate_credits`;
  return tmdb(endpoint);
}

export async function getVideos(id: number, type: "movie" | "tv") {
  return tmdb(`/${type}/${id}/videos`);
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface WatchProviders {
  link: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

export async function getWatchProviders(id: number, type: "movie" | "tv") {
  return tmdb(`/${type}/${id}/watch/providers`);
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
