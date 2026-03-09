"use client";

import { useState } from "react";
import ResultsGrid from "@/components/ResultsGrid";

interface Genre {
  id: number;
  label: string;
  emoji: string;
  color: string;
  movieOnly?: boolean;
}

const GENRES: Genre[] = [
  { id: 28,    label: "Action",          emoji: "💥", color: "from-red-600 to-orange-600" },
  { id: 12,    label: "Adventure",       emoji: "🗺️", color: "from-green-600 to-teal-600" },
  { id: 16,    label: "Animation",       emoji: "🎨", color: "from-pink-500 to-purple-500" },
  { id: 35,    label: "Comedy",          emoji: "😂", color: "from-yellow-500 to-orange-400" },
  { id: 80,    label: "Crime",           emoji: "🔫", color: "from-gray-700 to-gray-900" },
  { id: 99,    label: "Documentary",     emoji: "🎙️", color: "from-blue-700 to-indigo-700" },
  { id: 18,    label: "Drama",           emoji: "🎭", color: "from-blue-500 to-cyan-600" },
  { id: 10751, label: "Family",          emoji: "👨‍👩‍👧", color: "from-lime-500 to-green-500" },
  { id: 14,    label: "Fantasy",         emoji: "🧙", color: "from-purple-600 to-indigo-700" },
  { id: 36,    label: "History",         emoji: "📜", color: "from-amber-700 to-yellow-700", movieOnly: true },
  { id: 27,    label: "Horror",          emoji: "👻", color: "from-red-900 to-gray-900" },
  { id: 10402, label: "Music",           emoji: "🎵", color: "from-fuchsia-500 to-pink-600", movieOnly: true },
  { id: 9648,  label: "Mystery",         emoji: "🔍", color: "from-slate-600 to-gray-800" },
  { id: 10749, label: "Romance",         emoji: "❤️", color: "from-rose-500 to-pink-500" },
  { id: 878,   label: "Sci-Fi",          emoji: "🚀", color: "from-cyan-600 to-blue-700" },
  { id: 53,    label: "Thriller",        emoji: "🔪", color: "from-zinc-700 to-zinc-900" },
  { id: 10752, label: "War",             emoji: "⚔️", color: "from-olive-600 to-gray-700" },
  { id: 37,    label: "Western",         emoji: "🤠", color: "from-amber-600 to-orange-700", movieOnly: true },
  { id: 10759, label: "Action & Adventure", emoji: "⚡", color: "from-red-500 to-orange-500" },
  { id: 10765, label: "Sci-Fi & Fantasy",   emoji: "🌌", color: "from-violet-600 to-indigo-700" },
  { id: 10768, label: "War & Politics",     emoji: "🏛️", color: "from-stone-600 to-gray-700" },
];

interface Selected {
  genre: Genre;
  subGenreId?: number;
}

export default function CategoryPicker() {
  const [selected, setSelected] = useState<Selected | null>(null);

  if (selected) {
    const genreId = selected.subGenreId ?? selected.genre.id;
    return (
      <div>
        <div className="px-6 mb-6 flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setSelected(null)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Genres
          </button>
          <span className="text-gray-600">/</span>
          <span className="text-lg">
            {selected.genre.emoji} {selected.genre.label}
          </span>
        </div>
        <ResultsGrid
          fetchUrl={`/api/genre?genre=${genreId}`}
          title={`${selected.genre.emoji} ${selected.genre.label}`}
        />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 pb-12">
      <h2 className="text-2xl font-bold mb-2 text-center">Browse by Genre</h2>
      <p className="text-gray-400 text-center mb-8">Pick a category</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
        {GENRES.map((genre) => (
          <button
            key={genre.id}
            onClick={() => setSelected({ genre })}
            className="group relative overflow-hidden rounded-2xl hover:scale-105 transition-transform duration-200"
          >
            <div className={`bg-gradient-to-br ${genre.color} p-5 flex flex-col items-center text-center gap-2 h-full`}>
              <span className="text-3xl">{genre.emoji}</span>
              <span className="font-semibold text-sm text-white">{genre.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
