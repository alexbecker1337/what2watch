import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY!;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const ids = searchParams.get("ids")?.split(",").map(Number).filter(Boolean) || [];
  const type = searchParams.get("type") || "movie";
  const region = searchParams.get("region") || "US";

  if (ids.length === 0) return NextResponse.json({ providers: {} });

  try {
    const results = await Promise.all(
      ids.map(async (id) => {
        const url = `${TMDB_BASE}/${type}/${id}/watch/providers?api_key=${API_KEY}`;
        const res = await fetch(url, { next: { revalidate: 3600 } });
        const data = await res.json();
        const countryData = data.results?.[region];
        const flatrate = (countryData?.flatrate || []).slice(0, 3).map(
          (p: { provider_id: number; provider_name: string; logo_path: string }) => ({
            provider_id: p.provider_id,
            provider_name: p.provider_name,
            logo_path: p.logo_path,
          })
        );
        return { id, providers: flatrate };
      })
    );

    const map: Record<number, { provider_id: number; provider_name: string; logo_path: string }[]> = {};
    for (const { id, providers } of results) {
      if (providers.length > 0) map[id] = providers;
    }

    return NextResponse.json({ providers: map });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ providers: {} });
  }
}
