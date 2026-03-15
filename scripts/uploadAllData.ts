/**
 * Upload all-cities.json and all_states_combined.json to MongoDB
 *
 * Usage: npx tsx scripts/uploadAllData.ts
 */
import "dotenv/config";
import mongoose from "mongoose";
import * as fs from "fs";
import * as path from "path";

// ── Inline schemas to avoid import issues ──────────────────

const CitySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    state: { type: String, required: true },
    stateCode: { type: String, required: true, index: true },
    medianIncome: { type: Number, required: true },
    medianRent: { type: Number, required: true },
    medianHomeValue: { type: Number, required: true },
    costIndex: { type: Number, required: true },
    taxRate: { type: Number, required: true },
    unemploymentRate: { type: Number, required: true },
    utilitiesIndex: { type: Number, required: true },
    groceryIndex: { type: Number, required: true },
    transportationIndex: { type: Number, required: true },
    healthcareIndex: { type: Number, required: true },
    population: { type: Number, required: true },
    description: { type: String },
    fmrRent1BR: { type: Number },
    fmrRent2BR: { type: Number },
    fmrRent3BR: { type: Number },
    rentRPP: { type: Number },
    goodsRPP: { type: Number },
    servicesRPP: { type: Number },
    averageSalary: { type: Number },
    dataSource: {
      income: String,
      rent: String,
      homeValue: String,
      costIndex: String,
      unemployment: String,
      utilities: String,
      groceries: String,
      transportation: String,
      healthcare: String,
    },
    dataLastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const PayscaleCitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, index: true },
    stateName: { type: String, required: true, index: true },
    stateSlug: { type: String, required: true, index: true },
    url: { type: String },
    overallVsNationalAvg: { type: String },
    categoryComparisons: {
      Housing: { type: String },
      Utilities: { type: String },
      Groceries: { type: String },
      Transportation: { type: String },
    },
    housing: {
      medianHomePrice: { type: String },
      medianRent: { type: String },
      energyBill: { type: String },
      phoneBill: { type: String },
      gas: { type: String },
    },
    foodGrocery: {
      loafOfBread: { type: String },
      gallonOfMilk: { type: String },
      cartonOfEggs: { type: String },
      bunchOfBananas: { type: String },
      hamburger: { type: String },
    },
    healthcare: {
      doctorsVisit: { type: String },
      dentistVisit: { type: String },
      optometristVisit: { type: String },
      rxDrug: { type: String },
      veterinaryVisit: { type: String },
    },
  },
  { timestamps: true },
);
PayscaleCitySchema.index({ stateName: 1, slug: 1 }, { unique: true });

const StateSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    stateCode: { type: String, required: true, unique: true, index: true },
    totalCities: { type: Number, required: true },
    avgCostIndex: { type: Number },
    avgTaxRate: { type: Number },
    avgMedianRent: { type: Number },
    avgMedianIncome: { type: Number },
    avgMedianHomeValue: { type: Number },
    description: { type: String },
  },
  { timestamps: true },
);

// ── State code mapping ─────────────────────────────────────
const STATE_CODE_MAP: Record<string, string> = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  "District of Columbia": "DC",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
};

// State tax rates
const STATE_TAX_RATES: Record<string, number> = {
  AL: 5.0,
  AK: 0,
  AZ: 2.5,
  AR: 4.4,
  CA: 13.3,
  CO: 4.4,
  CT: 6.99,
  DE: 6.6,
  DC: 10.75,
  FL: 0,
  GA: 5.49,
  HI: 11.0,
  ID: 5.8,
  IL: 4.95,
  IN: 3.05,
  IA: 5.7,
  KS: 5.7,
  KY: 4.0,
  LA: 4.25,
  ME: 7.15,
  MD: 5.75,
  MA: 5.0,
  MI: 4.25,
  MN: 9.85,
  MS: 5.0,
  MO: 4.95,
  MT: 6.75,
  NE: 6.64,
  NV: 0,
  NH: 0,
  NJ: 10.75,
  NM: 5.9,
  NY: 10.9,
  NC: 4.5,
  ND: 1.95,
  OH: 3.5,
  OK: 4.75,
  OR: 9.9,
  PA: 3.07,
  RI: 5.99,
  SC: 6.4,
  SD: 0,
  TN: 0,
  TX: 0,
  UT: 4.65,
  VT: 8.75,
  VA: 5.75,
  WA: 0,
  WV: 6.5,
  WI: 7.65,
  WY: 0,
};

// State descriptions
function generateStateDescription(
  name: string,
  code: string,
  totalCities: number,
): string {
  const noTaxStates = ["AK", "FL", "NV", "NH", "SD", "TN", "TX", "WA", "WY"];
  const taxNote = noTaxStates.includes(code)
    ? `${name} has no state income tax, making it an attractive destination for individuals seeking to maximize take-home pay.`
    : `${name} has a state income tax rate of up to ${STATE_TAX_RATES[code]}%.`;

  return `${name} is home to ${totalCities} cities and towns tracked in our cost of living database. ${taxNote} Explore cost of living data, housing prices, rent, groceries, utilities, healthcare, and transportation costs for cities across ${name}.`;
}

