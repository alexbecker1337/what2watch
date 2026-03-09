import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IMG_BASE, IMG_ORIGINAL } from "@/lib/tmdb";
import BackButton from "@/components/BackButton";

interface CollectionPart {
  id: number;
  title: string;
  poster_path: string | null;
  release_date?: string;
  vote_average?: number;
  overview?: string;
}

interface Collection {
  id: number;
  name: string;
  overview?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  parts: CollectionPart[];
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CollectionPage({ params }: Props) {
  const { id } = await params;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/collection/${id}`, { next: { revalidate: 3600 } });
  if (!res.ok) notFound();

  const collection: Collection = await res.json();
  if (!collection.id) notFound();

  const sortedParts = [...(collection.parts || [])].sort((a, b) => {
    const dateA = a.release_date || "";
    const dateB = b.release_date || "";
    return dateA.localeCompare(dateB);
  });

  return (
    <div className="min-h-screen">
      {/* Back */}
      <div className="absolute top-5 left-5 z-20">
        <BackButton />
      </div>

      {/* Backdrop */}
      <div className="relative w-full h-[40vh] min-h-[280px]">
        {collection.backdrop_path ? (
          <Image
            src={`${IMG_ORIGINAL}${collection.backdrop_path}`}
            alt={collection.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-24 relative z-10">
        <div className="flex gap-6 items-end mb-8">
          {collection.poster_path && (
            <div className="relative w-28 md:w-36 flex-shrink-0 rounded-xl overflow-hidden shadow-2xl aspect-[2/3]">
              <Image
                src={`${IMG_BASE}${collection.poster_path}`}
                alt={collection.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 112px, 144px"
              />
            </div>
          )}
          <div className="pb-1">
            <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Collection</div>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">{collection.name}</h1>
            <p className="text-gray-400 text-sm mt-1">{sortedParts.length} film{sortedParts.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {collection.overview && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-3">About</h2>
            <p className="text-gray-300 leading-relaxed">{collection.overview}</p>
          </div>
        )}

        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-4">Films in this collection</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sortedParts.map((part) => {
              const year = (part.release_date || "").slice(0, 4);
              return (
                <Link key={part.id} href={`/movie/${part.id}`} className="group">
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-800 group-hover:scale-105 transition-transform duration-200">
                    {part.poster_path ? (
                      <Image
                        src={`${IMG_BASE}${part.poster_path}`}
                        alt={part.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, 20vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-4xl">🎬</div>
                    )}
                    {part.vote_average && part.vote_average > 0 && (
                      <div className="absolute top-2 right-2 bg-black/70 rounded-full px-2 py-0.5 text-xs text-yellow-400 font-semibold">
                        ★ {part.vote_average.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium mt-2 line-clamp-2">{part.title}</p>
                  {year && <p className="text-xs text-gray-400 mt-0.5">{year}</p>}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
