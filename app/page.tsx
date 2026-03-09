"use client";

import { useState } from "react";
import MoodPicker from "@/components/MoodPicker";
import LikeThisSearch from "@/components/LikeThisSearch";

type Mode = "mood" | "like";

export default function Home() {
  const [mode, setMode] = useState<Mode | null>(null);

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 py-5 flex items-center gap-3">
        <span className="text-2xl">🎬</span>
        <span className="text-xl font-bold tracking-tight">What2Watch</span>
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

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
            <button
              onClick={() => setMode("mood")}
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
              onClick={() => setMode("like")}
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
          </div>
        </div>
      )}

      {/* Mode views */}
      {mode === "mood" && (
        <div className="flex-1">
          <div className="px-6 py-3">
            <button
              onClick={() => setMode(null)}
              className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              ← Back
            </button>
          </div>
          <MoodPicker />
        </div>
      )}

      {mode === "like" && (
        <div className="flex-1">
          <div className="px-6 py-3">
            <button
              onClick={() => setMode(null)}
              className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              ← Back
            </button>
          </div>
          <LikeThisSearch />
        </div>
      )}
    </main>
  );
}
