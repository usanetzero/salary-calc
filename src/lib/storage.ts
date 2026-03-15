import type { City } from "@/lib/types";
import { CityModel } from "@/lib/city.model";
import { connectMongoDB, isMongoConnected } from "@/lib/mongodb";

function docToCity(doc: Record<string, unknown>): City {
  return {
    slug: doc.slug as string,
    name: doc.name as string,
    state: doc.state as string,
    stateCode: doc.stateCode as string,
    medianIncome: doc.medianIncome as number,
    medianRent: doc.medianRent as number,
    medianHomeValue: doc.medianHomeValue as number,
    costIndex: doc.costIndex as number,
    taxRate: doc.taxRate as number,
    unemploymentRate: doc.unemploymentRate as number,
    utilitiesIndex: doc.utilitiesIndex as number,
    groceryIndex: doc.groceryIndex as number,
    transportationIndex: doc.transportationIndex as number,
    healthcareIndex: doc.healthcareIndex as number,
    population: doc.population as number,
    description: doc.description as string | undefined,
  };
}

async function ensureConnection(): Promise<void> {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      "MONGODB_URI environment variable is not configured. All data must come from the database — no static/fallback data is used. Please set MONGODB_URI in your .env.local file.",
    );
  }
  if (!isMongoConnected()) {
    await connectMongoDB();
  }
}

export async function getAllCities(): Promise<City[]> {
  await ensureConnection();
  const docs = await CityModel.find({}).lean();
  return docs.map(docToCity);
}

export async function getCityBySlug(slug: string): Promise<City | undefined> {
  await ensureConnection();
  const doc = await CityModel.findOne({ slug }).lean();
  return doc ? docToCity(doc as unknown as Record<string, unknown>) : undefined;
}

export async function getCitiesByState(stateCode: string): Promise<City[]> {
  await ensureConnection();
  const docs = await CityModel.find({
    stateCode: stateCode.toUpperCase(),
  }).lean();
  return docs.map(docToCity);
}

export async function getTopCities(limit: number = 12): Promise<City[]> {
  await ensureConnection();
  const docs = await CityModel.find({})
    .sort({ population: -1 })
    .limit(limit)
    .lean();
  return docs.map(docToCity);
}

export async function getCheapestCities(
  stateCode?: string,
  limit: number = 20,
): Promise<City[]> {
  await ensureConnection();
  const filter = stateCode ? { stateCode: stateCode.toUpperCase() } : {};
  const docs = await CityModel.find(filter)
    .sort({ costIndex: 1 })
    .limit(limit)
    .lean();
  return docs.map(docToCity);
}

export async function searchCities(query: string): Promise<City[]> {
  await ensureConnection();
  const regex = new RegExp(query, "i");
  const docs = await CityModel.find({
    $or: [
      { name: regex },
      { state: regex },
      { stateCode: regex },
      { slug: regex },
    ],
  })
    .limit(10)
    .lean();
  return docs.map(docToCity);
}

const STATES: Record<
  string,
  { name: string; avgTax: number; avgCostIndex: number }
