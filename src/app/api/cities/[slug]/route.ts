import { NextRequest, NextResponse } from "next/server";
import { getCityBySlug } from "@/lib/storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const city = await getCityBySlug(slug);
    if (!city) {
      return NextResponse.json({ error: "City not found" }, { status: 404 });
    }
    return NextResponse.json(city);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to fetch city";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
