import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY!;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type") || "movie";
  const region = searchParams.get("region") || "US";

  try {
    const url = `${TMDB_BASE}/watch/providers/${type}?api_key=${API_KEY}&watch_region=${region}&language=en`;
    const res = await fetch(url, { next: { revalidate: 86400 } }); // cache 24h
    const data = await res.json();

    // Return top providers sorted by display_priority
    const providers = (data.results || [])
      .sort((a: { display_priority: number }, b: { display_priority: number }) => a.display_priority - b.display_priority)
      .slice(0, 30)
      .map((p: { provider_id: number; provider_name: string; logo_path: string }) => ({
        provider_id: p.provider_id,
        provider_name: p.provider_name,
        logo_path: p.logo_path,
      }));

    return NextResponse.json({ providers });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ providers: [] });
  }
}
