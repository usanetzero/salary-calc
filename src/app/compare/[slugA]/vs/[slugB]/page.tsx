import ComparePageClient from "./ComparePageClient";
import { getAllCities, getComparisonData } from "@/lib/storage";

export const revalidate = 3600;

// Pre-generate the most popular city comparisons at build time
const POPULAR_PAIRS = [
  ["new-york-ny", "los-angeles-ca"],
  ["new-york-ny", "austin-tx"],
  ["new-york-ny", "miami-fl"],
  ["new-york-ny", "chicago-il"],
  ["new-york-ny", "seattle-wa"],
  ["los-angeles-ca", "san-francisco-ca"],
  ["los-angeles-ca", "chicago-il"],
  ["los-angeles-ca", "austin-tx"],
  ["san-francisco-ca", "seattle-wa"],
  ["san-francisco-ca", "austin-tx"],
  ["austin-tx", "dallas-tx"],
  ["austin-tx", "houston-tx"],
  ["austin-tx", "denver-co"],
  ["miami-fl", "nashville-tn"],
  ["miami-fl", "tampa-fl"],
  ["chicago-il", "dallas-tx"],
  ["seattle-wa", "denver-co"],
  ["denver-co", "phoenix-az"],
  ["charlotte-nc", "raleigh-nc"],
  ["portland-or", "seattle-wa"],
];

export async function generateStaticParams() {
  return POPULAR_PAIRS.map(([slugA, slugB]) => ({ slugA, slugB }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slugA: string; slugB: string }>;
}) {
  const { slugA, slugB } = await params;
  const nameA = slugA
    .split("-")
    .slice(0, -1)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const nameB = slugB
    .split("-")
    .slice(0, -1)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    title: `${nameA} vs ${nameB} – Cost of Living Comparison (2026)`,
    description: `Compare cost of living between ${nameA} and ${nameB}. Side-by-side comparison of housing costs, rent, groceries, utilities, transportation, healthcare, state taxes, and salary equivalents. Find out which city is cheaper to live in.`,
    keywords: [
      `${nameA.toLowerCase()} vs ${nameB.toLowerCase()} cost of living`,
      `${nameA.toLowerCase()} vs ${nameB.toLowerCase()}`,
      `cost of living ${nameA.toLowerCase()} vs ${nameB.toLowerCase()}`,
      `${nameA.toLowerCase()} cost of living`,
      `${nameB.toLowerCase()} cost of living`,
    ],
    openGraph: {
      title: `${nameA} vs ${nameB} – Cost of Living Comparison | CostWise`,
      description: `Compare cost of living between ${nameA} and ${nameB}. Side-by-side comparison of housing, groceries, utilities, transportation, healthcare, and salary equivalents.`,
    },
  };
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ slugA: string; slugB: string }>;
}) {
  const { slugA, slugB } = await params;
  const [comparison, allCities] = await Promise.all([
    getComparisonData(slugA, slugB).catch(() => undefined),
    getAllCities().catch(() => []),
  ]);

  return (
    <ComparePageClient
      initialComparison={comparison ?? undefined}
      initialAllCities={allCities}
    />
  );
}
