import { NextRequest, NextResponse } from "next/server";
import { getCityBySlug } from "@/lib/storage";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salary = searchParams.get("salary");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!salary || !from || !to) {
      return NextResponse.json(
        { error: "Missing parameters: salary, from, to" },
        { status: 400 },
      );
    }

    const fromCity = await getCityBySlug(from);
    const toCity = await getCityBySlug(to);
    if (!fromCity || !toCity) {
      return NextResponse.json({ error: "City not found" }, { status: 404 });
    }

    const salaryNum = parseFloat(salary);
    const adjustedSalary = salaryNum * (toCity.costIndex / fromCity.costIndex);
    const fromNetSalary = salaryNum * (1 - fromCity.taxRate / 100);
    const toNetSalary = adjustedSalary * (1 - toCity.taxRate / 100);
    const fromRentRatio = (fromCity.medianRent * 12) / salaryNum;
    const toRentRatio = (toCity.medianRent * 12) / adjustedSalary;

    return NextResponse.json({
      salary: salaryNum,
      adjustedSalary,
      fromCity,
      toCity,
      fromNetSalary,
      toNetSalary,
      fromRentRatio,
      toRentRatio,
      multiplier: toCity.costIndex / fromCity.costIndex,
    });
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Failed to calculate salary adjustment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
