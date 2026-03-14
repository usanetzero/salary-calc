import { NextRequest, NextResponse } from "next/server";
import { getStateInfo } from "@/lib/storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ stateCode: string }> }
) {
  try {
    const { stateCode } = await params;
    const info = await getStateInfo(stateCode);
    if (!info) {
      return NextResponse.json({ error: "State not found" }, { status: 404 });
    }
    return NextResponse.json(info);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to fetch state info";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
