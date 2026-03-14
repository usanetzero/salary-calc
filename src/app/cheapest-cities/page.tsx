import { Suspense } from "react";
import type { Metadata } from "next";
import CheapestCitiesClient from "./CheapestCitiesClient";

export const metadata: Metadata = {
  title: "Cheapest Cities to Live in the US (2025 Rankings)",
  description:
    "Discover the most affordable cities in America ranked by cost of living index. Compare housing costs, median rent, income, state taxes, and quality of life across 47 major US cities. Updated with 2023 Census and BEA data.",
  keywords: [
    "cheapest cities to live in US",
    "cheapest cities to live in America",
    "most affordable cities USA 2025",
    "low cost of living cities",
    "cheap places to live in the US",
    "affordable cities to move to",
    "best affordable cities in America",
    "cities with lowest rent",
    "cities with no state income tax",
    "best value cities to live in US",
  ],
  openGraph: {
    title: "Cheapest Cities to Live in the US (2025) | CostWise",
    description:
      "Discover the most affordable US cities ranked by cost of living index, housing costs, median rent, and income.",
  },
};

export default function CheapestCitiesPage() {
  return (
    <Suspense>
      <CheapestCitiesClient />
    </Suspense>
  );
}
