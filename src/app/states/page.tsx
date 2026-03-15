import Link from "next/link";
import {
  MapPin,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Building2,
  DollarSign,
  Home,
  ShieldCheck,
  ArrowRight,
  Star,
  Calculator,
  BarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FAQSection } from "@/components/FAQSection";
import { getAllStates } from "@/lib/storage";
import type { Metadata } from "next";

export const revalidate = 3600;

const SITE_URL = "https://costwise.usa-net-zero.com";

export const metadata: Metadata = {
  title: "Cost of Living by State – All 50 US States Ranked & Compared (2026)",
  description:
    "Compare the cost of living across all 50 US states and Washington DC. Explore housing costs, average rent, median income, state income tax rates, grocery prices, utilities, healthcare, and transportation expenses. Find the cheapest and most affordable states to live in America in 2026.",
  keywords: [
    "cost of living by state",
    "cheapest states to live in",
    "most affordable states USA",
    "state cost of living comparison",
    "cost of living index by state",
    "cheapest state to live in US",
    "state income tax comparison",
    "best states to live in America",
    "affordable states to retire",
    "cost of living rankings by state 2026",
    "average rent by state",
    "median income by state",
    "no income tax states",
  ],
  openGraph: {
    title: "Cost of Living by State – All 50 US States Ranked | CostWise",
    description:
      "Compare cost of living across all 50 US states. Find the cheapest and most expensive states with data on housing, taxes, rent, and more.",
    url: `${SITE_URL}/states`,
  },
  alternates: {
    canonical: `${SITE_URL}/states`,
  },
};

function getAffordabilityLabel(avgCostIndex: number | undefined): string {
  if (!avgCostIndex) return "Average";
  if (avgCostIndex < 90) return "Very Affordable";
  if (avgCostIndex < 95) return "Affordable";
  if (avgCostIndex < 105) return "Average";
  if (avgCostIndex < 115) return "Above Average";
  if (avgCostIndex < 130) return "Expensive";
  return "Very Expensive";
}

function getAffordabilityColor(avgCostIndex: number | undefined): string {
  if (!avgCostIndex)
    return "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300";
  if (avgCostIndex < 90)
    return "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300";
  if (avgCostIndex < 95)
    return "bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300";
  if (avgCostIndex < 105)
    return "bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300";
  if (avgCostIndex < 115)
    return "bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300";
  if (avgCostIndex < 130)
    return "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300";
  return "bg-red-200 dark:bg-red-950 text-red-900 dark:text-red-200";
}

function getCostBarWidth(index: number | undefined): number {
  if (!index) return 50;
  return Math.min(Math.max(((index - 70) / 80) * 100, 5), 100);
}

function getCostBarColor(index: number | undefined): string {
  if (!index) return "bg-gray-400";
  if (index < 90) return "bg-emerald-500";
  if (index < 95) return "bg-green-500";
  if (index < 105) return "bg-yellow-500";
  if (index < 115) return "bg-orange-500";
  return "bg-red-500";
}

