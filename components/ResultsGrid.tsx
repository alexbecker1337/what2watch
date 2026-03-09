"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import MovieCard from "@/components/MovieCard";
import { useWatchlist } from "@/contexts/WatchlistContext";
import type { Movie } from "@/lib/tmdb";

type YearFilter = "all" | "classic" | "2000s" | "recent";
type RuntimeFilter = "all" | "short" | "standard" | "long";

const YEAR_RANGES: Record<YearFilter, { label: string; from?: number; to?: number }> = {
  all: { label: "All" },
  classic: { label: "Classic", to: 1999 },
  "2000s": { label: "2000s", from: 2000, to: 2015 },
  recent: { label: "Recent", from: 2015 },
};

const RUNTIME_RANGES: Record<RuntimeFilter, { label: string; min?: number; max?: number }> = {
  all: { label: "All" },
  short: { label: "Short (<90m)", max: 89 },
  standard: { label: "Standard (90–150m)", min: 90, max: 150 },
  long: { label: "Long (>150m)", min: 151 },
};

interface Props {
  fetchUrl: string;
  title: string;
  seedGenreIds?: number[];
}

export default function ResultsGrid({ fetchUrl, title, seedGenreIds }: Props) {
  const [results, setResults] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mediaType, setMediaType] = useState<"movie" | "tv">("movie");
  const [yearFilter, setYearFilter] = useState<YearFilter>("all");
  const [runtimeFilter, setRuntimeFilter] = useState<RuntimeFilter>("all");
  const [copySuccess, setCopySuccess] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { watched } = useWatchlist();
  const watchedSet = new Set(watched);

  const buildUrl = useCallback(
    (p: number, type: "movie" | "tv", yr: YearFilter, rt: RuntimeFilter) => {
      const separator = fetchUrl.includes("?") ? "&" : "?";
      const base = `${fetchUrl}${separator}page=${p}&type=${type}`;
      const yearRange = YEAR_RANGES[yr];
      const rtRange = RUNTIME_RANGES[rt];
      let url = base;
      if (yearRange.from) url += `&yearFrom=${yearRange.from}`;
      if (yearRange.to) url += `&yearTo=${yearRange.to}`;
      // runtime only applies to movies
      if (type === "movie") {
        if (rtRange.min) url += `&runtimeMin=${rtRange.min}`;
        if (rtRange.max) url += `&runtimeMax=${rtRange.max}`;
      }
      return url;
    },
    [fetchUrl]
  );

  const load = useCallback(
    async (
      p: number,
      type: "movie" | "tv",
      yr: YearFilter,
      rt: RuntimeFilter,
      reset = false
    ) => {
      setLoading(true);
      try {
        const url = buildUrl(p, type, yr, rt);
        const res = await fetch(url);
        const data = await res.json();
        const items: Movie[] = (data.results || []).map((r: Movie) => ({
          ...r,
          media_type: r.media_type || type,
        }));
        setResults((prev) => (reset ? items : [...prev, ...items]));
        setTotalPages(data.total_pages || 1);
      } finally {
        setLoading(false);
      }
    },
    [buildUrl]
  );

  useEffect(() => {
    setPage(1);
    load(1, mediaType, yearFilter, runtimeFilter, true);
  }, [fetchUrl, mediaType, yearFilter, runtimeFilter, load]);

  // Infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && page < totalPages) {
          const next = page + 1;
          setPage(next);
          load(next, mediaType, yearFilter, runtimeFilter);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, page, totalPages, mediaType, yearFilter, runtimeFilter, load]);

  const handleTypeSwitch = (type: "movie" | "tv") => {
    if (type === mediaType) return;
    setMediaType(type);
    // reset runtime filter when switching to TV (not applicable)
    if (type === "tv") setRuntimeFilter("all");
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // fallback
      const el = document.createElement("input");
      el.value = window.location.href;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // Filter out watched items
  const visibleResults = results.filter((m) => !watchedSet.has(m.id));

  return (
    <div className="px-4 md:px-8 pb-12">
      {/* Title + type toggle + share */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-xl font-bold">{title}</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Share button */}
          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-lg text-sm bg-white/5 hover:bg-white/10 transition-colors text-gray-300 hover:text-white flex items-center gap-1.5"
          >
            {copySuccess ? "✓ Copied!" : "🔗 Share"}
          </button>

          {/* Type toggle */}
          <div className="flex gap-1 bg-[#161b22] rounded-lg p-1">
            <button
              onClick={() => handleTypeSwitch("movie")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mediaType === "movie"
                  ? "bg-white text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => handleTypeSwitch("tv")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mediaType === "tv"
                  ? "bg-white text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Series
            </button>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Year filter */}
        <div className="flex items-center gap-1 bg-[#161b22] rounded-lg p-1 text-sm">
          <span className="text-gray-500 px-2 text-xs">Year:</span>
          {(Object.keys(YEAR_RANGES) as YearFilter[]).map((k) => (
            <button
              key={k}
              onClick={() => setYearFilter(k)}
              className={`px-3 py-1 rounded-md transition-colors ${
                yearFilter === k
                  ? "bg-white/20 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {YEAR_RANGES[k].label}
            </button>
          ))}
        </div>

        {/* Runtime filter (movies only) */}
        {mediaType === "movie" && (
          <div className="flex items-center gap-1 bg-[#161b22] rounded-lg p-1 text-sm">
            <span className="text-gray-500 px-2 text-xs">Runtime:</span>
            {(Object.keys(RUNTIME_RANGES) as RuntimeFilter[]).map((k) => (
              <button
                key={k}
                onClick={() => setRuntimeFilter(k)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  runtimeFilter === k
                    ? "bg-white/20 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {RUNTIME_RANGES[k].label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      {visibleResults.length > 0 ? (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {visibleResults.map((movie) => (
              <MovieCard
                key={`${movie.id}-${movie.media_type}`}
                movie={movie}
                seedGenreIds={seedGenreIds}
              />
            ))}
          </div>

          <div ref={sentinelRef} className="mt-8 flex justify-center h-12">
            {loading && (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <div className="w-4 h-4 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
                Loading more...
              </div>
            )}
          </div>
        </>
      ) : loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-[#161b22] aspect-[2/3] animate-pulse"
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center py-12">No results found.</p>
      )}
    </div>
  );
}
