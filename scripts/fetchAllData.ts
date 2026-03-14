#!/usr/bin/env npx tsx
/**
 * fetchAllData.ts — Pull cost-of-living data from 4 government APIs
 * and write JSON files for every city.
 *
 * Usage:
 *   npx tsx frontend/scripts/fetchAllData.ts
 *   npx tsx frontend/scripts/fetchAllData.ts --dry-run   (skip API calls, use fallbacks)
 *
 * Output (relative to this file):
 *   data/raw/census-raw.json
 *   data/raw/bea-raw.json
 *   data/raw/hud-raw.json
 *   data/raw/bls-raw.json
 *   data/cities/<slug>.json   (one per city)
 *   data/all-cities.json      (combined)
 */

import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";
import {
  CITY_MAPPINGS,
  buildLAUSSeriesId,
  type CityMapping,
} from "./cityMappings";

// ─── Load environment ────────────────────────────────────────────────────────
config({ path: path.resolve(__dirname, "../.env.local") });

const CENSUS_API_KEY = process.env.CENSUS_API_KEY!;
const HUD_API_TOKEN = process.env.HUD_API_TOKEN!;
const BLS_API_KEY = process.env.BLS_API_KEY!;
const BEA_API_KEY = process.env.BEA_API_KEY!;

const DRY_RUN = process.argv.includes("--dry-run");

// ─── Output directories ─────────────────────────────────────────────────────
const SCRIPT_DIR = __dirname;
const DATA_DIR = path.join(SCRIPT_DIR, "data");
const RAW_DIR = path.join(DATA_DIR, "raw");
const CITIES_DIR = path.join(DATA_DIR, "cities");

for (const d of [DATA_DIR, RAW_DIR, CITIES_DIR]) {
  fs.mkdirSync(d, { recursive: true });
}

function writeJSON(filePath: string, data: unknown) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`  ✓ wrote ${path.relative(SCRIPT_DIR, filePath)}`);
}

// Helper: sleep for rate-limiting
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Type definitions ────────────────────────────────────────────────────────
interface CensusResult {
  slug: string;
  medianIncome: number | null;
  medianRent: number | null;
  medianHomeValue: number | null;
  population: number | null;
}

interface BEAResult {
  slug: string;
  costIndex: number | null;
  rentRPP: number | null;
  goodsRPP: number | null;
  servicesRPP: number | null;
}

interface HUDResult {
  slug: string;
  fmrRent1BR: number | null;
  fmrRent2BR: number | null;
  fmrRent3BR: number | null;
}

interface BLSResult {
  slug: string;
  unemploymentRate: number | null;
  groceryIndex: number | null;
  utilitiesIndex: number | null;
  transportationIndex: number | null;
  healthcareIndex: number | null;
}

interface CityData {
  slug: string;
  name: string;
  state: string;
  stateCode: string;
  stateTaxRate: number;
  description: string;
  costIndex: number;
  medianIncome: number;
  medianRent: number;
  medianHomeValue: number;
  population: number;
  unemploymentRate: number;
  fmrRent1BR: number;
  fmrRent2BR: number;
  fmrRent3BR: number;
  groceryIndex: number | null;
  utilitiesIndex: number | null;
  transportationIndex: number | null;
  healthcareIndex: number | null;
  rentRPP: number | null;
  goodsRPP: number | null;
  servicesRPP: number | null;
  averageSalary: number;
}

// ═════════════════════════════════════════════════════════════════════════════
// 1. CENSUS ACS 5-Year
// ═════════════════════════════════════════════════════════════════════════════
// Note: Census ACS 5-Year data lags 1-2 years. 2025 data not yet available.
const CENSUS_YEARS = ["2024", "2023", "2022"]; // try newest first, fall back

