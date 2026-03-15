import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  MapPin,
  DollarSign,
  Home,
  Building2,
  TrendingDown,
  TrendingUp,
  ArrowUpDown,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FAQSection } from "@/components/FAQSection";
import {
  getStateBySlug,
  getPayscaleCitiesByState,
  getCitiesByState,
} from "@/lib/storage";
import type { Metadata } from "next";
import StatePageClient from "./StatePageClient";

export const revalidate = 3600;

const SITE_URL = "https://costwise.usa-net-zero.com";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const state = await getStateBySlug(slug).catch(() => undefined);
  if (!state) return { title: "State Not Found" };

  const affordability =
    (state.avgCostIndex ?? 100) < 95
      ? "affordable"
      : (state.avgCostIndex ?? 100) > 110
        ? "expensive"
        : "average cost";

  return {
    title: `Cost of Living in ${state.name} – ${state.totalCities} Cities Compared (2026)`,
    description: `Compare the cost of living in ${state.name} (${state.stateCode}). Explore ${state.totalCities} cities with detailed housing costs, rent prices, groceries, healthcare, and utility expenses. ${state.name} is an ${affordability} state with a cost index of ${state.avgCostIndex?.toFixed(1) ?? "N/A"} vs the national average of 100.`,
    keywords: [
      `cost of living in ${state.name}`,
      `${state.name} cost of living`,
      `${state.name} rent prices`,
      `${state.name} housing costs`,
      `cheapest cities in ${state.name}`,
      `most expensive cities in ${state.name}`,
      `${state.name} average rent`,
      `${state.name} median home price`,
      `${state.name} income tax`,
      `living expenses ${state.name}`,
      `${state.name} salary calculator`,
      `move to ${state.name}`,
    ],
    openGraph: {
      title: `Cost of Living in ${state.name} – ${state.totalCities} Cities | CostWise`,
      description: `Explore cost of living in ${state.name}'s ${state.totalCities} cities. Average rent: $${state.avgMedianRent?.toLocaleString() ?? "N/A"}/mo. Tax rate: ${state.avgTaxRate ?? 0}%.`,
      url: `${SITE_URL}/states/${slug}`,
    },
    alternates: {
      canonical: `${SITE_URL}/states/${slug}`,
    },
  };
}

