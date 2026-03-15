import CityPageClient from "./CityPageClient";
import { getAllCities, getCityBySlug } from "@/lib/storage";
import { notFound } from "next/navigation";

export const revalidate = 3600;

export async function generateStaticParams() {
  const cities = await getAllCities().catch(() => []);
  return cities.map((city) => ({ slug: city.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cityName = slug
    .split("-")
    .slice(0, -1)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const stateCode = slug.split("-").pop()?.toUpperCase() || "";

  return {
    title: `Cost of Living in ${cityName}, ${stateCode} (2025) – Rent, Income & Housing Data`,
    description: `Everything about the cost of living in ${cityName}, ${stateCode}. Compare housing costs, median rent, groceries, utilities, healthcare, and transportation. See salary equivalents, affordability scores, and state tax rates. Data from Census, BEA, HUD, and BLS.`,
    keywords: [
      `cost of living in ${cityName.toLowerCase()}`,
      `${cityName.toLowerCase()} cost of living`,
      `average cost of living in ${cityName.toLowerCase()}`,
      `cost of living ${cityName.toLowerCase()} ${stateCode.toLowerCase()}`,
      `rent in ${cityName.toLowerCase()}`,
      `salary in ${cityName.toLowerCase()}`,
    ],
    openGraph: {
      title: `Cost of Living in ${cityName}, ${stateCode} | CostWise`,
      description: `Explore detailed cost of living data for ${cityName}, ${stateCode}. Compare housing, groceries, utilities, healthcare, and transportation costs.`,
    },
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [city, allCities] = await Promise.all([
    getCityBySlug(slug).catch(() => undefined),
    getAllCities().catch(() => []),
  ]);

  if (!city) notFound();

  return <CityPageClient initialCity={city} initialAllCities={allCities} />;
}
