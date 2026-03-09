"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import MovieCard from "@/components/MovieCard";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { IMG_ORIGINAL, type Movie, type WatchProvider } from "@/lib/tmdb";

type YearFilter = "all" | "classic" | "2000s" | "recent";
type RuntimeFilter = "all" | "short" | "standard" | "long";
type SortFilter = "popular" | "rating";

const YEAR_RANGES: Record<YearFilter, { label: string; from?: number; to?: number }> = {
  all: { label: "All" },
  classic: { label: "Classic", to: 1999 },
  "2000s": { label: "2000s", from: 2000, to: 2015 },
  recent: { label: "Recent", from: 2015 },
};

const RUNTIME_RANGES: Record<RuntimeFilter, { label: string; min?: number; max?: number }> = {
  all: { label: "All" },
  short: { label: "Short (<90m)", max: 89 },
  standard: { label: "Standard", min: 90, max: 150 },
  long: { label: "Long (>150m)", min: 151 },
};

const PROVIDER_VISIBLE = 5;

interface Props {
  fetchUrl: string;
  title: string;
  seedGenreIds?: number[];
}

export default function ResultsGrid({ fetchUrl, title, seedGenreIds }: Props) {
  const [results, setResults] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mediaType, setMediaType] = useState<"movie" | "tv">("movie");
  const [yearFilter, setYearFilter] = useState<YearFilter>("all");
  const [runtimeFilter, setRuntimeFilter] = useState<RuntimeFilter>("all");
  const [sortFilter, setSortFilter] = useState<SortFilter>("popular");
  const [copySuccess, setCopySuccess] = useState(false);

  // Provider state
  const [availableProviders, setAvailableProviders] = useState<WatchProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<WatchProvider | null>(null);
  const [region, setRegion] = useState("US");
  const [showAllProviders, setShowAllProviders] = useState(false);
  const [cardProviders, setCardProviders] = useState<Record<number, WatchProvider[]>>({});

  const sentinelRef = useRef<HTMLDivElement>(null);
  const { watched } = useWatchlist();
  const watchedSet = new Set(watched);
  const supportsProviderFilter = !fetchUrl.includes("/api/similar");

  // Detect region
  useEffect(() => {
    const lang = navigator.language || "en-US";
    const match = lang.match(/[a-z]{2}-([A-Z]{2})/);
    if (match) setRegion(match[1]);
  }, []);

  // Fetch available providers
  useEffect(() => {
    if (!supportsProviderFilter) return;
    fetch(`/api/providers?type=${mediaType}&region=${region}`)
      .then((r) => r.json())
      .then((d) => setAvailableProviders(d.providers || []))
      .catch(() => {});
  }, [mediaType, region, supportsProviderFilter]);

  const handleTypeSwitch = (type: "movie" | "tv") => {
    if (type === mediaType) return;
    setMediaType(type);
    setSelectedProvider(null);
    if (type === "tv") setRuntimeFilter("all");
  };

  const buildUrl = useCallback(
    (p: number, type: "movie" | "tv", yr: YearFilter, rt: RuntimeFilter, sort: SortFilter, provider: WatchProvider | null, reg: string) => {
      const separator = fetchUrl.includes("?") ? "&" : "?";
      let url = `${fetchUrl}${separator}page=${p}&type=${type}`;
      const yr_ = YEAR_RANGES[yr];
      const rt_ = RUNTIME_RANGES[rt];
      if (yr_.from) url += `&yearFrom=${yr_.from}`;
      if (yr_.to) url += `&yearTo=${yr_.to}`;
      if (type === "movie") {
        if (rt_.min) url += `&runtimeMin=${rt_.min}`;
        if (rt_.max) url += `&runtimeMax=${rt_.max}`;
      }
      url += `&sortBy=${sort === "rating" ? "vote_average.desc" : "popularity.desc"}`;
      if (provider) url += `&provider=${provider.provider_id}&region=${reg}`;
      return url;
    },
    [fetchUrl]
  );

  const fetchCardProviders = useCallback(async (items: Movie[], type: "movie" | "tv", reg: string) => {
    if (items.length === 0) return;
    const ids = items.map((m) => m.id).join(",");
    const res = await fetch(`/api/providers/batch?ids=${ids}&type=${type}&region=${reg}`);
    const data = await res.json();
    setCardProviders((prev) => ({ ...prev, ...data.providers }));
  }, []);

  const load = useCallback(
    async (p: number, type: "movie" | "tv", yr: YearFilter, rt: RuntimeFilter, sort: SortFilter, provider: WatchProvider | null, reg: string, reset = false) => {
      setLoading(true);
      try {
        const url = buildUrl(p, type, yr, rt, sort, provider, reg);
        const res = await fetch(url);
        const data = await res.json();
        const items: Movie[] = (data.results || []).map((r: Movie) => ({
          ...r,
          media_type: r.media_type || type,
        }));
        setResults((prev) => (reset ? items : [...prev, ...items]));
        setTotalPages(data.total_pages || 1);
        if (!provider) fetchCardProviders(items, type, reg);
      } finally {
        setLoading(false);
      }
    },
    [buildUrl, fetchCardProviders]
  );

  useEffect(() => {
    setPage(1);
    setCardProviders({});
    load(1, mediaType, yearFilter, runtimeFilter, sortFilter, selectedProvider, region, true);
  }, [fetchUrl, mediaType, yearFilter, runtimeFilter, sortFilter, selectedProvider, region, load]);

  // Infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && page < totalPages) {
          const next = page + 1;
          setPage(next);
          load(next, mediaType, yearFilter, runtimeFilter, sortFilter, selectedProvider, region);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, page, totalPages, mediaType, yearFilter, runtimeFilter, sortFilter, selectedProvider, region, load]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      const el = document.createElement("input");
      el.value = window.location.href;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const visibleResults = results.filter((m) => !watchedSet.has(m.id));
  const visibleProviders = showAllProviders ? availableProviders : availableProviders.slice(0, PROVIDER_VISIBLE);

  return (
    <div className="px-4 md:px-8 pb-12">
      {/* Title + type toggle + share */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-xl font-bold">{title}</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-lg text-sm bg-white/5 hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
          >
            {copySuccess ? "✓ Copied!" : "🔗 Share"}
          </button>
          <div className="flex gap-1 bg-[#161b22] rounded-lg p-1">
            <button onClick={() => handleTypeSwitch("movie")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${mediaType === "movie" ? "bg-white text-black" : "text-gray-400 hover:text-white"}`}>
              Movies
            </button>
            <button onClick={() => handleTypeSwitch("tv")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${mediaType === "tv" ? "bg-white text-black" : "text-gray-400 hover:text-white"}`}>
              Series
            </button>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        {/* Sort */}
        <div className="flex items-center gap-1 bg-[#161b22] rounded-lg p-1 text-sm">
          <span className="text-gray-500 px-2 text-xs">Sort:</span>
          <button onClick={() => setSortFilter("popular")}
            className={`px-3 py-1 rounded-md transition-colors ${sortFilter === "popular" ? "bg-white/20 text-white" : "text-gray-400 hover:text-white"}`}>
            Popular
          </button>
          <button onClick={() => setSortFilter("rating")}
            className={`px-3 py-1 rounded-md transition-colors ${sortFilter === "rating" ? "bg-white/20 text-white" : "text-gray-400 hover:text-white"}`}>
            Top Rated
          </button>
        </div>

        {/* Year */}
        <div className="flex items-center gap-1 bg-[#161b22] rounded-lg p-1 text-sm">
          <span className="text-gray-500 px-2 text-xs">Year:</span>
          {(Object.keys(YEAR_RANGES) as YearFilter[]).map((k) => (
            <button key={k} onClick={() => setYearFilter(k)}
              className={`px-3 py-1 rounded-md transition-colors ${yearFilter === k ? "bg-white/20 text-white" : "text-gray-400 hover:text-white"}`}>
              {YEAR_RANGES[k].label}
            </button>
          ))}
        </div>

        {/* Runtime (movies only) */}
        {mediaType === "movie" && (
          <div className="flex items-center gap-1 bg-[#161b22] rounded-lg p-1 text-sm">
            <span className="text-gray-500 px-2 text-xs">Runtime:</span>
            {(Object.keys(RUNTIME_RANGES) as RuntimeFilter[]).map((k) => (
              <button key={k} onClick={() => setRuntimeFilter(k)}
                className={`px-3 py-1 rounded-md transition-colors ${runtimeFilter === k ? "bg-white/20 text-white" : "text-gray-400 hover:text-white"}`}>
                {RUNTIME_RANGES[k].label}
              </button>
            ))}
          </div>
        )}

        {/* Platform filter */}
        {supportsProviderFilter && availableProviders.length > 0 && (
          <div className="flex items-center gap-1 bg-[#161b22] rounded-lg p-1 text-sm">
            <span className="text-gray-500 px-2 text-xs">On:</span>

            {/* Provider logo buttons */}
            {visibleProviders.map((p) => (
              <button
                key={p.provider_id}
                onClick={() => setSelectedProvider(selectedProvider?.provider_id === p.provider_id ? null : p)}
                title={p.provider_name}
                className={`relative w-7 h-7 rounded-md overflow-hidden flex-shrink-0 transition-all ${
                  selectedProvider?.provider_id === p.provider_id
                    ? "ring-2 ring-white opacity-100"
                    : "opacity-50 hover:opacity-90"
                }`}
              >
                <Image src={`${IMG_ORIGINAL}${p.logo_path}`} alt={p.provider_name} fill className="object-cover" sizes="28px" />
              </button>
            ))}

            {/* See all / collapse toggle */}
            {availableProviders.length > PROVIDER_VISIBLE && (
              <button
                onClick={() => setShowAllProviders((v) => !v)}
                className="px-2 py-1 rounded-md text-gray-400 hover:text-white transition-colors whitespace-nowrap"
              >
                {showAllProviders ? "Less" : `+${availableProviders.length - PROVIDER_VISIBLE}`}
              </button>
            )}

            {/* Clear active filter */}
            {selectedProvider && (
              <button
                onClick={() => setSelectedProvider(null)}
                className="px-2 py-1 rounded-md text-gray-400 hover:text-white transition-colors"
                title="Clear platform filter"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      {/* Grid */}
      {visibleResults.length > 0 ? (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {visibleResults.map((movie) => (
              <MovieCard
                key={`${movie.id}-${movie.media_type}`}
                movie={movie}
                seedGenreIds={seedGenreIds}
                streamProviders={selectedProvider ? [selectedProvider] : (cardProviders[movie.id] || [])}
              />
            ))}
          </div>
          <div ref={sentinelRef} className="mt-8 flex justify-center h-12">
            {loading && (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <div className="w-4 h-4 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
                Loading more...
              </div>
            )}
          </div>
        </>
      ) : loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-[#161b22] aspect-[2/3] animate-pulse" />
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center py-12">No results found.</p>
      )}
    </div>
  );
}