export default async function StatePage({ params }: Props) {
  const { slug } = await params;

  const [state, payscaleCities] = await Promise.all([
    getStateBySlug(slug).catch(() => undefined),
    getPayscaleCitiesByState(slug).catch(() => []),
  ]);

  if (!state) notFound();

  const affordLabel =
    (state.avgCostIndex ?? 100) < 90
      ? "Very Affordable"
      : (state.avgCostIndex ?? 100) < 95
        ? "Affordable"
        : (state.avgCostIndex ?? 100) < 105
          ? "Average"
          : (state.avgCostIndex ?? 100) < 115
            ? "Above Average"
            : (state.avgCostIndex ?? 100) < 130
              ? "Expensive"
              : "Very Expensive";

  const affordColor =
    (state.avgCostIndex ?? 100) < 95
      ? "bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300"
      : (state.avgCostIndex ?? 100) > 110
        ? "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300"
        : "bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300";

  // Sort cities: those with overallVsNationalAvg first (more data), then alphabetical
  const sortedCities = [...payscaleCities].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  // Extract cheapest/expensive by parsing overallVsNationalAvg
  const citiesWithIndex = payscaleCities
    .filter((c) => c.overallVsNationalAvg)
    .map((c) => ({
      ...c,
      pctDiff: parseInt(c.overallVsNationalAvg!.replace("%", ""), 10),
    }))
    .sort((a, b) => a.pctDiff - b.pctDiff);

  const cheapestCities = citiesWithIndex.slice(0, 5);
  const expensiveCities = citiesWithIndex.slice(-5).reverse();

  const faqItems = [
    {
      question: `What is the cost of living in ${state.name}?`,
      answer: `${state.name} has a cost of living index of ${state.avgCostIndex?.toFixed(1) ?? "approximately average"} compared to the national average of 100. ${
        (state.avgCostIndex ?? 100) < 100
          ? `This means ${state.name} is ${(100 - (state.avgCostIndex ?? 100)).toFixed(1)}% cheaper than the national average.`
          : (state.avgCostIndex ?? 100) > 100
            ? `This means ${state.name} is ${((state.avgCostIndex ?? 100) - 100).toFixed(1)}% more expensive than the national average.`
            : "This means costs are approximately in line with national averages."
      } The state has ${state.totalCities} cities tracked in our database with varying costs across urban and rural areas.`,
    },
    {
      question: `What is the average rent in ${state.name}?`,
      answer: `The average monthly rent in ${state.name} is approximately $${state.avgMedianRent?.toLocaleString() ?? "N/A"} per month. Rent varies significantly by city — major metropolitan areas tend to have rents 30-60% higher than rural communities within the state. Our city-by-city breakdown below provides median rent, median home prices, and utility costs for every tracked city.`,
    },
    {
      question: `What is the state income tax in ${state.name}?`,
      answer: `${state.name} has ${
        (state.avgTaxRate ?? 0) === 0
          ? "no state income tax, making it one of the most tax-friendly states in the US. This can save residents thousands of dollars per year compared to high-tax states like California or New York."
          : `a state income tax rate of approximately ${state.avgTaxRate}%. This affects take-home pay significantly — on a $100,000 salary, you'd pay roughly $${((state.avgTaxRate ?? 0) * 1000).toLocaleString()} in state income taxes.`
      }`,
    },
    {
      question: `What are the cheapest cities in ${state.name}?`,
      answer:
        cheapestCities.length > 0
          ? `The most affordable cities in ${state.name} include ${cheapestCities
              .slice(0, 3)
              .map(
                (c) =>
                  `${c.name} (${c.overallVsNationalAvg} vs national average)`,
              )
              .join(
                ", ",
              )}. These cities offer significantly lower housing, grocery, and healthcare costs compared to national averages. Explore each city page for detailed expense breakdowns.`
          : `Explore the city listings below to compare costs across all ${state.totalCities} cities in ${state.name}. Each city page includes detailed breakdowns of housing, grocery, healthcare, and transportation expenses.`,
    },
    {
      question: `Is ${state.name} a good state to move to?`,
      answer: `${state.name} offers ${affordLabel.toLowerCase()} cost of living with ${state.totalCities} cities to choose from. ${
        (state.avgTaxRate ?? 0) === 0
          ? "With no state income tax, your take-home pay goes further. "
          : ""
      }Key factors to consider include housing costs (average rent ~$${state.avgMedianRent?.toLocaleString() ?? "N/A"}/mo), job market, climate, and quality of life. Browse individual city pages below for specific cost breakdowns to help you decide.`,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Cost of Living in ${state.name}`,
    description: `Compare cost of living across ${state.totalCities} cities in ${state.name}. Average rent: $${state.avgMedianRent?.toLocaleString() ?? "N/A"}/mo.`,
    url: `${SITE_URL}/states/${slug}`,
    publisher: { "@type": "Organization", name: "CostWise", url: SITE_URL },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "States",
          item: `${SITE_URL}/states`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: state.name,
          item: `${SITE_URL}/states/${slug}`,
        },
      ],
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: sortedCities.length,
      itemListElement: sortedCities.slice(0, 20).map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        url: `${SITE_URL}/states/${slug}/${c.slug}`,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary/90 via-primary to-primary/80 text-white py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              {state.stateCode} &bull; {state.totalCities} Cities &bull; 2026
              Data
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              Cost of Living in {state.name}
            </h1>
            <p className="text-lg text-white/85 max-w-2xl leading-relaxed">
              Explore cost of living data for {state.totalCities} cities in{" "}
              {state.name}. Compare housing, rent, groceries, healthcare, and
              utility costs with detailed city-by-city breakdowns.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <Link href="/">
              <span className="cursor-pointer hover-elevate rounded-sm">
                Home
              </span>
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/states">
              <span className="cursor-pointer hover-elevate rounded-sm">
                States
              </span>
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">{state.name}</span>
          </nav>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">
                  Cost Index
                </div>
                <div className="text-2xl font-bold">
                  {state.avgCostIndex?.toFixed(1) ?? "N/A"}
                </div>
                <Badge className={`mt-1 text-xs ${affordColor}`}>
                  {affordLabel}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">
                  Avg Rent
                </div>
                <div className="text-2xl font-bold">
                  ${state.avgMedianRent?.toLocaleString() ?? "N/A"}
                </div>
                <div className="text-xs text-muted-foreground">/month</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">
                  State Tax
                </div>
                <div className="text-2xl font-bold">
                  {(state.avgTaxRate ?? 0) === 0 ? (
                    <span className="text-green-600 dark:text-green-400">
                      None
                    </span>
                  ) : (
                    `${state.avgTaxRate}%`
                  )}
                </div>
                <div className="text-xs text-muted-foreground">income tax</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">
                  Avg Income
                </div>
                <div className="text-2xl font-bold">
                  ${state.avgMedianIncome?.toLocaleString() ?? "N/A"}
                </div>
                <div className="text-xs text-muted-foreground">/year</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">Cities</div>
                <div className="text-2xl font-bold">{state.totalCities}</div>
                <div className="text-xs text-muted-foreground">tracked</div>
              </CardContent>
            </Card>
          </div>

          {/* Cheapest & Expensive */}
          {citiesWithIndex.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-green-600" />
                  Cheapest Cities in {state.name}
                </h2>
                <div className="space-y-2">
                  {cheapestCities.map((city, i) => (
                    <Link
                      key={city.slug}
                      href={`/states/${state.slug}/${city.slug}`}
                    >
                      <Card className="hover-elevate cursor-pointer">
                        <CardContent className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-muted-foreground/40 w-5">
                              {i + 1}
                            </span>
                            <span className="font-medium text-sm">
                              {city.name}
                            </span>
                          </div>
                          <Badge className="bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300 text-xs">
                            {city.overallVsNationalAvg}
                          </Badge>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-red-600" />
                  Most Expensive Cities in {state.name}
                </h2>
                <div className="space-y-2">
                  {expensiveCities.map((city, i) => (
                    <Link
                      key={city.slug}
                      href={`/states/${state.slug}/${city.slug}`}
                    >
                      <Card className="hover-elevate cursor-pointer">
                        <CardContent className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-muted-foreground/40 w-5">
                              {i + 1}
                            </span>
                            <span className="font-medium text-sm">
                              {city.name}
                            </span>
                          </div>
                          <Badge className="bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 text-xs">
                            {city.overallVsNationalAvg}
                          </Badge>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/salary-calculator">
              <Card className="hover-elevate cursor-pointer h-full">
                <CardContent className="p-5">
                  <DollarSign className="w-5 h-5 text-primary mb-2" />
                  <h3 className="font-semibold text-sm">Salary Calculator</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Calculate equivalent salaries between {state.name} cities
                    and other US locations.
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/cheapest-cities">
              <Card className="hover-elevate cursor-pointer h-full">
                <CardContent className="p-5">
                  <TrendingDown className="w-5 h-5 text-primary mb-2" />
                  <h3 className="font-semibold text-sm">Cheapest US Cities</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    See how {state.name} cities rank among the most affordable
                    places to live nationwide.
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/states">
              <Card className="hover-elevate cursor-pointer h-full">
                <CardContent className="p-5">
                  <ArrowUpDown className="w-5 h-5 text-primary mb-2" />
                  <h3 className="font-semibold text-sm">All 50 States + DC</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Compare {state.name} with other states. See rankings by cost
                    index, rent, and tax rates.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* City Grid — client component with search & filter */}
          <StatePageClient state={state} cities={sortedCities} />

          {/* Content Section */}
          <section>
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">
                  Living in {state.name}: What to Know
                </h2>
                <div className="prose prose-sm text-muted-foreground max-w-none space-y-3">
                  <p>
                    {state.name} has a cost of living index of{" "}
                    {state.avgCostIndex?.toFixed(1) ?? "approximately 100"},
                    meaning overall expenses are{" "}
                    {(state.avgCostIndex ?? 100) < 100
                      ? `${(100 - (state.avgCostIndex ?? 100)).toFixed(1)}% lower`
                      : (state.avgCostIndex ?? 100) > 100
                        ? `${((state.avgCostIndex ?? 100) - 100).toFixed(1)}% higher`
                        : "approximately in line with"}{" "}
                    the national average. With {state.totalCities} cities
                    tracked in our database, the state offers a wide range of
                    living situations from very affordable small towns to
                    pricier metropolitan areas.
                  </p>
                  <p>
                    Housing is typically the largest expense category.{" "}
                    {state.avgMedianRent
                      ? `Average rent in ${state.name} is approximately $${state.avgMedianRent.toLocaleString()} per month,`
                      : `Rent prices vary across the state,`}{" "}
                    with significant variation between urban centers and rural
                    communities. Median home values average around $
                    {state.avgMedianHomeValue?.toLocaleString() ?? "N/A"}{" "}
                    statewide.
                  </p>
                  <p>
                    {(state.avgTaxRate ?? 0) === 0
                      ? `${state.name} has no state income tax, which is a significant financial advantage. Residents keep more of their earnings, making it especially attractive for high-income earners, retirees, and remote workers.`
                      : `The state income tax rate in ${state.name} is ${state.avgTaxRate}%, which directly affects take-home pay. Factor this into salary comparisons when considering a move from states with different tax rates.`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* FAQ */}
          <FAQSection
            title={`${state.name} Cost of Living FAQ`}
            subtitle={`Common questions about living costs in ${state.name}.`}
            items={faqItems}
          />
        </div>
      </div>
    </>
  );
}
