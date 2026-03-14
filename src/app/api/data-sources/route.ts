import { NextResponse } from "next/server";
import { connectMongoDB, isMongoConnected } from "@/lib/mongodb";
import { CityModel } from "@/lib/city.model";

export async function GET() {
  try {
    if (!isMongoConnected()) {
      await connectMongoDB();
    }

    const mongoConnected = isMongoConnected();
    let lastUpdated: Date | null = null;
    let cityCount = 0;

    if (mongoConnected) {
      const latest = await CityModel.findOne({})
        .sort({ dataLastUpdated: -1 })
        .lean();
      lastUpdated = latest
        ? ((latest as Record<string, unknown>).dataLastUpdated as Date)
        : null;
      cityCount = await CityModel.countDocuments();
    }

    return NextResponse.json({
      storageBackend: mongoConnected ? "MongoDB Atlas" : "Not Connected",
      mongoConnected,
      cityCount,
      lastUpdated: lastUpdated?.toISOString() ?? null,
      sources: [
        {
          name: "US Census Bureau",
          description: "American Community Survey 5-Year Estimates (ACS5)",
          fields: [
            "medianIncome",
            "medianRent",
            "medianHomeValue",
            "population",
          ],
          url: "https://api.census.gov/data/2022/acs/acs5",
          updateFrequency: "Annual",
        },
        {
          name: "Bureau of Economic Analysis (BEA)",
          description:
            "Regional Price Parities (MARPP) — cost index where US avg = 100",
          fields: ["costIndex"],
          url: "https://apps.bea.gov/api/data",
          updateFrequency: "Annual",
        },
        {
          name: "HUD Fair Market Rents",
          description: "Fair Market Rents (FMR) for metropolitan areas",
          fields: ["medianRent"],
          url: "https://www.huduser.gov/hudapi/public/fmr",
          updateFrequency: "Annual (FY2024)",
        },
        {
          name: "Bureau of Labor Statistics (BLS)",
          description:
            "Local Area Unemployment Statistics (LAUS) + Consumer Price Index (CPI)",
          fields: [
            "unemploymentRate",
            "utilitiesIndex",
            "groceryIndex",
            "transportationIndex",
            "healthcareIndex",
          ],
          url: "https://api.bls.gov/publicAPI/v2/timeseries/data/",
          updateFrequency: "Monthly / Annual",
        },
        {
          name: "Tax Foundation",
          description: "State Individual Income Tax Rates (2024)",
          fields: ["taxRate"],
          url: "https://taxfoundation.org/data/all/state/state-income-tax-rates/",
          updateFrequency: "Annual",
        },
      ],
    });
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Failed to fetch data source info";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
