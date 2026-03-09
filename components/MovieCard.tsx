"use client";

import Image from "next/image";
import Link from "next/link";
import { IMG_BASE, IMG_ORIGINAL, type Movie, GENRE_NAMES, type WatchProvider } from "@/lib/tmdb";
import { useWatchlist } from "@/contexts/WatchlistContext";

interface Props {
  movie: Movie;
  seedGenreIds?: number[];
  streamProviders?: WatchProvider[];
  highlighted?: boolean;
  cardId?: string;
}

export default function MovieCard({ movie, seedGenreIds, streamProviders = [], highlighted = false, cardId }: Props) {
  const title = movie.title || movie.name || "Untitled";
  const year = (movie.release_date || movie.first_air_date || "").slice(0, 4);
  const rating = movie.vote_average?.toFixed(1);
  const type = movie.media_type === "tv" || (!movie.title && !!movie.name) ? "tv" : "movie";

  const { toggleWatchlist, toggleWatched, toggleNotInterested, isNotInterested, setRating, ratings, isInWatchlist, isWatched } = useWatchlist();
  const inWatchlist = isInWatchlist(movie.id);
  const watched = isWatched(movie.id);
  const hidden = isNotInterested(movie.id);
  const currentRating = ratings[movie.id] ?? 0;

  // Matching genres for "Like This" mode
  const matchingGenres =
    seedGenreIds && seedGenreIds.length > 0
      ? (movie.genre_ids || [])
          .filter((gid) => seedGenreIds.includes(gid))
          .map((gid) => GENRE_NAMES[gid])
          .filter(Boolean)
          .slice(0, 3)
      : [];

  return (
    <div
      id={cardId}
      className={`group relative rounded-xl overflow-hidden bg-[#161b22] transition-all duration-200 hover:scale-105 ${watched ? "opacity-60" : ""} ${highlighted ? "ring-2 ring-purple-400" : ""}`}
    >
      <Link href={`/${type}/${movie.id}`} className="block">
        {/* Poster */}
        <div className="relative aspect-[2/3] bg-gray-800">
          {movie.poster_path ? (
            <Image
              src={`${IMG_BASE}${movie.poster_path}`}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-4xl">
              🎬
            </div>
          )}

          {/* Rating badge */}
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-semibold text-yellow-400">
            ★ {rating}
          </div>

          {/* TV badge */}
          {type === "tv" && (
            <div className="absolute top-2 left-2 bg-blue-600/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-semibold">
              TV
            </div>
          )}

          {/* Streaming platform logos */}
          {streamProviders.length > 0 && (
            <div className="absolute bottom-2 right-2 flex gap-1">
              {streamProviders.slice(0, 3).map((p) => (
                <div key={p.provider_id} className="relative w-5 h-5 rounded-md overflow-hidden ring-1 ring-black/40" title={p.provider_name}>
                  <Image src={`${IMG_ORIGINAL}${p.logo_path}`} alt={p.provider_name} fill className="object-cover" sizes="20px" />
                </div>
              ))}
            </div>
          )}

          {/* Watched checkmark badge */}
          {watched && (
            <div className="absolute bottom-2 left-2 bg-green-600/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-semibold">
              ✓ Watched
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
            <p className="text-xs text-gray-300 line-clamp-4">{movie.overview}</p>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 pb-1">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">{title}</h3>
          {year && <p className="text-xs text-gray-400 mt-0.5">{year}</p>}

          {/* Explanation genre tags */}
          {matchingGenres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {matchingGenres.map((g) => (
                <span
                  key={g}
                  className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full leading-tight"
                >
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>

      {/* Action buttons */}
      <div className="flex gap-1 px-3 pb-1 pt-1">
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWatchlist(movie.id);
          }}
          title={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
          className={`flex-1 text-xs py-1 rounded-md transition-colors font-medium ${
            inWatchlist
              ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
              : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          {inWatchlist ? "★ Saved" : "☆ Save"}
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWatched(movie.id);
          }}
          title={watched ? "Mark as unwatched" : "Mark as watched"}
          className={`flex-1 text-xs py-1 rounded-md transition-colors font-medium ${
            watched
              ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
              : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          {watched ? "✓ Watched" : "○ Watched"}
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleNotInterested(movie.id);
          }}
          title={hidden ? "Unhide" : "Not interested"}
          className={`flex-1 text-xs py-1 rounded-md transition-colors font-medium ${
            hidden
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          {hidden ? "↩ Unhide" : "✕ Hide"}
        </button>
      </div>

      {/* Star rating row — only when watched */}
      {watched && (
        <div className="flex items-center justify-center gap-0.5 px-3 pb-3 pt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={(e) => {
                e.preventDefault();
                setRating(movie.id, star);
              }}
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
}