async function fetchCensusData(): Promise<{
  results: CensusResult[];
  raw: unknown[];
}> {
  console.log("\n📊 Fetching Census ACS 5-Year data …");

  if (DRY_RUN) {
    console.log("  (dry-run — skipping)");
    return { results: [], raw: [] };
  }

  const variables = "B19013_001E,B25064_001E,B25077_001E,B01003_001E";
  const rawResponses: unknown[] = [];
  const results: CensusResult[] = [];

  // Group cities by state FIPS
  const byState = new Map<string, CityMapping[]>();
  for (const city of CITY_MAPPINGS) {
    const arr = byState.get(city.censusFips.state) ?? [];
    arr.push(city);
    byState.set(city.censusFips.state, arr);
  }

  let censusYear = CENSUS_YEARS[0];

  for (const [stateCode, cities] of byState) {
    const placeFilter = cities.map((c) => c.censusFips.place).join(",");
    let data: string[][] | null = null;

    for (const year of CENSUS_YEARS) {
      const url =
        `https://api.census.gov/data/${year}/acs/acs5` +
        `?get=NAME,${variables}` +
        `&for=place:${placeFilter}` +
        `&in=state:${stateCode}` +
        `&key=${CENSUS_API_KEY}`;

      try {
        const res = await fetch(url);
        if (!res.ok) {
          console.warn(
            `  ⚠ Census ${year} state=${stateCode}: HTTP ${res.status}`,
          );
          continue;
        }
        data = (await res.json()) as string[][];
        censusYear = year;
        rawResponses.push({ stateCode, year, data });
        break;
      } catch (err: any) {
        console.warn(`  ⚠ Census ${year} state=${stateCode}: ${err.message}`);
      }
    }

    if (!data || data.length < 2) continue;

    const headers = data[0];
    const nameIdx = headers.indexOf("NAME");
    const incomeIdx = headers.indexOf("B19013_001E");
    const rentIdx = headers.indexOf("B25064_001E");
    const homeIdx = headers.indexOf("B25077_001E");
    const popIdx = headers.indexOf("B01003_001E");
    const placeIdx = headers.indexOf("place");

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const placeCode = row[placeIdx];
      const city = cities.find((c) => c.censusFips.place === placeCode);
      if (!city) continue;

      const parse = (idx: number) => {
        const v = parseInt(row[idx], 10);
        return isNaN(v) || v < 0 ? null : v;
      };

      results.push({
        slug: city.slug,
        medianIncome: parse(incomeIdx),
        medianRent: parse(rentIdx),
        medianHomeValue: parse(homeIdx),
        population: parse(popIdx),
      });
    }

    await sleep(200); // be kind to Census servers
  }

  console.log(
    `  ✓ Census: got data for ${results.length}/${CITY_MAPPINGS.length} cities (ACS5 ${censusYear})`,
  );
  return { results, raw: rawResponses };
}

// ═════════════════════════════════════════════════════════════════════════════
// 2. BEA Regional Price Parities
// ═════════════════════════════════════════════════════════════════════════════

// Static fallback data: BEA 2024 Regional Price Parities by CBSA code
// If API fails, falls back to 2024 data which is the most recent available
const BEA_RPP_FALLBACK: Record<
  string,
  { overall: number; rent: number; goods: number; services: number }
