"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { IMG_BASE, type Movie } from "@/lib/tmdb";
import { useWatchlist } from "@/contexts/WatchlistContext";

interface StoredItem extends Movie {
  storedType?: "movie" | "tv";
}

export default function WatchlistPage() {
  const {
    watchlist,
    watched,
    notInterested,
    ratings,
    toggleWatchlist,
    toggleWatched,
    toggleNotInterested,
    isInWatchlist,
    isWatched,
    setRating,
  } = useWatchlist();
  const [items, setItems] = useState<StoredItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"watchlist" | "watched" | "hidden">("watchlist");

  const ids = tab === "watchlist" ? watchlist : tab === "watched" ? watched : notInterested;

  useEffect(() => {
    if (ids.length === 0) {
      setItems([]);
      return;
    }
    setLoading(true);
    // Fetch details for all IDs — try movie first, fall back to tv
    const fetchItem = async (id: number): Promise<StoredItem | null> => {
      try {
        // Try movie first
        const res = await fetch(`/api/details?id=${id}&type=movie`);
        if (res.ok) {
          const data = await res.json();
          if (data.id) return { ...data, storedType: "movie", media_type: "movie" };
        }
      } catch {
        // ignore
      }
      try {
        const res = await fetch(`/api/details?id=${id}&type=tv`);
        if (res.ok) {
          const data = await res.json();
          if (data.id) return { ...data, storedType: "tv", media_type: "tv" };
        }
      } catch {
        // ignore
      }
      return null;
    };

    Promise.all(ids.map(fetchItem))
      .then((results) => setItems(results.filter(Boolean) as StoredItem[]))
      .finally(() => setLoading(false));
  }, [ids]);

  return (
    <div className="min-h-screen px-4 md:px-8 pb-12">
      {/* Header */}
      <header className="py-5 flex items-center gap-3 mb-6">
        <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
          ← Back
        </Link>
        <span className="text-2xl">🎬</span>
        <span className="text-xl font-bold tracking-tight">What2Watch</span>
      </header>

      <h1 className="text-3xl font-bold mb-6">My Lists</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#161b22] rounded-lg p-1 w-fit mb-8">
        <button
          onClick={() => setTab("watchlist")}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "watchlist" ? "bg-white text-black" : "text-gray-400 hover:text-white"
          }`}
        >
          ★ Watchlist ({watchlist.length})
        </button>
        <button
          onClick={() => setTab("watched")}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "watched" ? "bg-white text-black" : "text-gray-400 hover:text-white"
          }`}
        >
          ✓ Watched ({watched.length})
        </button>
        <button
          onClick={() => setTab("hidden")}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "hidden" ? "bg-white text-black" : "text-gray-400 hover:text-white"
          }`}
        >
          ✕ Hidden ({notInterested.length})
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-[#161b22] aspect-[2/3] animate-shimmer" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">
            {tab === "watchlist" ? "★" : tab === "watched" ? "✓" : "✕"}
          </div>
          <p className="text-gray-400 text-lg">
            {tab === "watchlist"
              ? "Your watchlist is empty. Save movies and series to watch later."
              : tab === "watched"
              ? "No watched items yet. Mark titles as watched to track them here."
              : "No hidden items. Use ✕ Hide on any card to hide titles you're not interested in."}
          </p>
          <Link
            href="/"
            className="inline-block mt-6 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
          >
            Browse titles
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item) => {
            const title = item.title || item.name || "Untitled";
            const year = (item.release_date || item.first_air_date || "").slice(0, 4);
            const type = item.storedType || (item.media_type === "tv" ? "tv" : "movie");
            const inWatchlist = isInWatchlist(item.id);
            const itemWatched = isWatched(item.id);
            const currentRating = ratings[item.id] ?? 0;

            return (
              <div
                key={item.id}
                className={`rounded-xl overflow-hidden bg-[#161b22] ${itemWatched && tab === "watchlist" ? "opacity-60" : ""}`}
              >
                <Link href={`/${type}/${item.id}`} className="block group">
                  <div className="relative aspect-[2/3] bg-gray-800">
                    {item.poster_path ? (
                      <Image
                        src={`${IMG_BASE}${item.poster_path}`}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                        sizes="(max-width: 640px) 50vw, 20vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-4xl text-gray-600">
                        🎬
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/70 rounded-full px-2 py-0.5 text-xs text-yellow-400 font-semibold">
                      ★ {item.vote_average?.toFixed(1)}
                    </div>
                    {type === "tv" && (
                      <div className="absolute top-2 left-2 bg-blue-600/80 rounded-full px-2 py-0.5 text-xs font-semibold">
                        TV
                      </div>
                    )}
                  </div>
                  <div className="p-3 pb-1">
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2">{title}</h3>
                    {year && <p className="text-xs text-gray-400 mt-0.5">{year}</p>}
                  </div>
                </Link>

                <div className="flex gap-1 px-3 pb-1 pt-1">
                  <button
                    onClick={() => toggleWatchlist(item.id)}
                    className={`flex-1 text-xs py-1 rounded-md transition-colors font-medium ${
                      inWatchlist
                        ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    {inWatchlist ? "★ Saved" : "☆ Save"}
                  </button>
                  <button
                    onClick={() => toggleWatched(item.id)}
                    className={`flex-1 text-xs py-1 rounded-md transition-colors font-medium ${
                      itemWatched
                        ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    {itemWatched ? "✓ Watched" : "○ Watched"}
                  </button>
                  {tab === "hidden" && (
                    <button
                      onClick={() => toggleNotInterested(item.id)}
                      className="flex-1 text-xs py-1 rounded-md transition-colors font-medium bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                    >
                      ↩ Unhide
                    </button>
                  )}
                </div>

                {/* Star rating — shown in watched tab */}
                {tab === "watched" && (
                  <div className="flex items-center justify-center gap-0.5 px-3 pb-3 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(item.id, star)}
                        title={`Rate ${star} star${star > 1 ? "s" : ""}`}
                        className="text-sm transition-colors"
                      >
                        <span className={currentRating >= star ? "text-yellow-400" : "text-gray-600"}>
                          {currentRating >= star ? "★" : "☆"}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
