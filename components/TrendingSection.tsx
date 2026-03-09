"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { IMG_BASE, type Movie } from "@/lib/tmdb";

export default function TrendingSection() {
  const [type, setType] = useState<"movie" | "tv">("movie");
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setResults([]);
    fetch(`/api/trending?type=${type}`)
      .then((r) => r.json())
      .then((d) => setResults(d.results || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [type]);

  return (
    <div className="w-full max-w-4xl mt-12">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-base font-semibold text-gray-300">Trending this week</h2>
        <div className="flex gap-1 bg-[#161b22] rounded-lg p-1">
          <button
            onClick={() => setType("movie")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${type === "movie" ? "bg-white text-black" : "text-gray-400 hover:text-white"}`}
          >
            Movies
          </button>
          <button
            onClick={() => setType("tv")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${type === "tv" ? "bg-white text-black" : "text-gray-400 hover:text-white"}`}
          >
            Series
          </button>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-24 aspect-[2/3] rounded-xl animate-shimmer"
              />
            ))
          : results.slice(0, 20).map((item) => {
              const title = item.title || item.name || "Untitled";
              const year = (item.release_date || item.first_air_date || "").slice(0, 4);
              return (
                <Link
                  key={item.id}
                  href={`/${type}/${item.id}`}
                  className="flex-shrink-0 group w-24"
                >
                  <div className="relative w-24 aspect-[2/3] rounded-xl overflow-hidden bg-gray-800 group-hover:scale-105 transition-transform duration-200">
                    {item.poster_path ? (
                      <Image
                        src={`${IMG_BASE}${item.poster_path}`}
                        alt={title}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-2xl">
                        🎬
                      </div>
                    )}
                    <div className="absolute top-1.5 right-1.5 bg-black/70 rounded-full px-1.5 py-0.5 text-[10px] text-yellow-400 font-semibold">
                      ★ {item.vote_average?.toFixed(1)}
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-300 mt-1 line-clamp-2 leading-tight">{title}</p>
                  {year && <p className="text-[10px] text-gray-500">{year}</p>}
                </Link>
              );
            })}
      </div>
    </div>
  );
}