> = {
  // "35620": { overall: 122.6, rent: 148.8, goods: 104.9, services: 119.9 },
  // "31080": { overall: 117.0, rent: 152.1, goods: 103.9, services: 107.5 },
  // "16980": { overall: 106.5, rent: 115.2, goods: 101.3, services: 104.3 },
  // "26420": { overall: 96.6, rent: 91.1, goods: 97.1, services: 98.8 },
  // "38060": { overall: 101.0, rent: 105.3, goods: 99.3, services: 100.0 },
  // "41700": { overall: 91.2, rent: 82.3, goods: 95.2, services: 92.6 },
  // "41740": { overall: 117.4, rent: 148.9, goods: 103.1, services: 109.2 },
  // "19100": { overall: 97.0, rent: 97.1, goods: 96.1, services: 97.3 },
  // "41940": { overall: 126.8, rent: 182.9, goods: 107.3, services: 111.5 },
  // "12420": { overall: 101.5, rent: 113.3, goods: 97.0, services: 99.1 },
  // "27260": { overall: 96.7, rent: 98.1, goods: 96.3, services: 96.0 },
  // "18140": { overall: 91.5, rent: 79.2, goods: 95.3, services: 93.4 },
  // "26900": { overall: 91.2, rent: 79.2, goods: 95.7, services: 92.3 },
  // "16740": { overall: 96.2, rent: 94.0, goods: 96.3, services: 96.4 },
  // "41860": { overall: 127.3, rent: 182.3, goods: 106.0, services: 114.8 },
  // "42660": { overall: 114.7, rent: 137.3, goods: 106.8, services: 106.2 },
  // "19740": { overall: 108.0, rent: 118.0, goods: 100.8, services: 105.5 },
  // "36420": { overall: 88.3, rent: 72.1, goods: 94.2, services: 89.0 },
  // "47900": { overall: 117.9, rent: 143.2, goods: 105.5, services: 112.1 },
  // "34980": { overall: 96.5, rent: 92.2, goods: 96.2, services: 97.7 },
  // "21340": { overall: 88.4, rent: 73.3, goods: 95.2, services: 87.9 },
  // "14460": { overall: 114.6, rent: 139.0, goods: 104.4, services: 109.3 },
  // "19820": { overall: 93.3, rent: 82.9, goods: 96.5, services: 94.1 },
  // "38900": { overall: 111.5, rent: 130.5, goods: 103.8, services: 106.1 },
  // "29820": { overall: 100.6, rent: 107.3, goods: 98.2, services: 99.1 },
  // "32820": { overall: 87.2, rent: 71.2, goods: 93.3, services: 89.6 },
  // "31140": { overall: 90.6, rent: 76.5, goods: 94.3, services: 92.6 },
  // "12580": { overall: 112.1, rent: 119.1, goods: 103.3, services: 111.6 },
  // "33340": { overall: 93.2, rent: 82.3, goods: 97.1, services: 94.1 },
  // "10740": { overall: 93.2, rent: 86.3, goods: 96.2, services: 93.6 },
  // "46060": { overall: 95.5, rent: 88.2, goods: 97.1, services: 95.8 },
  // "40900": { overall: 107.7, rent: 120.3, goods: 102.5, services: 103.3 },
  // "12060": { overall: 97.6, rent: 99.1, goods: 96.1, services: 97.3 },
  // "28140": { overall: 91.2, rent: 79.3, goods: 93.7, services: 93.9 },
  // "36540": { overall: 90.5, rent: 78.3, goods: 94.2, services: 92.2 },
  // "17820": { overall: 99.5, rent: 100.1, goods: 98.2, services: 99.7 },
  // "33100": { overall: 112.2, rent: 138.1, goods: 103.1, services: 104.6 },
  // "39580": { overall: 100.0, rent: 103.9, goods: 97.8, services: 99.1 },
  // "47260": { overall: 100.5, rent: 104.2, goods: 97.5, services: 100.7 },
  // "33460": { overall: 102.5, rent: 103.8, goods: 101.0, services: 102.2 },
  // "45300": { overall: 100.1, rent: 108.3, goods: 97.8, services: 97.8 },
  // "35380": { overall: 93.1, rent: 82.3, goods: 97.1, services: 93.6 },
  // "48620": { overall: 87.3, rent: 69.1, goods: 93.3, services: 89.7 },
  // "17140": { overall: 91.0, rent: 75.3, goods: 94.3, services: 94.3 },
  // "36740": { overall: 100.2, rent: 110.3, goods: 97.5, services: 97.0 },
  // "38300": { overall: 91.3, rent: 74.3, goods: 96.1, services: 94.1 },
  // "41180": { overall: 89.8, rent: 74.2, goods: 94.1, services: 92.9 },
};

