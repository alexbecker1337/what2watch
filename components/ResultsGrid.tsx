"use client";

import { useState, useEffect, useCallback } from "react";
import MovieCard from "@/components/MovieCard";
import type { Movie } from "@/lib/tmdb";

interface Props {
  fetchUrl: string;
  title: string;
}

export default function ResultsGrid({ fetchUrl, title }: Props) {
  const [results, setResults] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mediaType, setMediaType] = useState<"movie" | "tv">("movie");

  const load = useCallback(
    async (p: number, type: "movie" | "tv", reset = false) => {
      setLoading(true);
      try {
        const separator = fetchUrl.includes("?") ? "&" : "?";
        const url = `${fetchUrl}${separator}page=${p}&type=${type}`;
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
    [fetchUrl]
  );

  useEffect(() => {
    setPage(1);
    load(1, mediaType, true);
  }, [fetchUrl, mediaType, load]);

  const handleTypeSwitch = (type: "movie" | "tv") => {
    if (type === mediaType) return;
    setMediaType(type);
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    load(next, mediaType);
  };

  return (
    <div className="px-4 md:px-8 pb-12">
      {/* Title + type toggle */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-xl font-bold">{title}</h2>
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

      {/* Grid */}
      {results.length > 0 ? (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {results.map((movie) => (
              <MovieCard key={`${movie.id}-${movie.media_type}`} movie={movie} />
            ))}
          </div>

          {page < totalPages && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
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
