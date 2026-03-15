import { NextResponse } from "next/server";
import { getAllStates } from "@/lib/storage";

export async function GET() {
  try {
    const states = await getAllStates();
    return NextResponse.json(states);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to fetch states";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
