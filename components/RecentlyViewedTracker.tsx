"use client";

import { useEffect } from "react";

export interface RecentItem {
  id: number;
  type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  vote_average: number;
}

export function saveRecentItem(item: RecentItem) {
  try {
    const raw = localStorage.getItem("w2w_recent");
    const existing: RecentItem[] = raw ? JSON.parse(raw) : [];
    // Remove duplicate
    const filtered = existing.filter((r) => !(r.id === item.id && r.type === item.type));
    // Prepend and cap at 20
    const updated = [item, ...filtered].slice(0, 20);
    localStorage.setItem("w2w_recent", JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function getRecentItems(): RecentItem[] {
  try {
    const raw = localStorage.getItem("w2w_recent");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

interface Props {
  item: RecentItem;
}

export default function RecentlyViewedTracker({ item }: Props) {
  useEffect(() => {
    saveRecentItem(item);
  }, [item.id, item.type]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
