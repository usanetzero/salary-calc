import { NextRequest, NextResponse } from "next/server";
import { getCityBySlug } from "@/lib/storage";
import { connectMongoDB, isMongoConnected } from "@/lib/mongodb";
import { CityModel } from "@/lib/city.model";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!isMongoConnected()) {
      await connectMongoDB();
    }
    const doc = await CityModel.findOne({ slug }).lean();
    if (!doc) return NextResponse.json({ error: "City not found" }, { status: 404 });
    return NextResponse.json({
      slug: (doc as Record<string, unknown>).slug,
      name: (doc as Record<string, unknown>).name,
      dataSource: (doc as Record<string, unknown>).dataSource,
      dataLastUpdated: (doc as Record<string, unknown>).dataLastUpdated,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to fetch city data sources";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