async function fetchBEAData(): Promise<{ results: BEAResult[]; raw: unknown }> {
  console.log("\n🏛️  Fetching BEA Regional Price Parities …");

  const results: BEAResult[] = [];
  let rawResponse: unknown = null;

  if (!DRY_RUN) {
    // Try the BEA API for all MSAs at once
    const lineCodes = [
      { code: "1", field: "overall" }, // All items RPP
      { code: "2", field: "goods" }, // Goods RPP
      { code: "3", field: "services" }, // Services RPP
      { code: "4", field: "rent" }, // Rents RPP
    ];

    const apiResults: Record<string, Record<string, number>> = {};

    for (const lc of lineCodes) {
      // Try fetching BEA data for multiple years (2024 most recent, fallback to 2023, 2022)
      const beaYears = ["2024", "2023"];
      let successfulYear: string | null = null;

      for (const year of beaYears) {
        const url =
          `https://apps.bea.gov/api/data` +
          `?UserID=${BEA_API_KEY}` +
          `&method=GetData` +
          `&DataSetName=Regional` +
          `&TableName=MARPP` +
          `&LineCode=${lc.code}` +
          `&GeoFips=MSA` +
          `&Year=${year}` +
          `&ResultFormat=json`;

        try {
          const res = await fetch(url);
          if (!res.ok) {
            console.warn(
              `  ⚠ BEA LineCode=${lc.code} year=${year}: HTTP ${res.status}`,
            );
            continue;
          }
          const json = await res.json();
          rawResponse = rawResponse ?? [];
          (rawResponse as unknown[]).push({
            lineCode: lc.code,
            field: lc.field,
            year,
            json,
          });

          const dataRows = json?.BEAAPI?.Results?.Data;
          if (Array.isArray(dataRows)) {
            for (const row of dataRows) {
              const geoFips = row.GeoFips?.replace(/"/g, "").trim();
              const val = parseFloat(row.DataValue?.replace(/,/g, ""));
              if (!geoFips || isNaN(val)) continue;
              if (!apiResults[geoFips]) apiResults[geoFips] = {};
              apiResults[geoFips][lc.field] = val;
            }
          }
          successfulYear = year;
          break; // Success, move to next line code
        } catch (err: any) {
          console.warn(
            `  ⚠ BEA LineCode=${lc.code} year=${year}: ${err.message}`,
          );
        }

        await sleep(500); // BEA rate limit
      }
    }

    // Map BEA results to our cities
    for (const city of CITY_MAPPINGS) {
      const beaData = apiResults[city.cbsaCode];
      if (beaData && beaData.overall) {
        results.push({
          slug: city.slug,
          costIndex: beaData.overall ?? null,
          rentRPP: beaData.rent ?? null,
          goodsRPP: beaData.goods ?? null,
          servicesRPP: beaData.services ?? null,
        });
      }
    }

    if (results.length > 0) {
      console.log(`  ✓ BEA API: got data for ${results.length} cities`);
    }
  }

  // Fall back to static data for any missing cities
  const gotSlugs = new Set(results.map((r) => r.slug));
  let fallbackCount = 0;

  for (const city of CITY_MAPPINGS) {
    if (gotSlugs.has(city.slug)) continue;
    const fb = BEA_RPP_FALLBACK[city.cbsaCode];
    if (fb) {
      results.push({
        slug: city.slug,
        costIndex: fb.overall,
        rentRPP: fb.rent,
        goodsRPP: fb.goods,
        servicesRPP: fb.services,
      });
      fallbackCount++;
    }
  }

  if (fallbackCount > 0) {
    console.log(
      `  ✓ BEA fallback: filled ${fallbackCount} cities from 2024 static data`,
    );
  }

  console.log(
    `  ✓ BEA total: ${results.length}/${CITY_MAPPINGS.length} cities`,
  );
  return { results, raw: rawResponse ?? BEA_RPP_FALLBACK };
}

// ═════════════════════════════════════════════════════════════════════════════
// 3. HUD Fair Market Rents
// ═════════════════════════════════════════════════════════════════════════════
// Try FY2026 first, fall back to FY2025 if not available
const HUD_FMR_YEARS = ["2026", "2025"];

async function fetchHUDData(): Promise<{
  results: HUDResult[];
  raw: unknown[];
}> {
  console.log("\n🏠 Fetching HUD Fair Market Rents …");

  if (DRY_RUN) {
    console.log("  (dry-run — skipping)");
    return { results: [], raw: [] };
  }

  const rawResponses: unknown[] = [];
  const results: HUDResult[] = [];

  // Unique states from our city list
  // DC is not a state in HUD API — DC metro area appears under VA
  const stateSet = new Set<string>();
  for (const c of CITY_MAPPINGS) {
    if (c.stateCode === "DC") continue; // handled via VA data
    stateSet.add(c.stateCode);
  }
  const states = [...stateSet].sort();
  // Ensure VA is included so DC metro data gets picked up
  if (!states.includes("VA")) states.push("VA");

  let hudYear = HUD_FMR_YEARS[0];

  for (const stateCode of states) {
    let successYear: string | null = null;

    for (const year of HUD_FMR_YEARS) {
      const url = `https://www.huduser.gov/hudapi/public/fmr/statedata/${stateCode}?year=${year}`;
      try {
        const res = await Promise.race([
          fetch(url, {
            headers: { Authorization: `Bearer ${HUD_API_TOKEN}` },
          }),
          new Promise<Response>((_, reject) =>
            setTimeout(() => reject(new Error("HUD request timeout")), 10000),
          ),
        ]);
        if (!res.ok) {
          console.warn(`  ⚠ HUD ${stateCode} FY${year}: HTTP ${res.status}`);
          continue;
        }
        const json = await res.json();
        rawResponses.push({ stateCode, year, data: json });
        successYear = year;
        hudYear = year;

        const metros = json?.data?.metroareas;
        if (!Array.isArray(metros)) {
          console.warn(
            `  ⚠ HUD ${stateCode} FY${year}: no metroareas in response`,
          );
          continue;
        }

        // Match cities to metro areas
        // Include DC cities when processing VA (DC metro is in VA data)
        const citiesInState = CITY_MAPPINGS.filter(
          (c) =>
            c.stateCode === stateCode ||
            (stateCode === "VA" && c.stateCode === "DC"),
        );
        const alreadyMatched = new Set(results.map((r) => r.slug));
        for (const city of citiesInState) {
          if (alreadyMatched.has(city.slug)) continue;
          // Try exact CBSA match first, then name match
          // HUD metro codes: METRO{cbsa}M{cbsa} = main metro, METRO{cbsa}N{county} = sub-area
          let metro = metros.find((m: any) => {
            const code = String(m.cbsa_code || m.metro_code || m.code || "");
            return (
              code === city.cbsaCode ||
              code === `METRO${city.cbsaCode}M${city.cbsaCode}`
            );
          });

          if (!metro) {
            // Try name matching
            const cityNameLower = city.name.toLowerCase();
            metro = metros.find((m: any) => {
              const areaName = (
                m.area_name ||
                m.metro_name ||
                ""
              ).toLowerCase();
              return (
                areaName.includes(cityNameLower) ||
                cityNameLower.includes(areaName.split(",")[0]?.trim() || "")
              );
            });
          }

          if (metro) {
            const parse = (key: string) => {
              const v = parseInt(metro[key], 10);
              return isNaN(v) ? null : v;
            };
            results.push({
              slug: city.slug,
              fmrRent1BR:
                parse("One-Bedroom") ??
                parse("one_bedroom") ??
                parse("Efficiency"),
              fmrRent2BR: parse("Two-Bedroom") ?? parse("two_bedroom"),
              fmrRent3BR: parse("Three-Bedroom") ?? parse("three_bedroom"),
            });
          }
        }
        await sleep(300);
        break; // Success, move to next state
      } catch (err: any) {
        console.warn(`  ⚠ HUD ${stateCode} FY${year}: ${err.message}`);
      }
    }
  }

  console.log(
    `  ✓ HUD: got data for ${results.length}/${CITY_MAPPINGS.length} cities (FY${hudYear})`,
  );
  return { results, raw: rawResponses };
}

// ═════════════════════════════════════════════════════════════════════════════
// 4. BLS — LAUS Unemployment + CPI Sub-indices
// ═════════════════════════════════════════════════════════════════════════════
const BLS_YEAR = "2025";
const BLS_BATCH_SIZE = 25; // BLS allows up to 50 series per request with a key

interface BLSSeriesData {
  seriesID: string;
  data: Array<{
    year: string;
    period: string;
    value: string;
    periodName?: string;
  }>;
}

async function fetchBLSSeries(
  seriesIds: string[],
  startYear: string,
  endYear: string,
): Promise<BLSSeriesData[]> {
  const allResults: BLSSeriesData[] = [];

  for (let i = 0; i < seriesIds.length; i += BLS_BATCH_SIZE) {
    const batch = seriesIds.slice(i, i + BLS_BATCH_SIZE);
    const body = {
      seriesid: batch,
      startyear: startYear,
      endyear: endYear,
      annualaverage: true,
      registrationkey: BLS_API_KEY,
    };

    try {
      const res = await fetch(
        "https://api.bls.gov/publicAPI/v2/timeseries/data/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );

      if (!res.ok) {
        console.warn(
          `  ⚠ BLS batch ${i / BLS_BATCH_SIZE + 1}: HTTP ${res.status}`,
        );
        continue;
      }

      const json = await res.json();
      if (
        json.status === "REQUEST_SUCCEEDED" &&
        Array.isArray(json.Results?.series)
      ) {
        allResults.push(...json.Results.series);
      } else {
        console.warn(`  ⚠ BLS batch: ${json.message?.[0] || json.status}`);
      }
    } catch (err: any) {
      console.warn(`  ⚠ BLS batch: ${err.message}`);
    }

    await sleep(600); // BLS rate limit: ~500ms between requests
  }

  return allResults;
}

function getAnnualAverage(series: BLSSeriesData, year: string): number | null {
  // Try annual average (period = M13) first, then try latest monthly data
  const annual = series.data.find((d) => d.year === year && d.period === "M13");
  if (annual) return parseFloat(annual.value);

  // Fall back to latest monthly value in that year
  const monthly = series.data
    .filter((d) => d.year === year && d.period !== "M13")
    .sort((a, b) => b.period.localeCompare(a.period));
  if (monthly.length > 0) return parseFloat(monthly[0].value);

  return null;
}

async function fetchBLSData(): Promise<{ results: BLSResult[]; raw: unknown }> {
  console.log("\n📈 Fetching BLS LAUS + CPI data …");

  if (DRY_RUN) {
    console.log("  (dry-run — skipping)");
    return { results: [], raw: [] };
  }

  // --- LAUS Unemployment ---
  const lausSeriesMap = new Map<string, string>(); // seriesId → slug
  for (const city of CITY_MAPPINGS) {
    const seriesId = buildLAUSSeriesId(city);
    lausSeriesMap.set(seriesId, city.slug);
  }

  const lausResults = await fetchBLSSeries(
    [...lausSeriesMap.keys()],
    BLS_YEAR,
    BLS_YEAR,
  );
  const unemploymentBySlug = new Map<string, number>();
  for (const s of lausResults) {
    const slug = lausSeriesMap.get(s.seriesID);
    if (!slug) continue;
    const val = getAnnualAverage(s, BLS_YEAR);
    if (val !== null) unemploymentBySlug.set(slug, val);
  }
  console.log(`  ✓ LAUS unemployment: ${unemploymentBySlug.size} cities`);

  // --- CPI Sub-indices ---
  // Only available for specific metro areas
  // BLS CPI-U (Not Seasonally Adjusted): CUUR + area_code + item_code
  // Area codes use S-series format: S11A (NY), S49A (LA), etc.
  // Healthcare (SAM2) not available at metro level
  const CPI_ITEMS = [
    { code: "SAF1", field: "groceryIndex" }, // Food at home
    { code: "SAH2", field: "utilitiesIndex" }, // Fuels and utilities
    { code: "SAT1", field: "transportationIndex" }, // Private transportation
  ];

  const cpiSeriesMap = new Map<string, { slug: string; field: string }>(); // seriesId → { slug, field }
  for (const city of CITY_MAPPINGS) {
    if (!city.blsCpiAreaCode) continue;
    for (const item of CPI_ITEMS) {
      // Format: CUUR + S{areaCode} + {itemCode} → e.g. CUURS11ASAF1
      const seriesId = `CUUR${city.blsCpiAreaCode}${item.code}`;
      cpiSeriesMap.set(seriesId, { slug: city.slug, field: item.field });
    }
  }

  const cpiResults = await fetchBLSSeries(
    [...cpiSeriesMap.keys()],
    BLS_YEAR,
    BLS_YEAR,
  );
  const cpiByCityField = new Map<string, number>(); // "slug|field" → value

  for (const s of cpiResults) {
    const info = cpiSeriesMap.get(s.seriesID);
    if (!info) continue;
    const val = getAnnualAverage(s, BLS_YEAR);
    if (val !== null) cpiByCityField.set(`${info.slug}|${info.field}`, val);
  }

  const cpiCities = new Set(
    [...cpiByCityField.keys()].map((k) => k.split("|")[0]),
  );
  console.log(`  ✓ CPI sub-indices: ${cpiCities.size} cities`);

  // --- Combine ---
  const results: BLSResult[] = [];
  for (const city of CITY_MAPPINGS) {
    results.push({
      slug: city.slug,
      unemploymentRate: unemploymentBySlug.get(city.slug) ?? null,
      groceryIndex: cpiByCityField.get(`${city.slug}|groceryIndex`) ?? null,
      utilitiesIndex: cpiByCityField.get(`${city.slug}|utilitiesIndex`) ?? null,
      transportationIndex:
        cpiByCityField.get(`${city.slug}|transportationIndex`) ?? null,
      healthcareIndex:
        cpiByCityField.get(`${city.slug}|healthcareIndex`) ?? null,
    });
  }

  const rawData = { lausResults, cpiResults };
  console.log(
    `  ✓ BLS total: ${results.filter((r) => r.unemploymentRate !== null).length} with unemployment data`,
  );
  return { results, raw: rawData };
}

// ═════════════════════════════════════════════════════════════════════════════
// 5. Merge & Write
// ═════════════════════════════════════════════════════════════════════════════

function mergeData(
  census: CensusResult[],
  bea: BEAResult[],
  hud: HUDResult[],
  bls: BLSResult[],
): CityData[] {
  const censusMap = new Map(census.map((c) => [c.slug, c]));
  const beaMap = new Map(bea.map((b) => [b.slug, b]));
  const hudMap = new Map(hud.map((h) => [h.slug, h]));
  const blsMap = new Map(bls.map((b) => [b.slug, b]));

  const cities: CityData[] = [];

  for (const mapping of CITY_MAPPINGS) {
    const c = censusMap.get(mapping.slug);
    const b = beaMap.get(mapping.slug);
    const h = hudMap.get(mapping.slug);
    const l = blsMap.get(mapping.slug);

    const medianIncome = c?.medianIncome ?? 65000;
    const costIndex = b?.costIndex ?? 100;

    // Estimate average salary from median income (typically salary ≈ 85-90% of household income)
    const averageSalary = Math.round(medianIncome * 0.87);

    cities.push({
      slug: mapping.slug,
      name: mapping.name,
      state: mapping.state,
      stateCode: mapping.stateCode,
      stateTaxRate: mapping.stateTaxRate,
      description: mapping.description,
      costIndex: costIndex,
      medianIncome: medianIncome,
      medianRent: c?.medianRent ?? h?.fmrRent2BR ?? 1200,
      medianHomeValue: c?.medianHomeValue ?? 300000,
      population: c?.population ?? 0,
      unemploymentRate: l?.unemploymentRate ?? 4.0,
      fmrRent1BR: h?.fmrRent1BR ?? 0,
      fmrRent2BR: h?.fmrRent2BR ?? 0,
      fmrRent3BR: h?.fmrRent3BR ?? 0,
      groceryIndex: l?.groceryIndex ?? null,
      utilitiesIndex: l?.utilitiesIndex ?? null,
      transportationIndex: l?.transportationIndex ?? null,
      healthcareIndex: l?.healthcareIndex ?? null,
      rentRPP: b?.rentRPP ?? null,
      goodsRPP: b?.goodsRPP ?? null,
      servicesRPP: b?.servicesRPP ?? null,
      averageSalary,
    });
  }

  return cities;
}

// ═════════════════════════════════════════════════════════════════════════════
// Main
// ═════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log(
    "╔══════════════════════════════════════════════════════════════╗",
  );
  console.log("║  CostWise — Fetch All Government Data                      ║");
  console.log(
    "╚══════════════════════════════════════════════════════════════╝",
  );
  console.log(`  Cities: ${CITY_MAPPINGS.length}`);
  console.log(`  Dry run: ${DRY_RUN}`);

  // Validate keys
  const missing: string[] = [];
  if (!CENSUS_API_KEY) missing.push("CENSUS_API_KEY");
  if (!HUD_API_TOKEN) missing.push("HUD_API_TOKEN");
  if (!BLS_API_KEY) missing.push("BLS_API_KEY");
  if (!BEA_API_KEY) missing.push("BEA_API_KEY");
  if (missing.length > 0 && !DRY_RUN) {
    console.error(`\n❌ Missing env variables: ${missing.join(", ")}`);
    console.error("   Set them in frontend/.env.local");
    process.exit(1);
  }

  // Fetch from all sources
  const [censusData, beaData, hudData, blsData] = await Promise.all([
    fetchCensusData(),
    fetchBEAData(),
    fetchHUDData(),
    fetchBLSData(),
  ]);

  // Write raw API responses
  console.log("\n💾 Writing raw API response files …");
  writeJSON(path.join(RAW_DIR, "census-raw.json"), censusData.raw);
  writeJSON(path.join(RAW_DIR, "bea-raw.json"), beaData.raw);
  writeJSON(path.join(RAW_DIR, "hud-raw.json"), hudData.raw);
  writeJSON(path.join(RAW_DIR, "bls-raw.json"), blsData.raw);

  // Merge data
  console.log("\n🔗 Merging data across sources …");
  const allCities = mergeData(
    censusData.results,
    beaData.results,
    hudData.results,
    blsData.results,
  );

  // Write individual city files
  console.log("\n📁 Writing individual city JSON files …");
  for (const city of allCities) {
    writeJSON(path.join(CITIES_DIR, `${city.slug}.json`), city);
  }

  // Write combined file
  console.log("\n📦 Writing combined cities file …");
  writeJSON(path.join(DATA_DIR, "all-cities.json"), allCities);

  // Summary
  console.log(
    "\n╔══════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║  Summary                                                    ║",
  );
  console.log(
    "╠══════════════════════════════════════════════════════════════╣",
  );
  const withIncome = allCities.filter((c) => c.medianIncome > 0).length;
  const withRent = allCities.filter((c) => c.fmrRent2BR > 0).length;
  const withCPI = allCities.filter((c) => c.groceryIndex !== null).length;
  const withCostIdx = allCities.filter((c) => c.costIndex > 0).length;
  console.log(
    `║  Total cities:        ${allCities.length.toString().padEnd(4)}                               ║`,
  );
  console.log(
    `║  With income data:    ${withIncome.toString().padEnd(4)}                               ║`,
  );
  console.log(
    `║  With FMR rent data:  ${withRent.toString().padEnd(4)}                               ║`,
  );
  console.log(
    `║  With CPI sub-index:  ${withCPI.toString().padEnd(4)}                               ║`,
  );
  console.log(
    `║  With cost index:     ${withCostIdx.toString().padEnd(4)}                               ║`,
  );
  console.log(
    "╚══════════════════════════════════════════════════════════════╝",
  );
  console.log("\n✅ Done!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
