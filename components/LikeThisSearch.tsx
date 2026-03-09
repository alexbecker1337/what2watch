"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { IMG_BASE, GENRE_NAMES, type Movie } from "@/lib/tmdb";
import ResultsGrid from "@/components/ResultsGrid";

const MAX_SEEDS = 3;

export default function LikeThisSearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [seeds, setSeeds] = useState<Movie[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSuggestions(data.results || []);
      setShowDropdown(true);
    }, 300);
  }, [query]);

  const addSeed = (movie: Movie) => {
    if (seeds.length >= MAX_SEEDS) return;
    if (seeds.find((s) => s.id === movie.id)) return;
    setSeeds((prev) => [...prev, movie]);
    setQuery("");
    setSuggestions([]);
    setShowDropdown(false);
    setShowResults(false);
  };

  const removeSeed = (id: number) => {
    setSeeds((prev) => prev.filter((s) => s.id !== id));
    setShowResults(false);
  };

  // Collect all genre IDs across all seeds for explanation tags
  const seedGenreIds = Array.from(
    new Set(seeds.flatMap((s) => s.genre_ids || []))
  );

  // Build the fetchUrl for ResultsGrid
  const buildFetchUrl = () => {
    if (seeds.length === 0) return "";
    if (seeds.length === 1) {
      const s = seeds[0];
      const type = s.media_type || (s.name && !s.title ? "tv" : "movie");
      return `/api/similar?id=${s.id}&type=${type}`;
    }
    const ids = seeds.map((s) => s.id).join(",");
    const types = seeds
      .map((s) => s.media_type || (s.name && !s.title ? "tv" : "movie"))
      .join(",");
    return `/api/similar?ids=${ids}&types=${types}`;
  };

  const buildTitle = () => {
    if (seeds.length === 1) {
      const title = seeds[0].title || seeds[0].name || "Untitled";
      return `If you liked "${title}"`;
    }
    return `Because you liked ${seeds.map((s) => `"${s.title || s.name}"`).join(", ")}`;
  };

  if (showResults && seeds.length > 0) {
    return (
      <div>
        <div className="px-6 mb-6 flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowResults(false)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Edit seeds
          </button>
          <span className="text-gray-600">/</span>
          {/* Seed chips */}
          <div className="flex flex-wrap gap-2">
            {seeds.map((s) => {
              const title = s.title || s.name || "Untitled";
              return (
                <span
                  key={s.id}
                  className="flex items-center gap-1.5 text-sm bg-white/10 px-3 py-1 rounded-full"
                >
                  {title}
                  <button
                    onClick={() => {
                      removeSeed(s.id);
                    }}
                    className="text-gray-400 hover:text-white text-xs leading-none"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
        <ResultsGrid
          fetchUrl={buildFetchUrl()}
          title={buildTitle()}
          seedGenreIds={seedGenreIds}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-4 pt-8 pb-12">
      <h2 className="text-2xl font-bold mb-2 text-center">Find something similar</h2>
      <p className="text-gray-400 text-center mb-8">
        Search for up to {MAX_SEEDS} movies or series you loved
      </p>

      {/* Current seeds */}
      {seeds.length > 0 && (
        <div className="w-full max-w-lg mb-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {seeds.map((s) => {
              const title = s.title || s.name || "Untitled";
              const type = s.media_type || (s.name && !s.title ? "tv" : "movie");
              return (
                <span
                  key={s.id}
                  className="flex items-center gap-2 bg-[#161b22] border border-gray-700 rounded-full pl-2 pr-3 py-1.5"
                >
                  {s.poster_path && (
                    <div className="relative w-5 h-7 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={`${IMG_BASE}${s.poster_path}`}
                        alt={title}
                        fill
                        className="object-cover"
                        sizes="20px"
                      />
                    </div>
                  )}
                  <span className="text-sm font-medium">{title}</span>
                  <span className="text-xs text-gray-500">{type === "tv" ? "Series" : "Movie"}</span>
                  {/* Genre pills */}
                  {(s.genre_ids || []).slice(0, 2).map((gid) =>
                    GENRE_NAMES[gid] ? (
                      <span
                        key={gid}
                        className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full"
                      >
                        {GENRE_NAMES[gid]}
                      </span>
                    ) : null
                  )}
                  <button
                    onClick={() => removeSeed(s.id)}
                    className="text-gray-400 hover:text-white text-sm leading-none ml-1"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {seeds.length < MAX_SEEDS && (
        <div className="relative w-full max-w-lg mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            placeholder={
              seeds.length === 0
                ? "e.g. Interstellar, Breaking Bad..."
                : `Add another title (${seeds.length}/${MAX_SEEDS})...`
            }
            className="w-full bg-[#161b22] border border-gray-700 rounded-xl px-5 py-4 text-lg outline-none focus:border-purple-500 transition-colors placeholder-gray-600"
            autoFocus={seeds.length === 0}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl">🔍</span>

          {/* Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-[#161b22] border border-gray-700 rounded-xl overflow-hidden z-10 shadow-2xl">
              {suggestions.slice(0, 6).map((item) => {
                const itemTitle = item.title || item.name || "Untitled";
                const year = (item.release_date || item.first_air_date || "").slice(0, 4);
                const isTV = item.media_type === "tv";
                const alreadyAdded = seeds.find((s) => s.id === item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => !alreadyAdded && addSeed(item)}
                    disabled={!!alreadyAdded}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                      alreadyAdded
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <div className="relative w-9 h-14 flex-shrink-0 rounded overflow-hidden bg-gray-800">
                      {item.poster_path && (
                        <Image
                          src={`${IMG_BASE}${item.poster_path}`}
                          alt={itemTitle}
                          fill
                          className="object-cover"
                          sizes="36px"
                        />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{itemTitle}</div>
                      <div className="text-xs text-gray-400">
                        {isTV ? "Series" : "Movie"} {year && `· ${year}`}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Find button */}
      {seeds.length > 0 && (
        <button
          onClick={() => setShowResults(true)}
          className="mt-2 px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition-all font-semibold text-sm"
        >
          Find similar →
        </button>
      )}
    </div>
  );
}
