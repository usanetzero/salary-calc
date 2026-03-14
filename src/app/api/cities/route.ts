import { NextResponse } from "next/server";
import { getAllCities } from "@/lib/storage";

export async function GET() {
  try {
    const cities = await getAllCities();
    return NextResponse.json(cities);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to fetch cities";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
