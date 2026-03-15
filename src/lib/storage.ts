import type { City, PayscaleCity, USState } from "@/lib/types";
import { CityModel, PayscaleCityModel, StateModel } from "@/lib/city.model";
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
    fmrRent1BR: doc.fmrRent1BR as number | undefined,
    fmrRent2BR: doc.fmrRent2BR as number | undefined,
    fmrRent3BR: doc.fmrRent3BR as number | undefined,
    rentRPP: doc.rentRPP as number | undefined,
    goodsRPP: doc.goodsRPP as number | undefined,
    servicesRPP: doc.servicesRPP as number | undefined,
    averageSalary: doc.averageSalary as number | undefined,
  };
}

function docToPayscaleCity(doc: Record<string, unknown>): PayscaleCity {
  const cat = doc.categoryComparisons as
    | Record<string, string | null>
    | undefined;
  const housing = doc.housing as Record<string, string> | undefined;
  const food = doc.foodGrocery as Record<string, string> | undefined;
  const hc = doc.healthcare as Record<string, string> | undefined;
  return {
    name: doc.name as string,
    slug: doc.slug as string,
    stateName: doc.stateName as string,
    stateSlug: doc.stateSlug as string,
    url: doc.url as string | undefined,
    overallVsNationalAvg: doc.overallVsNationalAvg as string | undefined,
    categoryComparisons: cat
      ? {
          Housing: cat.Housing,
          Utilities: cat.Utilities,
          Groceries: cat.Groceries,
          Transportation: cat.Transportation,
        }
      : undefined,
    housing: housing
      ? {
          medianHomePrice: housing.medianHomePrice,
          medianRent: housing.medianRent,
          energyBill: housing.energyBill,
          phoneBill: housing.phoneBill,
          gas: housing.gas,
        }
      : undefined,
    foodGrocery: food
      ? {
          loafOfBread: food.loafOfBread,
          gallonOfMilk: food.gallonOfMilk,
          cartonOfEggs: food.cartonOfEggs,
          bunchOfBananas: food.bunchOfBananas,
          hamburger: food.hamburger,
        }
      : undefined,
    healthcare: hc
      ? {
          doctorsVisit: hc.doctorsVisit,
          dentistVisit: hc.dentistVisit,
          optometristVisit: hc.optometristVisit,
          rxDrug: hc.rxDrug,
          veterinaryVisit: hc.veterinaryVisit,
        }
      : undefined,
  };
}

function docToState(doc: Record<string, unknown>): USState {
  return {
    slug: doc.slug as string,
    name: doc.name as string,
    stateCode: doc.stateCode as string,
    totalCities: doc.totalCities as number,
    avgCostIndex: doc.avgCostIndex as number | undefined,
    avgTaxRate: doc.avgTaxRate as number | undefined,
    avgMedianRent: doc.avgMedianRent as number | undefined,
    avgMedianIncome: doc.avgMedianIncome as number | undefined,
    avgMedianHomeValue: doc.avgMedianHomeValue as number | undefined,
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
  // Try the State collection first
  const stateDoc = await StateModel.findOne({
    stateCode: stateCode.toUpperCase(),
  }).lean();
  if (stateDoc) {
    const s = stateDoc as unknown as Record<string, unknown>;
    return {
      name: s.name as string,
      avgTax: (s.avgTaxRate as number) || 0,
      avgCostIndex: (s.avgCostIndex as number) || 100,
    };
  }
  // Fallback: calculate from cities
  const docs = await CityModel.find({
    stateCode: stateCode.toUpperCase(),
  }).lean();
  if (!docs.length) return undefined;
  const cities = docs.map(docToCity);
  const avgTax = cities.reduce((s, c) => s + c.taxRate, 0) / cities.length;
  const avgCostIndex =
    cities.reduce((s, c) => s + c.costIndex, 0) / cities.length;
  return {
    name: cities[0].state,
    avgTax: Math.round(avgTax * 100) / 100,
    avgCostIndex: Math.round(avgCostIndex * 10) / 10,
  };
}

/* ── State Functions ──────────────────────────────────── */

export async function getAllStates(): Promise<USState[]> {
  await ensureConnection();
  const docs = await StateModel.find({}).sort({ name: 1 }).lean();
  return docs.map((d) => docToState(d as unknown as Record<string, unknown>));
}

export async function getStateBySlug(
  slug: string,
): Promise<USState | undefined> {
  await ensureConnection();
  const doc = await StateModel.findOne({ slug }).lean();
  return doc
    ? docToState(doc as unknown as Record<string, unknown>)
    : undefined;
}

export async function getStateByCode(
  code: string,
): Promise<USState | undefined> {
  await ensureConnection();
  const doc = await StateModel.findOne({
    stateCode: code.toUpperCase(),
  }).lean();
  return doc
    ? docToState(doc as unknown as Record<string, unknown>)
    : undefined;
}

/* ── Payscale City Functions ──────────────────────────── */

export async function getPayscaleCitiesByState(
  stateSlug: string,
): Promise<PayscaleCity[]> {
  await ensureConnection();
  const docs = await PayscaleCityModel.find({ stateSlug })
    .sort({ name: 1 })
    .lean();
  return docs.map((d) =>
    docToPayscaleCity(d as unknown as Record<string, unknown>),
  );
}

export async function getPayscaleCityBySlug(
  stateSlug: string,
  citySlug: string,
): Promise<PayscaleCity | undefined> {
  await ensureConnection();
  const doc = await PayscaleCityModel.findOne({
    stateSlug,
    slug: citySlug,
  }).lean();
  return doc
    ? docToPayscaleCity(doc as unknown as Record<string, unknown>)
    : undefined;
}

export async function searchPayscaleCities(
  query: string,
): Promise<PayscaleCity[]> {
  await ensureConnection();
  const regex = new RegExp(query, "i");
  const docs = await PayscaleCityModel.find({
    $or: [{ name: regex }, { stateName: regex }],
  })
    .limit(20)
    .lean();
  return docs.map((d) =>
    docToPayscaleCity(d as unknown as Record<string, unknown>),
  );
}
