import { NextRequest, NextResponse } from "next/server";
import { getCheapestCities } from "@/lib/storage";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get("state") || undefined;
    const limit = parseInt(searchParams.get("limit") || "20");
    const cities = await getCheapestCities(state, limit);
    return NextResponse.json(cities);
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Failed to fetch cheapest cities";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
