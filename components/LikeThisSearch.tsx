"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { IMG_BASE, type Movie } from "@/lib/tmdb";
import ResultsGrid from "@/components/ResultsGrid";

export default function LikeThisSearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [selected, setSelected] = useState<Movie | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
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

  const pick = (movie: Movie) => {
    setSelected(movie);
    setQuery("");
    setSuggestions([]);
    setShowDropdown(false);
  };

  if (selected) {
    const title = selected.title || selected.name || "Untitled";
    const type = selected.media_type || (selected.name ? "tv" : "movie");
    return (
      <div>
        <div className="px-6 mb-6 flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setSelected(null)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Search again
          </button>
          <span className="text-gray-600">/</span>
          <span className="text-lg font-medium">Because you liked &quot;{title}&quot;</span>
        </div>
        <ResultsGrid
          fetchUrl={`/api/similar?id=${selected.id}&type=${type}`}
          title={`If you liked "${title}"`}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-4 pt-8 pb-12">
      <h2 className="text-2xl font-bold mb-2 text-center">Find something similar</h2>
      <p className="text-gray-400 text-center mb-8">Search for a movie or series you loved</p>

      <div className="relative w-full max-w-lg">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder="e.g. Interstellar, Breaking Bad..."
          className="w-full bg-[#161b22] border border-gray-700 rounded-xl px-5 py-4 text-lg outline-none focus:border-purple-500 transition-colors placeholder-gray-600"
          autoFocus
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl">🔍</span>

        {/* Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-[#161b22] border border-gray-700 rounded-xl overflow-hidden z-10 shadow-2xl">
            {suggestions.slice(0, 6).map((item) => {
              const itemTitle = item.title || item.name || "Untitled";
              const year = (item.release_date || item.first_air_date || "").slice(0, 4);
              const isTV = item.media_type === "tv";
              return (
                <button
                  key={item.id}
                  onClick={() => pick(item)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
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
    </div>
  );
}
