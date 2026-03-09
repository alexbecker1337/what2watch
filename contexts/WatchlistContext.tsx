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
  toggleWatchlist: (id: number) => void;
  toggleWatched: (id: number) => void;
  isInWatchlist: (id: number) => boolean;
  isWatched: (id: number) => boolean;
  watchlistCount: number;
}

const WatchlistContext = createContext<WatchlistContextType>({
  watchlist: [],
  watched: [],
  toggleWatchlist: () => {},
  toggleWatched: () => {},
  isInWatchlist: () => false,
  isWatched: () => false,
  watchlistCount: 0,
});

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<number[]>([]);
  const [watched, setWatched] = useState<number[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedWatchlist = localStorage.getItem("w2w_watchlist");
      const savedWatched = localStorage.getItem("w2w_watched");
      if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));
      if (savedWatched) setWatched(JSON.parse(savedWatched));
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
        toggleWatchlist,
        toggleWatched,
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
