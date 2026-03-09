"use client";

import { useState } from "react";
import { MOODS, type Mood } from "@/lib/moods";
import ResultsGrid from "@/components/ResultsGrid";

export default function MoodPicker() {
  const [selected, setSelected] = useState<Mood | null>(null);

  if (selected) {
    return (
      <div>
        <div className="px-6 mb-6 flex items-center gap-3">
          <button
            onClick={() => setSelected(null)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Moods
          </button>
          <span className="text-gray-600">/</span>
          <span className="text-lg">
            {selected.emoji} {selected.label}
          </span>
        </div>
        <ResultsGrid
          fetchUrl={`/api/mood?mood=${selected.id}`}
          title={`${selected.emoji} ${selected.label}`}
        />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 pb-12">
      <h2 className="text-2xl font-bold mb-2 text-center">How are you feeling?</h2>
      <p className="text-gray-400 text-center mb-8">Pick a vibe</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
        {MOODS.map((mood) => (
          <button
            key={mood.id}
            onClick={() => setSelected(mood)}
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
