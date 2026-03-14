import { NextRequest, NextResponse } from "next/server";
import { getTopCities } from "@/lib/storage";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "12");
    const cities = await getTopCities(limit);
    return NextResponse.json(cities);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to fetch top cities";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
