"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

interface WatchlistContextType {
  watchlist: number[];
  watched: number[];
  notInterested: number[];
  ratings: Record<number, number>;
  toggleWatchlist: (id: number) => void;
  toggleWatched: (id: number) => void;
  toggleNotInterested: (id: number) => void;
  isNotInterested: (id: number) => boolean;
  setRating: (id: number, rating: number) => void;
  isInWatchlist: (id: number) => boolean;
  isWatched: (id: number) => boolean;
  watchlistCount: number;
}

const WatchlistContext = createContext<WatchlistContextType>({
  watchlist: [],
  watched: [],
  notInterested: [],
  ratings: {},
  toggleWatchlist: () => {},
  toggleWatched: () => {},
  toggleNotInterested: () => {},
  isNotInterested: () => false,
  setRating: () => {},
  isInWatchlist: () => false,
  isWatched: () => false,
  watchlistCount: 0,
});

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<number[]>([]);
  const [watched, setWatched] = useState<number[]>([]);
  const [notInterested, setNotInterested] = useState<number[]>([]);
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedWatchlist = localStorage.getItem("w2w_watchlist");
      const savedWatched = localStorage.getItem("w2w_watched");
      const savedNotInterested = localStorage.getItem("w2w_not_interested");
      const savedRatings = localStorage.getItem("w2w_ratings");
      if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));
      if (savedWatched) setWatched(JSON.parse(savedWatched));
      if (savedNotInterested) setNotInterested(JSON.parse(savedNotInterested));
      if (savedRatings) setRatings(JSON.parse(savedRatings));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("w2w_watchlist", JSON.stringify(watchlist));
    } catch {
      // ignore
    }
  }, [watchlist, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("w2w_watched", JSON.stringify(watched));
    } catch {
      // ignore
    }
  }, [watched, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("w2w_not_interested", JSON.stringify(notInterested));
    } catch {
      // ignore
    }
  }, [notInterested, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("w2w_ratings", JSON.stringify(ratings));
    } catch {
      // ignore
    }
  }, [ratings, hydrated]);

  const toggleWatchlist = useCallback((id: number) => {
    setWatchlist((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const toggleWatched = useCallback((id: number) => {
    setWatched((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const toggleNotInterested = useCallback((id: number) => {
    setNotInterested((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const isNotInterested = useCallback(
    (id: number) => notInterested.includes(id),
    [notInterested]
  );

  const setRating = useCallback((id: number, rating: number) => {
    setRatings((prev) => ({ ...prev, [id]: rating }));
  }, []);

  const isInWatchlist = useCallback(
    (id: number) => watchlist.includes(id),
    [watchlist]
  );

  const isWatched = useCallback(
    (id: number) => watched.includes(id),
    [watched]
  );

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        watched,
        notInterested,
        ratings,
        toggleWatchlist,
        toggleWatched,
        toggleNotInterested,
        isNotInterested,
        setRating,
        isInWatchlist,
        isWatched,
        watchlistCount: watchlist.length,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  return useContext(WatchlistContext);
}
