import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getDetails,
  getCredits,
  getVideos,
  getSimilar,
  getRecommendations,
  IMG_BASE,
  BACKDROP_BASE,
  type CastMember,
  type CrewMember,
  type Video,
  type Movie,
} from "@/lib/tmdb";

interface Props {
  params: Promise<{ type: string; id: string }>;
}

function formatRuntime(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatMoney(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

export default async function DetailPage({ params }: Props) {
  const { type, id } = await params;

  if (type !== "movie" && type !== "tv") notFound();

  const [details, credits, videos, similar, recs] = await Promise.all([
    getDetails(Number(id), type),
    getCredits(Number(id), type),
    getVideos(Number(id), type),
    getSimilar(Number(id), type),
    getRecommendations(Number(id), type),
  ]);

  if (!details) notFound();

  const title = details.title || details.name || "Untitled";
  const year = (details.release_date || details.first_air_date || "").slice(0, 4);

  // Cast — TV uses aggregate_credits with different shape
  const cast: CastMember[] = type === "tv"
    ? (credits.cast || []).slice(0, 12).map((m: { id: number; name: string; roles?: { character: string }[]; profile_path: string | null; order: number }) => ({
        id: m.id,
        name: m.name,
        character: m.roles?.[0]?.character || "",
        profile_path: m.profile_path,
        order: m.order,
      }))
    : (credits.cast || []).slice(0, 12);

  // Crew — director(s) / creator(s)
  const directors: CrewMember[] = type === "movie"
    ? (credits.crew || []).filter((c: CrewMember) => c.job === "Director")
    : [];
  const creators = details.created_by || [];

  // Trailer
  const trailer: Video | undefined = (videos.results || []).find(
    (v: Video) => v.site === "YouTube" && v.type === "Trailer" && v.official
  ) || (videos.results || []).find(
    (v: Video) => v.site === "YouTube" && v.type === "Trailer"
  );

  // Similar — merge and dedupe
  const seen = new Set<number>([Number(id)]);
  const similarMerged: Movie[] = [];
  for (const item of [...(recs.results || []), ...(similar.results || [])]) {
    if (!seen.has(item.id) && item.poster_path) {
      seen.add(item.id);
      similarMerged.push({ ...item, media_type: type });
    }
    if (similarMerged.length >= 10) break;
  }

  return (
    <div className="min-h-screen">
      {/* Back */}
      <div className="absolute top-5 left-5 z-20">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors bg-black/40 backdrop-blur-sm px-3 py-2 rounded-full"
        >
          ← Back
        </Link>
      </div>

      {/* Backdrop */}
      <div className="relative w-full h-[55vh] min-h-[360px]">
        {details.backdrop_path ? (
          <Image
            src={`${BACKDROP_BASE}${details.backdrop_path}`}
            alt={title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-40 relative z-10">
        <div className="flex gap-6 md:gap-8 items-end mb-8">
          {/* Poster */}
          {details.poster_path && (
            <div className="relative w-32 md:w-44 flex-shrink-0 rounded-xl overflow-hidden shadow-2xl aspect-[2/3]">
              <Image
                src={`${IMG_BASE}${details.poster_path}`}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 128px, 176px"
              />
            </div>
          )}

          {/* Title block */}
          <div className="pb-1">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="text-xs bg-white/10 px-2 py-1 rounded-full">
                {type === "tv" ? "Series" : "Movie"}
              </span>
              {details.genres?.slice(0, 3).map((g) => (
                <span key={g.id} className="text-xs bg-white/10 px-2 py-1 rounded-full">
                  {g.name}
                </span>
              ))}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">{title}</h1>
            {details.tagline && (
              <p className="text-gray-400 italic mt-1">&quot;{details.tagline}&quot;</p>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-4 mb-8 text-sm">
          <div className="flex items-center gap-1.5 bg-yellow-400/10 text-yellow-400 px-3 py-1.5 rounded-full font-semibold">
            ★ {details.vote_average?.toFixed(1)}
          </div>
          {year && <div className="bg-white/10 px-3 py-1.5 rounded-full">{year}</div>}
          {details.runtime && (
            <div className="bg-white/10 px-3 py-1.5 rounded-full">{formatRuntime(details.runtime)}</div>
          )}
          {details.number_of_seasons && (
            <div className="bg-white/10 px-3 py-1.5 rounded-full">
              {details.number_of_seasons} season{details.number_of_seasons > 1 ? "s" : ""}
            </div>
          )}
          {details.number_of_episodes && (
            <div className="bg-white/10 px-3 py-1.5 rounded-full">
              {details.number_of_episodes} episodes
            </div>
          )}
          {details.status && (
            <div className={`px-3 py-1.5 rounded-full ${details.status === "Released" || details.status === "Ended" ? "bg-white/10" : "bg-green-500/20 text-green-400"}`}>
              {details.status}
            </div>
          )}
          {details.spoken_languages?.[0] && (
            <div className="bg-white/10 px-3 py-1.5 rounded-full">
              {details.spoken_languages[0].english_name}
            </div>
          )}
        </div>

        {/* Overview + trailer */}
        <div className="grid md:grid-cols-3 gap-8 mb-10">
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold mb-3">Overview</h2>
            <p className="text-gray-300 leading-relaxed">{details.overview || "No overview available."}</p>

            {/* Director / Creators */}
            {(directors.length > 0 || creators.length > 0) && (
              <div className="mt-5 flex flex-wrap gap-6">
                {directors.map((d) => (
                  <div key={d.id}>
                    <div className="text-xs text-gray-400 mb-0.5">Director</div>
                    <div className="font-medium">{d.name}</div>
                  </div>
                ))}
                {creators.map((c: { name: string }) => (
                  <div key={c.name}>
                    <div className="text-xs text-gray-400 mb-0.5">Creator</div>
                    <div className="font-medium">{c.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info sidebar */}
          <div className="space-y-3 text-sm">
            {details.production_countries?.[0] && (
              <div>
                <span className="text-gray-400">Country </span>
                <span>{details.production_countries[0].name}</span>
              </div>
            )}
            {details.networks && details.networks.length > 0 && (
              <div>
                <span className="text-gray-400">Network </span>
                <span>{details.networks.map((n: { name: string }) => n.name).join(", ")}</span>
              </div>
            )}
            {details.budget && details.budget > 0 && (
              <div>
                <span className="text-gray-400">Budget </span>
                <span>{formatMoney(details.budget)}</span>
              </div>
            )}
            {details.revenue && details.revenue > 0 && (
              <div>
                <span className="text-gray-400">Revenue </span>
                <span>{formatMoney(details.revenue)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Trailer */}
        {trailer && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-4">Trailer</h2>
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black max-w-2xl">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}`}
                title={trailer.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        )}

        {/* Cast */}
        {cast.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-4">Cast</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {cast.map((member) => (
                <div key={member.id} className="flex-shrink-0 w-24 text-center">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-800 mx-auto mb-2">
                    {member.profile_path ? (
                      <Image
                        src={`${IMG_BASE}${member.profile_path}`}
                        alt={member.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-2xl">👤</div>
                    )}
                  </div>
                  <div className="text-xs font-medium leading-tight">{member.name}</div>
                  {member.character && (
                    <div className="text-xs text-gray-400 leading-tight mt-0.5 line-clamp-2">{member.character}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar */}
        {similarMerged.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-semibold mb-4">You might also like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {similarMerged.map((item) => {
                const itemTitle = item.title || item.name || "Untitled";
                const itemType = item.media_type || type;
                return (
                  <Link key={item.id} href={`/${itemType}/${item.id}`} className="group">
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-800 group-hover:scale-105 transition-transform duration-200">
                      {item.poster_path && (
                        <Image
                          src={`${IMG_BASE}${item.poster_path}`}
                          alt={itemTitle}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, 20vw"
                        />
                      )}
                      <div className="absolute top-2 right-2 bg-black/70 rounded-full px-2 py-0.5 text-xs text-yellow-400 font-semibold">
                        ★ {item.vote_average?.toFixed(1)}
                      </div>
                    </div>
                    <p className="text-sm font-medium mt-2 line-clamp-2">{itemTitle}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
