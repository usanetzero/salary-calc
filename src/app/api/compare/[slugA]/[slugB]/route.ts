import { NextRequest, NextResponse } from "next/server";
import { getCityBySlug } from "@/lib/storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slugA: string; slugB: string }> },
) {
  try {
    const { slugA, slugB } = await params;
    const cityA = await getCityBySlug(slugA);
    const cityB = await getCityBySlug(slugB);
    if (!cityA || !cityB) {
      return NextResponse.json(
        { error: "One or both cities not found" },
        { status: 404 },
      );
    }
    const salaryMultiplier = cityB.costIndex / cityA.costIndex;
    const comparison = {
      cityA,
      cityB,
      salaryMultiplier,
      differences: {
        rent: ((cityB.medianRent - cityA.medianRent) / cityA.medianRent) * 100,
        income:
          ((cityB.medianIncome - cityA.medianIncome) / cityA.medianIncome) *
          100,
        costIndex:
          ((cityB.costIndex - cityA.costIndex) / cityA.costIndex) * 100,
        groceries:
          ((cityB.groceryIndex - cityA.groceryIndex) / cityA.groceryIndex) *
          100,
        utilities:
          ((cityB.utilitiesIndex - cityA.utilitiesIndex) /
            cityA.utilitiesIndex) *
          100,
        transportation:
          ((cityB.transportationIndex - cityA.transportationIndex) /
            cityA.transportationIndex) *
          100,
        healthcare:
          ((cityB.healthcareIndex - cityA.healthcareIndex) /
            cityA.healthcareIndex) *
          100,
      },
    };
    return NextResponse.json(comparison);
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Failed to compute comparison";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
