"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { IMG_BASE, type Movie } from "@/lib/tmdb";

export default function HomepageSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Expose the input ref globally for keyboard nav
  if (typeof window !== "undefined") {
    (window as typeof window & { __searchInput?: HTMLInputElement | null }).__searchInput = inputRef.current;
  }

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 350);
  };

  return (
    <div className="w-full max-w-2xl mt-8" id="homepage-search">
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">
          🔍
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search movies and series..."
          className="w-full bg-[#161b22] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
          </div>
        )}
        {query && !loading && (
          <button
            onClick={() => { setQuery(""); setResults([]); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors text-lg"
          >
            ✕
          </button>
        )}
      </div>

      {results.length > 0 && (
        <div className="mt-3 bg-[#161b22] border border-white/10 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-4">
            {results.slice(0, 12).map((item) => {
              const title = item.title || item.name || "Untitled";
              const year = (item.release_date || item.first_air_date || "").slice(0, 4);
              const type = item.media_type === "tv" ? "tv" : "movie";
              return (
                <Link key={`${item.id}-${type}`} href={`/${type}/${item.id}`} className="group">
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-800 group-hover:scale-105 transition-transform duration-200">
                    {item.poster_path ? (
                      <Image
                        src={`${IMG_BASE}${item.poster_path}`}
                        alt={title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-2xl">🎬</div>
                    )}
                    <div className="absolute top-1.5 right-1.5 bg-black/70 rounded-full px-1.5 py-0.5 text-[10px] text-yellow-400 font-semibold">
                      ★ {item.vote_average?.toFixed(1)}
                    </div>
                    {type === "tv" && (
                      <div className="absolute top-1.5 left-1.5 bg-blue-600/80 rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                        TV
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-medium mt-1.5 line-clamp-2 leading-tight">{title}</p>
                  {year && <p className="text-[10px] text-gray-400">{year}</p>}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {query.trim() && results.length === 0 && !loading && (
        <div className="mt-3 bg-[#161b22] border border-white/10 rounded-2xl p-6 text-center">
          <p className="text-gray-400 text-sm">No results found for &quot;{query}&quot;</p>
        </div>
      )}
    </div>
  );
}
