"use client";

export default function BackButton() {
  return (
    <button
      onClick={() => history.back()}
      className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors bg-black/40 backdrop-blur-sm px-3 py-2 rounded-full"
    >
      ← Back
    </button>
  );
}
