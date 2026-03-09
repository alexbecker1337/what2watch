import { NextRequest, NextResponse } from "next/server";
import { getDetails } from "@/lib/tmdb";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const id = Number(searchParams.get("id"));
  const type = (searchParams.get("type") || "movie") as "movie" | "tv";

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    const data = await getDetails(id, type);
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
