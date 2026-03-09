"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MOODS, type Mood, type SubMood } from "@/lib/moods";
import { IMG_BASE, type Movie } from "@/lib/tmdb";
import ResultsGrid from "@/components/ResultsGrid";

type SurpriseState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; item: Movie; mood: Mood };

export default function MoodPicker() {
  const [selected, setSelected] = useState<Mood | null>(null);
  const [activeSubMood, setActiveSubMood] = useState<SubMood | null>(null);
  const [surprise, setSurprise] = useState<SurpriseState>({ status: "idle" });

  const handleSelectMood = (mood: Mood) => {
    setSelected(mood);
    setActiveSubMood(null);
  };

  const handleBackToMoods = () => {
    setSelected(null);
    setActiveSubMood(null);
  };

  const handleSurprise = async () => {
    setSurprise({ status: "loading" });
    try {
      const randomMood = MOODS[Math.floor(Math.random() * MOODS.length)];
      const res = await fetch(`/api/mood?mood=${randomMood.id}&type=movie&page=1`);
      const data = await res.json();
      const items: Movie[] = (data.results || []).filter((m: Movie) => m.poster_path);
      if (items.length === 0) throw new Error("No results");
      const pick = items[Math.floor(Math.random() * Math.min(items.length, 10))];
      setSurprise({ status: "ready", item: { ...pick, media_type: "movie" }, mood: randomMood });
    } catch {
      setSurprise({ status: "idle" });
    }
  };

  // Build the fetchUrl for ResultsGrid based on selected mood + sub-mood
  const buildFetchUrl = () => {
    if (!selected) return "";
    let url = `/api/mood?mood=${selected.id}`;
    if (activeSubMood) {
      const genreIds = activeSubMood.genreIds.join(",");
      const tvGenreIds = activeSubMood.tvGenreIds.join(",");
      // We pass both; the route uses `genres` param regardless of type — it'll pick the right set
      // We encode movie genres here; ResultsGrid appends &type=tv which uses tvGenreIds if present
      // To handle both movie and TV sub-mood genres, we pass a special param that the API resolves
      url += `&subMoodMovieGenres=${genreIds}&subMoodTvGenres=${tvGenreIds}`;
    }
    return url;
  };

  // Surprise "ready" view
  if (surprise.status === "ready") {
    const { item, mood } = surprise;
    const title = item.title || item.name || "Untitled";
    const year = (item.release_date || item.first_air_date || "").slice(0, 4);
    const type = item.media_type || "movie";

    return (
      <div className="flex flex-col items-center px-4 py-12 text-center">
        <div className="mb-3 text-3xl">{mood.emoji}</div>
        <p className="text-gray-400 mb-6 text-sm">Your surprise pick from <span className="text-white font-medium">{mood.label}</span></p>

        <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${mood.color} p-px mb-6 shadow-2xl`}>
          <div className="rounded-2xl overflow-hidden bg-[#161b22]">
            {item.poster_path && (
              <div className="relative w-48 aspect-[2/3]">
                <Image
                  src={`${IMG_BASE}${item.poster_path}`}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="192px"
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-bold text-lg">{title}</h3>
              <p className="text-gray-400 text-sm">{year}</p>
              <div className="text-yellow-400 text-sm mt-1">★ {item.vote_average?.toFixed(1)}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/${type}/${item.id}`}
            className="px-6 py-3 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition-colors text-sm"
          >
            Watch this →
          </Link>
          <button
            onClick={handleSurprise}
            className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
          >
            Try again
          </button>
          <button
            onClick={() => setSurprise({ status: "idle" })}
            className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-sm text-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (selected) {
    // Build fetch URL with sub-mood genre override
    let fetchUrl = `/api/mood?mood=${selected.id}`;
    if (activeSubMood) {
      fetchUrl += `&genres=${activeSubMood.genreIds.join(",")}`;
      // We'll also pass TV genres — the API route resolves based on type
      // Since ResultsGrid appends &type=..., we pass a tvGenres param too
      fetchUrl += `&tvGenres=${activeSubMood.tvGenreIds.join(",")}`;
    }

    return (
      <div>
        <div className="px-6 mb-4 flex items-center gap-3">
          <button
            onClick={handleBackToMoods}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Moods
          </button>
          <span className="text-gray-600">/</span>
          <span className="text-lg">
            {selected.emoji} {selected.label}
          </span>
        </div>

        {/* Sub-mood chips */}
        {selected.subMoods && selected.subMoods.length > 0 && (
          <div className="px-6 mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveSubMood(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeSubMood === null
                  ? "bg-white text-black"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              All
            </button>
            {selected.subMoods.map((sm) => (
              <button
                key={sm.id}
                onClick={() => setActiveSubMood(sm.id === activeSubMood?.id ? null : sm)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeSubMood?.id === sm.id
                    ? "bg-white text-black"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                {sm.label}
              </button>
            ))}
          </div>
        )}

        <ResultsGrid
          fetchUrl={fetchUrl}
          title={`${selected.emoji} ${selected.label}${activeSubMood ? ` · ${activeSubMood.label}` : ""}`}
        />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 pb-12">
      <h2 className="text-2xl font-bold mb-2 text-center">How are you feeling?</h2>
      <p className="text-gray-400 text-center mb-6">Pick a vibe</p>

      {/* Surprise me button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={handleSurprise}
          disabled={surprise.status === "loading"}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all font-semibold text-sm disabled:opacity-50 flex items-center gap-2"
        >
          {surprise.status === "loading" ? (
            <>⏳ Finding something...</>
          ) : (
            <>🎲 Surprise me</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
        {MOODS.map((mood) => (
          <button
            key={mood.id}
            onClick={() => handleSelectMood(mood)}
            className="group relative overflow-hidden rounded-2xl p-px hover:scale-105 transition-transform duration-200"
            style={{
              background: `linear-gradient(135deg, var(--tw-gradient-from, #6366f1), var(--tw-gradient-to, #ec4899))`,
            }}
          >
            <div
              className={`rounded-2xl bg-gradient-to-br ${mood.color} p-5 flex flex-col items-center text-center gap-2`}
            >
              <span className="text-3xl">{mood.emoji}</span>
              <span className="font-semibold text-sm text-white">{mood.label}</span>
              <span className="text-xs text-white/70 leading-tight">{mood.description}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
