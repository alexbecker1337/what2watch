// Server component — no "use client" needed
interface Props {
  voteAverage: number;
  voteCount?: number;
}

export default function StarRating({ voteAverage, voteCount }: Props) {
  // Convert 0-10 scale to 0-5 half-star scale
  const outOfFive = voteAverage / 2; // e.g. 8.4 → 4.2
  const fullStars = Math.floor(outOfFive);
  const hasHalf = outOfFive - fullStars >= 0.25 && outOfFive - fullStars < 0.75;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <span key={`full-${i}`} className="text-yellow-400 text-lg leading-none">★</span>
        ))}
        {/* Half star */}
        {hasHalf && (
          <span className="text-yellow-400 text-lg leading-none relative inline-block" title="half star">
            {/* Unicode half star approximation using a clipped full star */}
            <span className="text-gray-600">★</span>
            <span
              className="absolute inset-0 overflow-hidden text-yellow-400"
              style={{ width: "50%" }}
            >
              ★
            </span>
          </span>
        )}
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-600 text-lg leading-none">★</span>
        ))}
        <span className="ml-2 text-yellow-400 font-semibold text-sm">
          {voteAverage.toFixed(1)}
          <span className="text-gray-400 font-normal"> / 10</span>
        </span>
      </div>
      {voteCount !== undefined && voteCount > 0 && (
        <p className="text-xs text-gray-500">
          {voteCount.toLocaleString()} votes
        </p>
      )}
    </div>
  );
}