// ── Helpers ────────────────────────────────────────────────

function parseCurrency(str: string | undefined | null): number | undefined {
  if (!str) return undefined;
  const cleaned = str.replace(/[^0-9.]/g, "");
  const val = parseFloat(cleaned);
  return isNaN(val) ? undefined : val;
}

function parsePercent(str: string | undefined | null): number | undefined {
  if (!str) return undefined;
  const match = str.match(/([+-]?\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : undefined;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("ERROR: MONGODB_URI not set in environment");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("Connected!\n");

  const CityModel = mongoose.models.City || mongoose.model("City", CitySchema);
  const PayscaleCityModelLocal =
    mongoose.models.PayscaleCity ||
    mongoose.model("PayscaleCity", PayscaleCitySchema);
  const StateModelLocal =
    mongoose.models.State || mongoose.model("State", StateSchema);

  // ── 1. Upload all-cities.json ────────────────────────────
  console.log("=== Uploading all-cities.json ===");
  const allCitiesPath = path.join(__dirname, "data", "all-cities.json");
  const allCitiesRaw = JSON.parse(fs.readFileSync(allCitiesPath, "utf-8"));

  // Delete previous city data
  const deletedCities = await CityModel.deleteMany({});
  console.log(`Deleted ${deletedCities.deletedCount} existing cities`);

  const cityDocs = allCitiesRaw.map((c: Record<string, unknown>) => ({
    slug: c.slug,
    name: c.name,
    state: c.state,
    stateCode: c.stateCode,
    medianIncome: c.medianIncome || 0,
    medianRent: c.medianRent || 0,
    medianHomeValue: c.medianHomeValue || 0,
    costIndex: c.costIndex || 100,
    taxRate: c.stateTaxRate ?? STATE_TAX_RATES[c.stateCode as string] ?? 0,
    unemploymentRate: c.unemploymentRate || 0,
    utilitiesIndex: c.utilitiesIndex || 100,
    groceryIndex: c.groceryIndex || 100,
    transportationIndex: c.transportationIndex || 100,
    healthcareIndex: c.healthcareIndex || 100,
    population: c.population || 0,
    description: c.description || "",
    fmrRent1BR: c.fmrRent1BR || undefined,
    fmrRent2BR: c.fmrRent2BR || undefined,
    fmrRent3BR: c.fmrRent3BR || undefined,
    rentRPP: c.rentRPP || undefined,
    goodsRPP: c.goodsRPP || undefined,
    servicesRPP: c.servicesRPP || undefined,
    averageSalary: c.averageSalary || undefined,
    dataSource: {
      income: "US Census Bureau ACS",
      rent: "HUD Fair Market Rents",
      homeValue: "US Census Bureau ACS",
      costIndex: "BEA Regional Price Parities",
      unemployment: "Bureau of Labor Statistics",
      groceries: "BLS CPI",
      utilities: "BLS CPI",
      transportation: "BLS CPI",
      healthcare: "BLS CPI",
    },
    dataLastUpdated: new Date(),
  }));

  await CityModel.insertMany(cityDocs);
  console.log(`Inserted ${cityDocs.length} cities from all-cities.json\n`);

  // ── 2. Upload all_states_combined.json ───────────────────
  console.log("=== Uploading all_states_combined.json ===");
  const statesPath = path.join(__dirname, "data", "all_states_combined.json");
  const statesRaw = JSON.parse(fs.readFileSync(statesPath, "utf-8"));

  // Delete existing payscale cities and states
  const deletedPS = await PayscaleCityModelLocal.deleteMany({});
  console.log(`Deleted ${deletedPS.deletedCount} existing payscale cities`);
  const deletedStates = await StateModelLocal.deleteMany({});
  console.log(`Deleted ${deletedStates.deletedCount} existing states`);

  let totalPayscaleCities = 0;
  const stateDocs: unknown[] = [];

  for (const state of statesRaw.states) {
    const stateName = state.state as string;
    const stateSlug = state.slug as string;
    const stateCode = STATE_CODE_MAP[stateName] || "";
    const totalCities = state.total_cities as number;

    // Create state document
    stateDocs.push({
      slug: stateSlug,
      name: stateName,
      stateCode,
      totalCities,
      description: generateStateDescription(stateName, stateCode, totalCities),
    });

    // Process cities for this state
    const psCities = (state.cities as Array<Record<string, unknown>>).map(
      (city) => {
        const housing = city.housing_utilities_transportation as
          | Record<string, string>
          | undefined;
        const food = city.food_grocery as Record<string, string> | undefined;
        const hc = city.healthcare as Record<string, string> | undefined;
        const catComp = city.category_comparisons as
          | Record<string, string | null>
          | undefined;

        return {
          name: city.name as string,
          slug: city.slug as string,
          stateName,
          stateSlug,
          url: city.url as string | undefined,
          overallVsNationalAvg: city.overall_vs_national_avg as
            | string
            | undefined,
          categoryComparisons: catComp
            ? {
                Housing: catComp.Housing ?? null,
                Utilities: catComp.Utilities ?? null,
                Groceries: catComp.Groceries ?? null,
                Transportation: catComp.Transportation ?? null,
              }
            : undefined,
          housing: housing
            ? {
                medianHomePrice: housing.median_home_price,
                medianRent: housing.median_rent,
                energyBill: housing.energy_bill,
                phoneBill: housing.phone_bill,
                gas: housing.gas,
              }
            : undefined,
          foodGrocery: food
            ? {
                loafOfBread: food.loaf_of_bread,
                gallonOfMilk: food.gallon_of_milk,
                cartonOfEggs: food.carton_of_eggs,
                bunchOfBananas: food.bunch_of_bananas,
                hamburger: food.hamburger,
              }
            : undefined,
          healthcare: hc
            ? {
                doctorsVisit: hc.doctors_visit,
                dentistVisit: hc.dentist_visit,
                optometristVisit: hc.optometrist_visit,
                rxDrug: hc.rx_drug,
                veterinaryVisit: hc.veterinary_visit,
              }
            : undefined,
        };
      },
    );

    // Batch insert payscale cities (in chunks to avoid memory issues)
    const CHUNK_SIZE = 500;
    for (let i = 0; i < psCities.length; i += CHUNK_SIZE) {
      const chunk = psCities.slice(i, i + CHUNK_SIZE);
      await PayscaleCityModelLocal.insertMany(chunk, { ordered: false }).catch(
        (err) => {
          // Some duplicates may exist - skip them
          if (err.code !== 11000) console.warn(`Warning: ${err.message}`);
        },
      );
    }

    totalPayscaleCities += psCities.length;
    process.stdout.write(
      `\r  Processed ${stateName} (${psCities.length} cities)...`,
    );
  }

  console.log(`\nInserted ${totalPayscaleCities} payscale cities`);

  // Now calculate state averages from payscale data
  for (const stateDoc of stateDocs) {
    const sd = stateDoc as Record<string, unknown>;
    const stateSlug = sd.slug as string;

    // Get all payscale cities for this state
    const psCities = await PayscaleCityModelLocal.find({ stateSlug }).lean();

    let totalRent = 0,
      rentCount = 0;
    let totalHomeValue = 0,
      homeCount = 0;

    for (const pc of psCities) {
      const h = (pc as Record<string, unknown>).housing as
        | Record<string, string>
        | undefined;
      if (h) {
        const rent = parseCurrency(h.medianRent);
        if (rent && rent > 0) {
          totalRent += rent;
          rentCount++;
        }
        const home = parseCurrency(h.medianHomePrice);
        if (home && home > 0) {
          totalHomeValue += home;
          homeCount++;
        }
      }
    }

    // Check if this state has cities in our main collection
    const mainCities = await CityModel.find({
      stateCode: sd.stateCode as string,
    }).lean();

    let avgCostIndex = 100;
    let avgMedianIncome = 0;

    if (mainCities.length > 0) {
      avgCostIndex =
        mainCities.reduce(
          (s, c) => s + ((c as Record<string, unknown>).costIndex as number),
          0,
        ) / mainCities.length;
      avgMedianIncome =
        mainCities.reduce(
          (s, c) => s + ((c as Record<string, unknown>).medianIncome as number),
          0,
        ) / mainCities.length;
    }

    sd.avgCostIndex = Math.round(avgCostIndex * 10) / 10;
    sd.avgTaxRate = STATE_TAX_RATES[sd.stateCode as string] ?? 0;
    sd.avgMedianRent =
      rentCount > 0 ? Math.round(totalRent / rentCount) : undefined;
    sd.avgMedianIncome =
      avgMedianIncome > 0 ? Math.round(avgMedianIncome) : undefined;
    sd.avgMedianHomeValue =
      homeCount > 0 ? Math.round(totalHomeValue / homeCount) : undefined;
  }

  await StateModelLocal.insertMany(stateDocs);
  console.log(`Inserted ${stateDocs.length} states\n`);

  // Summary
  const cityCount = await CityModel.countDocuments();
  const psCount = await PayscaleCityModelLocal.countDocuments();
  const stateCount = await StateModelLocal.countDocuments();
  console.log("=== Upload Summary ===");
  console.log(`  Cities (main):     ${cityCount}`);
  console.log(`  Payscale Cities:   ${psCount}`);
  console.log(`  States:            ${stateCount}`);

  await mongoose.disconnect();
  console.log("\nDone! Disconnected from MongoDB.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
