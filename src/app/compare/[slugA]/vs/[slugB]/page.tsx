import ComparePageClient from "./ComparePageClient";

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
    title: `${nameA} vs ${nameB} – Cost of Living Comparison`,
    description: `Compare cost of living between ${nameA} and ${nameB}. Side-by-side comparison of housing, groceries, utilities, transportation, healthcare, and salary equivalents.`,
    openGraph: {
      title: `${nameA} vs ${nameB} – Cost of Living Comparison | CostWise`,
      description: `Compare cost of living between ${nameA} and ${nameB}. Side-by-side comparison of housing, groceries, utilities, transportation, healthcare, and salary equivalents.`,
    },
  };
}

export default function ComparePage() {
  return <ComparePageClient />;
}
