import { Suspense } from "react";
import type { Metadata } from "next";
import CheapestCitiesClient from "./CheapestCitiesClient";
import { getAllCities } from "@/lib/storage";

export const revalidate = 3600;

export const metadata: Metadata = {
  title:
    "Cheapest Cities to Live in the US (2026 Rankings) – Most Affordable Places",
  description:
    "Discover the most affordable and cheapest cities to live in America ranked by cost of living index. Compare housing costs, median rent, income, state taxes, and quality of life in Arizona, Las Vegas, Montana, and 47+ US cities. Updated 2026 with Census and BEA data.",
  keywords: [
    "cheapest cities to live in US",
    "cheapest cities to live in America",
    "most affordable cities USA 2026",
    "low cost of living cities",
    "cheap places to live in the US",
    "affordable cities to move to",
    "best affordable cities in America",
    "cities with lowest rent",
    "cities with no state income tax",
    "best value cities to live in US",
    "cost of living in arizona",
    "average cost of living in arizona",
    "cost of living in las vegas",
    "cheapest states to retire in",
  ],
  openGraph: {
    title: "Cheapest Cities to Live in the US (2026) | CostWise",
    description:
      "Discover the most affordable US cities ranked by cost of living index, housing costs, median rent, and income.",
  },
};

export default async function CheapestCitiesPage() {
  const cities = await getAllCities().catch(() => []);
  return (
    <Suspense>
      <CheapestCitiesClient initialCities={cities} />
    </Suspense>
  );
}
