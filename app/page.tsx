"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MoodPicker from "@/components/MoodPicker";
import LikeThisSearch from "@/components/LikeThisSearch";
import CategoryPicker from "@/components/CategoryPicker";
import { useWatchlist } from "@/contexts/WatchlistContext";

type Mode = "mood" | "like" | "category";

export default function Home() {
  const [mode, setMode] = useState<Mode | null>(null);
  const { watchlistCount } = useWatchlist();

  const restoreModeFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const urlMode = params.get("mode") as Mode | null;
    setMode(urlMode === "mood" || urlMode === "like" || urlMode === "category" ? urlMode : null);
  };

  useEffect(() => {
    restoreModeFromUrl();
    window.addEventListener("popstate", restoreModeFromUrl);
    return () => window.removeEventListener("popstate", restoreModeFromUrl);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSetMode = (newMode: Mode | null) => {
    setMode(newMode);
    const url = new URL(window.location.href);
    if (newMode) {
      url.searchParams.set("mode", newMode);
    } else {
      url.searchParams.delete("mode");
    }
    window.history.pushState({}, "", url.toString());
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 py-5 flex items-center gap-3">
        <span className="text-2xl">🎬</span>
        <button
          onClick={() => handleSetMode(null)}
          className="text-xl font-bold tracking-tight hover:text-gray-300 transition-colors"
        >
          What2Watch
        </button>
        <div className="ml-auto">
          <Link
            href="/watchlist"
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg"
          >
            ★ Watchlist
            {watchlistCount > 0 && (
              <span className="bg-yellow-500 text-black text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-tight">
                {watchlistCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Hero */}
      {!mode && (
        <div className="flex-1 flex flex-col items-center px-4 text-center pt-[8vh]">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            What should you<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              watch tonight?
            </span>
          </h1>
          <p className="text-gray-400 text-lg mb-12">
            Pick a mode to find your next watch.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
            <button
              onClick={() => handleSetMode("mood")}
              className="flex-1 group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 p-px"
            >
              <div className="rounded-2xl bg-[#0d1117] px-6 py-8 group-hover:bg-transparent transition-all duration-300">
                <div className="text-4xl mb-3">🎭</div>
                <div className="text-lg font-semibold mb-1">By Mood</div>
                <div className="text-sm text-gray-400 group-hover:text-white transition-colors">
                  Tell us how you&apos;re feeling
                </div>
              </div>
            </button>

            <button
              onClick={() => handleSetMode("like")}
              className="flex-1 group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 p-px"
            >
              <div className="rounded-2xl bg-[#0d1117] px-6 py-8 group-hover:bg-transparent transition-all duration-300">
                <div className="text-4xl mb-3">🎯</div>
                <div className="text-lg font-semibold mb-1">Like This</div>
                <div className="text-sm text-gray-400 group-hover:text-white transition-colors">
                  Pick a movie you loved
                </div>
              </div>
            </button>

            <button
              onClick={() => handleSetMode("category")}
              className="flex-1 group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 to-teal-600 p-px"
            >
              <div className="rounded-2xl bg-[#0d1117] px-6 py-8 group-hover:bg-transparent transition-all duration-300">
                <div className="text-4xl mb-3">🎬</div>
                <div className="text-lg font-semibold mb-1">By Genre</div>
                <div className="text-sm text-gray-400 group-hover:text-white transition-colors">
                  Browse a category
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Mode views */}
      {mode === "mood" && (
        <div className="flex-1">
          <div className="px-6 py-3">
            <button onClick={() => handleSetMode(null)} className="text-sm text-gray-400 hover:text-white transition-colors">
              ← Back
            </button>
          </div>
          <MoodPicker />
        </div>
      )}

      {mode === "like" && (
        <div className="flex-1">
          <div className="px-6 py-3">
            <button onClick={() => handleSetMode(null)} className="text-sm text-gray-400 hover:text-white transition-colors">
              ← Back
            </button>
          </div>
          <LikeThisSearch />
        </div>
      )}

      {mode === "category" && (
        <div className="flex-1">
          <div className="px-6 py-3">
            <button onClick={() => handleSetMode(null)} className="text-sm text-gray-400 hover:text-white transition-colors">
              ← Back
            </button>
          </div>
          <CategoryPicker />
        </div>
      )}
    </main>
  );
}
