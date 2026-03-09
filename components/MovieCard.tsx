import Image from "next/image";
import { IMG_BASE, type Movie } from "@/lib/tmdb";

interface Props {
  movie: Movie;
}

export default function MovieCard({ movie }: Props) {
  const title = movie.title || movie.name || "Untitled";
  const year = (movie.release_date || movie.first_air_date || "").slice(0, 4);
  const rating = movie.vote_average?.toFixed(1);
  const isTV = movie.media_type === "tv" || !!movie.name;

  return (
    <div className="group relative rounded-xl overflow-hidden bg-[#161b22] hover:scale-105 transition-transform duration-200 cursor-pointer">
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
        {isTV && (
          <div className="absolute top-2 left-2 bg-blue-600/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-semibold">
            TV
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
          <p className="text-xs text-gray-300 line-clamp-4">{movie.overview}</p>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2">{title}</h3>
        {year && <p className="text-xs text-gray-400 mt-0.5">{year}</p>}
      </div>
    </div>
  );
}