> = {
  NY: { name: "New York", avgTax: 6.85, avgCostIndex: 132.5 },
  CA: { name: "California", avgTax: 9.3, avgCostIndex: 149.8 },
  WA: { name: "Washington", avgTax: 0.0, avgCostIndex: 132.0 },
  MA: { name: "Massachusetts", avgTax: 5.0, avgCostIndex: 138.5 },
  IL: { name: "Illinois", avgTax: 4.95, avgCostIndex: 104.2 },
  TX: { name: "Texas", avgTax: 0.0, avgCostIndex: 96.1 },
  CO: { name: "Colorado", avgTax: 4.55, avgCostIndex: 118.0 },
  FL: { name: "Florida", avgTax: 0.0, avgCostIndex: 103.5 },
  TN: { name: "Tennessee", avgTax: 0.0, avgCostIndex: 95.8 },
  GA: { name: "Georgia", avgTax: 5.75, avgCostIndex: 100.8 },
  AZ: { name: "Arizona", avgTax: 2.5, avgCostIndex: 95.2 },
  MN: { name: "Minnesota", avgTax: 9.85, avgCostIndex: 104.2 },
  OR: { name: "Oregon", avgTax: 9.9, avgCostIndex: 124.8 },
  NC: { name: "North Carolina", avgTax: 4.75, avgCostIndex: 97.2 },
  MD: { name: "Maryland", avgTax: 5.75, avgCostIndex: 112.5 },
  WI: { name: "Wisconsin", avgTax: 7.65, avgCostIndex: 88.5 },
  PA: { name: "Pennsylvania", avgTax: 3.07, avgCostIndex: 92.4 },
  OH: { name: "Ohio", avgTax: 4.997, avgCostIndex: 86.5 },
  IN: { name: "Indiana", avgTax: 3.23, avgCostIndex: 84.5 },
  MO: { name: "Missouri", avgTax: 5.4, avgCostIndex: 84.8 },
  NE: { name: "Nebraska", avgTax: 6.84, avgCostIndex: 86.5 },
  NV: { name: "Nevada", avgTax: 0.0, avgCostIndex: 98.5 },
  VA: { name: "Virginia", avgTax: 5.75, avgCostIndex: 104.2 },
  KY: { name: "Kentucky", avgTax: 5.0, avgCostIndex: 86.5 },
  MI: { name: "Michigan", avgTax: 4.25, avgCostIndex: 82.5 },
  LA: { name: "Louisiana", avgTax: 6.0, avgCostIndex: 92.8 },
  NM: { name: "New Mexico", avgTax: 5.9, avgCostIndex: 90.5 },
  KS: { name: "Kansas", avgTax: 5.7, avgCostIndex: 82.8 },
  OK: { name: "Oklahoma", avgTax: 4.75, avgCostIndex: 83.5 },
  DC: { name: "Washington DC", avgTax: 8.95, avgCostIndex: 155.2 },
};

export async function getComparisonData(slugA: string, slugB: string) {
  const [cityA, cityB] = await Promise.all([
    getCityBySlug(slugA),
    getCityBySlug(slugB),
  ]);
  if (!cityA || !cityB) return null;
  const salaryMultiplier = cityB.costIndex / cityA.costIndex;
  return {
    cityA,
    cityB,
    salaryMultiplier,
    differences: {
      rent: ((cityB.medianRent - cityA.medianRent) / cityA.medianRent) * 100,
      income:
        ((cityB.medianIncome - cityA.medianIncome) / cityA.medianIncome) * 100,
      costIndex: ((cityB.costIndex - cityA.costIndex) / cityA.costIndex) * 100,
      groceries:
        ((cityB.groceryIndex - cityA.groceryIndex) / cityA.groceryIndex) * 100,
      utilities:
        ((cityB.utilitiesIndex - cityA.utilitiesIndex) / cityA.utilitiesIndex) *
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
}

export async function getStateInfo(
  stateCode: string,
): Promise<{ name: string; avgTax: number; avgCostIndex: number } | undefined> {
  await ensureConnection();
  const docs = await CityModel.find({
    stateCode: stateCode.toUpperCase(),
  }).lean();
  if (!docs.length) return undefined;
  const cities = docs.map(docToCity);
  const avgTax = cities.reduce((s, c) => s + c.taxRate, 0) / cities.length;
  const avgCostIndex =
    cities.reduce((s, c) => s + c.costIndex, 0) / cities.length;
  const stateInfo = STATES[stateCode.toUpperCase()];
  return {
    name: stateInfo?.name ?? cities[0].state,
    avgTax: Math.round(avgTax * 100) / 100,
    avgCostIndex: Math.round(avgCostIndex * 10) / 10,
  };
}
