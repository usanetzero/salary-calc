import CityPageClient from "./CityPageClient";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cityName = slug
    .split("-")
    .slice(0, -1)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const stateCode = slug.split("-").pop()?.toUpperCase() || "";

  return {
    title: `Cost of Living in ${cityName}, ${stateCode}`,
    description: `Explore detailed cost of living data for ${cityName}, ${stateCode}. Compare housing, groceries, utilities, healthcare, and transportation costs. See salary equivalents and affordability scores.`,
    openGraph: {
      title: `Cost of Living in ${cityName}, ${stateCode} | CostWise`,
      description: `Explore detailed cost of living data for ${cityName}, ${stateCode}. Compare housing, groceries, utilities, healthcare, and transportation costs.`,
    },
  };
}

export default function CityPage() {
  return <CityPageClient />;
}
