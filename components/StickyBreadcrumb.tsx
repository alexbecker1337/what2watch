"use client";

interface Props {
  label: string;
  onBack: () => void;
}

export default function StickyBreadcrumb({ label, onBack }: Props) {
  return (
    <div className="sticky top-0 z-50 bg-[#0d1117]/90 backdrop-blur-sm border-b border-white/5 px-4 py-2.5 flex items-center gap-3">
      <button
        onClick={onBack}
        className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
      >
        ← Back
      </button>
      <span className="text-gray-600">|</span>
      <span className="text-sm font-medium text-white truncate">{label}</span>
    </div>
  );
}
