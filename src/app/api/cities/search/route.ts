import { NextRequest, NextResponse } from "next/server";
import { searchCities } from "@/lib/storage";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    if (!query || query.length < 1) {
      return NextResponse.json([]);
    }
    const cities = await searchCities(query);
    return NextResponse.json(cities.slice(0, 10));
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to search cities";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