export default async function StatesPage() {
  const states = await getAllStates().catch(() => []);

  const sortedStates = [...states].sort(
    (a, b) => (a.avgCostIndex ?? 100) - (b.avgCostIndex ?? 100),
  );

  const cheapestStates = sortedStates.slice(0, 5);
  const expensiveStates = sortedStates.slice(-5).reverse();
  const noTaxStates = states.filter((s) => (s.avgTaxRate ?? 0) === 0);
  const totalCities = states.reduce((s, st) => s + st.totalCities, 0);
  const avgRent =
    states.filter((s) => s.avgMedianRent).length > 0
      ? states.reduce((s, st) => s + (st.avgMedianRent ?? 0), 0) /
        states.filter((s) => s.avgMedianRent).length
      : 0;
  const avgIncome =
    states.filter((s) => s.avgMedianIncome).length > 0
      ? states.reduce((s, st) => s + (st.avgMedianIncome ?? 0), 0) /
        states.filter((s) => s.avgMedianIncome).length
      : 0;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Cost of Living by State – All 50 US States Ranked",
    description:
      "Compare cost of living across all 50 US states and Washington DC. Find the cheapest states, average rent, median income, and tax rates.",
    url: `${SITE_URL}/states`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: states.length,
      itemListElement: sortedStates.slice(0, 10).map((st, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${st.name} – Cost Index ${st.avgCostIndex?.toFixed(1) ?? "N/A"}`,
        url: `${SITE_URL}/states/${st.slug}`,
      })),
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "States",
          item: `${SITE_URL}/states`,
        },
      ],
    },
  };

  return (
    <div className="min-h-screen">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/90 via-primary to-primary/80 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djZoLTZ2LTZoNnptMCAxMnY2aC02di02aDZ6bTEyLTEydjZoLTZ2LTZoNnptMCAxMnY2aC02di02aDZ6TTI0IDM0djZoLTZ2LTZoNnptMCAxMnY2aC02di02aDZ6bTEyLTI0djZoLTZ2LTZoNnptLTEyIDB2NmgtNnYtNmg2em0yNCAwaDB2NmgtNnYtNmg2em0tMzYgMHY2aC02di02aDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <Badge className="mb-4 bg-white/20 text-white border-white/30">
            All 50 States + DC &bull; Updated 2026
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
            Cost of Living by State
          </h1>
          <p className="text-lg md:text-xl text-white/85 max-w-2xl leading-relaxed mb-8">
            Explore detailed cost of living data for every US state. Compare
            housing costs, rent prices, state income taxes, groceries,
            utilities, and more — powered by Census Bureau, BEA, HUD, and BLS
            data.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/salary-calculator">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 font-semibold"
              >
                <Calculator className="w-4 h-4" /> Salary Calculator
              </Button>
            </Link>
            <Link href="/cheapest-cities">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 text-white border-white/40 bg-white/10"
              >
                <TrendingDown className="w-4 h-4" /> Cheapest Cities
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Stats Bar */}
      <section className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              {
                label: "States + DC",
                value: states.length.toString(),
                icon: Building2,
              },
              {
                label: "Total Cities",
                value: totalCities.toLocaleString(),
                icon: MapPin,
              },
              {
                label: "No Income Tax",
                value: noTaxStates.length.toString(),
                icon: ShieldCheck,
              },
              {
                label: "Avg Rent",
                value:
                  avgRent > 0
                    ? `$${Math.round(avgRent).toLocaleString()}/mo`
                    : "N/A",
                icon: Home,
              },
              {
                label: "Avg Income",
                value:
                  avgIncome > 0
                    ? `$${Math.round(avgIncome).toLocaleString()}`
                    : "N/A",
                icon: DollarSign,
              },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <stat.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-bold text-lg leading-tight">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/">
            <span className="cursor-pointer hover-elevate rounded-sm">
              Home
            </span>
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">States</span>
        </nav>

        {/* Top 5 Cheapest & Expensive */}
        <section>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Cheapest */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Top 5 Cheapest States</h2>
                  <p className="text-xs text-muted-foreground">
                    Lowest cost of living index
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {cheapestStates.map((st, i) => (
                  <Link key={st.slug} href={`/states/${st.slug}`}>
                    <Card className="hover-elevate cursor-pointer transition-all duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-emerald-500/40 w-8 text-center">
                              {i + 1}
                            </span>
                            <div>
                              <div className="font-semibold">{st.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {st.totalCities} cities &bull;{" "}
                                {(st.avgTaxRate ?? 0) === 0 ? (
                                  <span className="text-green-600 dark:text-green-400">
                                    No income tax
                                  </span>
                                ) : (
                                  `${st.avgTaxRate}% tax`
                                )}{" "}
                                &bull; ~$
                                {st.avgMedianRent?.toLocaleString() ?? "N/A"}/mo
                                rent
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                              {st.avgCostIndex?.toFixed(1)}
                            </div>
                            <Badge
                              className={`text-xs ${getAffordabilityColor(st.avgCostIndex)}`}
                            >
                              {getAffordabilityLabel(st.avgCostIndex)}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-3 w-full bg-muted rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${getCostBarColor(st.avgCostIndex)} transition-all`}
                            style={{
                              width: `${getCostBarWidth(st.avgCostIndex)}%`,
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Most Expensive */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    Top 5 Most Expensive States
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Highest cost of living index
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {expensiveStates.map((st, i) => (
                  <Link key={st.slug} href={`/states/${st.slug}`}>
                    <Card className="hover-elevate cursor-pointer transition-all duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-red-500/40 w-8 text-center">
                              {i + 1}
                            </span>
                            <div>
                              <div className="font-semibold">{st.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {st.totalCities} cities &bull;{" "}
                                {(st.avgTaxRate ?? 0) === 0 ? (
                                  <span className="text-green-600 dark:text-green-400">
                                    No income tax
                                  </span>
                                ) : (
                                  `${st.avgTaxRate}% tax`
                                )}{" "}
                                &bull; ~$
                                {st.avgMedianRent?.toLocaleString() ?? "N/A"}/mo
                                rent
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-lg font-bold text-red-600 dark:text-red-400">
                              {st.avgCostIndex?.toFixed(1)}
                            </div>
                            <Badge
                              className={`text-xs ${getAffordabilityColor(st.avgCostIndex)}`}
                            >
                              {getAffordabilityLabel(st.avgCostIndex)}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-3 w-full bg-muted rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${getCostBarColor(st.avgCostIndex)} transition-all`}
                            style={{
                              width: `${getCostBarWidth(st.avgCostIndex)}%`,
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* No Income Tax States */}
        <section className="bg-card rounded-xl border border-card-border p-6 md:p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">States With No Income Tax</h2>
              <p className="text-sm text-muted-foreground">
                These {noTaxStates.length} states charge zero state income tax —
                saving residents thousands per year
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {noTaxStates.map((st) => (
              <Link key={st.slug} href={`/states/${st.slug}`}>
                <Card className="hover-elevate cursor-pointer transition-all duration-200 h-full">
                  <CardContent className="p-4 text-center">
                    <div className="font-semibold text-sm">{st.name}</div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {st.stateCode} &bull; {st.totalCities} cities
                    </div>
                    <Badge
                      className={`text-xs ${getAffordabilityColor(st.avgCostIndex)}`}
                    >
                      Index: {st.avgCostIndex?.toFixed(1) ?? "N/A"}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Tools */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Quick Tools</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/salary-calculator">
              <Card className="hover-elevate cursor-pointer h-full transition-all duration-200">
                <CardContent className="p-5">
                  <Calculator className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-1">Salary Calculator</h3>
                  <p className="text-xs text-muted-foreground">
                    Calculate how your salary translates between cities with
                    different costs of living.
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/cheapest-cities">
              <Card className="hover-elevate cursor-pointer h-full transition-all duration-200">
                <CardContent className="p-5">
                  <TrendingDown className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-3" />
                  <h3 className="font-semibold mb-1">Cheapest Cities</h3>
                  <p className="text-xs text-muted-foreground">
                    Browse the most affordable cities in America ranked by cost
                    of living index.
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/compare/new-york-ny/vs/los-angeles-ca">
              <Card className="hover-elevate cursor-pointer h-full transition-all duration-200">
                <CardContent className="p-5">
                  <BarChart2 className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-3" />
                  <h3 className="font-semibold mb-1">City Comparison</h3>
                  <p className="text-xs text-muted-foreground">
                    Side-by-side comparison of housing, groceries, healthcare,
                    taxes, and more.
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/">
              <Card className="hover-elevate cursor-pointer h-full transition-all duration-200">
                <CardContent className="p-5">
                  <Home className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
                  <h3 className="font-semibold mb-1">City Explorer</h3>
                  <p className="text-xs text-muted-foreground">
                    Explore detailed cost of living profiles for 47 major US
                    cities.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* All States Grid */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              All States — Cost of Living Rankings
            </h2>
            <p className="text-muted-foreground">
              Every US state ranked by cost of living index. An index of 100 is
              the national average — lower is more affordable.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedStates.map((st, idx) => (
              <Link key={st.slug} href={`/states/${st.slug}`}>
                <Card className="hover-elevate cursor-pointer h-full transition-all duration-200 group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-primary">
                            {idx + 1}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold group-hover:text-primary transition-colors">
                            {st.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {st.stateCode}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={`text-xs shrink-0 ${getAffordabilityColor(st.avgCostIndex)}`}
                      >
                        {getAffordabilityLabel(st.avgCostIndex)}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Cost Index
                        </span>
                        <span className="font-bold">
                          {st.avgCostIndex?.toFixed(1) ?? "N/A"}
                        </span>
                      </div>

                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getCostBarColor(st.avgCostIndex)} transition-all`}
                          style={{
                            width: `${getCostBarWidth(st.avgCostIndex)}%`,
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">
                            Cities
                          </div>
                          <div className="text-sm font-semibold">
                            {st.totalCities}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">
                            Tax
                          </div>
                          <div className="text-sm font-semibold">
                            {(st.avgTaxRate ?? 0) === 0 ? (
                              <span className="text-green-600 dark:text-green-400">
                                0%
                              </span>
                            ) : (
                              `${st.avgTaxRate}%`
                            )}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">
                            Rent
                          </div>
                          <div className="text-sm font-semibold">
                            $
                            {st.avgMedianRent
                              ? st.avgMedianRent.toLocaleString()
                              : "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border">
                      <span className="text-xs text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        Explore {st.name} <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Popular State Explorations — internal linking */}
        <section className="bg-card rounded-xl border border-card-border p-6 md:p-8">
          <h2 className="text-xl font-bold mb-2">Popular State Explorations</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Explore the most searched states for cost of living data
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              "california",
              "texas",
              "florida",
              "new-york",
              "colorado",
              "washington",
              "north-carolina",
              "tennessee",
              "arizona",
              "georgia",
              "virginia",
              "ohio",
            ].map((slug) => {
              const st = states.find((s) => s.slug === slug);
              if (!st) return null;
              return (
                <Link key={st.slug} href={`/states/${st.slug}`}>
                  <Card className="hover-elevate cursor-pointer h-full transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="font-medium text-sm">{st.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {st.totalCities} cities
                          </div>
                        </div>
                        <Badge
                          className={`text-xs ${getAffordabilityColor(st.avgCostIndex)}`}
                        >
                          {st.avgCostIndex?.toFixed(1)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Content Section */}
        <section>
          <Card>
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-4">
                Understanding Cost of Living by State in 2026
              </h2>
              <div className="prose prose-sm text-muted-foreground max-w-none space-y-4">
                <p>
                  The cost of living varies dramatically across the United
                  States. A dollar in Mississippi buys significantly more than
                  it does in Hawaii or California. Understanding these
                  differences is critical when{" "}
                  <Link
                    href="/salary-calculator"
                    className="text-primary hover:underline"
                  >
                    negotiating salaries
                  </Link>
                  , relocating for work, or planning for retirement.
                </p>

                <h3 className="text-foreground font-semibold text-base">
                  Key Factors That Determine State Cost of Living
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Housing costs</strong> — Typically the largest
                    expense, varying by 300%+ between the cheapest and most
                    expensive states. See{" "}
                    <Link
                      href="/cheapest-cities"
                      className="text-primary hover:underline"
                    >
                      cheapest cities to live in the US
                    </Link>{" "}
                    for specific city data.
                  </li>
                  <li>
                    <strong>State income tax</strong> — Ranges from 0% in{" "}
                    {noTaxStates.length} states to over 13% in California,
                    directly impacting take-home pay
                  </li>
                  <li>
                    <strong>Groceries &amp; food</strong> — Can vary by 20-30%
                    between states, especially for fresh produce
                  </li>
                  <li>
                    <strong>Healthcare</strong> — Insurance premiums and
                    out-of-pocket costs vary significantly. Compare healthcare
                    costs by city in our{" "}
                    <Link
                      href="/cost-of-living/new-york-ny"
                      className="text-primary hover:underline"
                    >
                      city profiles
                    </Link>
                    .
                  </li>
                  <li>
                    <strong>Utilities</strong> — Energy costs depend on climate,
                    energy sources, and state regulations
                  </li>
                  <li>
                    <strong>Transportation</strong> — Gas prices, public transit
                    availability, and commute distances factor into monthly
                    costs
                  </li>
                </ul>

                <h3 className="text-foreground font-semibold text-base">
                  Tips for Using State Cost of Living Data
                </h3>
                <p>
                  State averages are useful for a high-level comparison, but
                  costs vary significantly within a state. Use our{" "}
                  <Link
                    href="/salary-calculator"
                    className="text-primary hover:underline"
                  >
                    salary calculator
                  </Link>{" "}
                  to compare specific cities, or explore individual state pages
                  for city-by-city breakdowns. You can also{" "}
                  <Link
                    href="/compare/new-york-ny/vs/austin-tx"
                    className="text-primary hover:underline"
                  >
                    compare two cities head-to-head
                  </Link>{" "}
                  for a detailed cost breakdown.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 via-primary to-primary/80 text-white text-center py-12 px-6">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djZoLTZ2LTZoNnptMCAxMnY2aC02di02aDZ6bTEyLTEydjZoLTZ2LTZoNnptMCAxMnY2aC02di02aDZ6TTI0IDM0djZoLTZ2LTZoNnptMCAxMnY2aC02di02aDZ6bTEyLTI0djZoLTZ2LTZoNnptLTEyIDB2NmgtNnYtNmg2em0yNCAwaDB2NmgtNnYtNmg2em0tMzYgMHY2aC02di02aDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Ready to Compare Specific Cities?
            </h2>
            <p className="text-white/80 mb-8 max-w-lg mx-auto">
              Use our salary calculator for a full breakdown including tax
              analysis, rent-to-income ratios, and affordability scores.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/salary-calculator">
                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-2 font-semibold"
                >
                  <Calculator className="w-4 h-4" /> Open Salary Calculator
                </Button>
              </Link>
              <Link href="/cheapest-cities">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-white/30 text-white hover:bg-white/10"
                >
                  <MapPin className="w-4 h-4" /> Find Affordable Cities
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <FAQSection
          title="Cost of Living by State FAQ"
          subtitle="Common questions about comparing living costs across US states."
          items={[
            {
              question: "What is the cheapest state to live in the US?",
              answer: `Based on Bureau of Economic Analysis Regional Price Parities, ${cheapestStates[0]?.name ?? "Mississippi"} ranks as the cheapest state with a cost index of ${cheapestStates[0]?.avgCostIndex?.toFixed(1) ?? "~85"}. Other affordable states include ${cheapestStates
                .slice(1, 4)
                .map((s) => s.name)
                .join(
                  ", ",
                )}. These states offer housing costs 30-50% below coastal states.`,
            },
            {
              question: "What is the most expensive state to live in?",
              answer: `${expensiveStates[0]?.name ?? "Hawaii"} is the most expensive with a cost index of ${expensiveStates[0]?.avgCostIndex?.toFixed(1) ?? "~130"}. ${expensiveStates
                .slice(1, 4)
                .map((s) => s.name)
                .join(
                  ", ",
                )} also rank among the priciest due to high housing demand and limited supply.`,
            },
            {
              question: "Which states have no income tax?",
              answer: `${noTaxStates.length} states have no income tax: ${noTaxStates.map((s) => s.name).join(", ")}. These states are popular for retirees and remote workers maximizing take-home pay. Some compensate with higher sales or property taxes.`,
            },
            {
              question: "How much does cost of living vary between states?",
              answer: `The cheapest states have indices around ${cheapestStates[0]?.avgCostIndex?.toFixed(0) ?? "85"}-${cheapestStates[1]?.avgCostIndex?.toFixed(0) ?? "87"}, while the most expensive range from ${expensiveStates[1]?.avgCostIndex?.toFixed(0) ?? "115"}-${expensiveStates[0]?.avgCostIndex?.toFixed(0) ?? "130"}+. Housing shows the widest variation — a 2-bedroom apartment costs $800/mo in affordable states vs $3,000+/mo in expensive metros.`,
            },
            {
              question: "What is the best state to retire in affordably?",
              answer:
                "Tennessee, Texas, Florida, South Dakota, and Nevada are top retirement states — all with no income tax and relatively low living costs. Consider healthcare access, property taxes, climate, and quality of life beyond just the cost index.",
            },
            {
              question:
                "How does state income tax affect total cost of living?",
              answer:
                "State income tax massively impacts take-home pay. Moving from California (13.3% top rate) to Texas (0%) on $100,000 saves over $10,000/year. However, no-tax states may compensate with higher property or sales taxes.",
            },
            {
              question: "What is the average cost of living in the US?",
              answer: `The national average index is 100 (BEA). Average household income across states is ~$${avgIncome > 0 ? Math.round(avgIncome).toLocaleString() : "75,000"}, and average monthly rent is ~$${avgRent > 0 ? Math.round(avgRent).toLocaleString() : "1,400"}/month.`,
            },
          ]}
        />
      </div>
    </div>
  );
}
