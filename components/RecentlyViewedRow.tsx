"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { IMG_BASE } from "@/lib/tmdb";
import { getRecentItems, type RecentItem } from "@/components/RecentlyViewedTracker";

export default function RecentlyViewedRow() {
  const [items, setItems] = useState<RecentItem[]>([]);

  useEffect(() => {
    setItems(getRecentItems());
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mt-10">
      <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide px-1">
        Recently Viewed
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {items.map((item) => (
          <Link
            key={`${item.type}-${item.id}`}
            href={`/${item.type}/${item.id}`}
            className="flex-shrink-0 group"
          >
            <div className="relative w-16 aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 group-hover:scale-105 transition-transform duration-200">
              {item.poster_path ? (
                <Image
                  src={`${IMG_BASE}${item.poster_path}`}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-xl">
                  🎬
                </div>
              )}
            </div>
            <p className="text-[10px] text-gray-400 mt-1 w-16 line-clamp-2 leading-tight">
              {item.title}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
