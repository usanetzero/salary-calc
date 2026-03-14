import { NextRequest, NextResponse } from "next/server";
import { getCitiesByState } from "@/lib/storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ stateCode: string }> },
) {
  try {
    const { stateCode } = await params;
    const cities = await getCitiesByState(stateCode);
    return NextResponse.json(cities);
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Failed to fetch cities by state";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
