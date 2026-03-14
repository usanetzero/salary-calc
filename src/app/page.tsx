"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  TrendingUp,
  Calculator,
  ArrowRight,
  DollarSign,
  Home as HomeIcon,
  Utensils,
  Zap,
  Car,
  Activity,
  ChevronRight,
  BarChart2,
  Star,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { FAQSection } from "@/components/FAQSection";
import type { City } from "@/lib/types";
import {
  formatCurrency,
  costIndexLabel,
  costIndexBg,
  costIndexColor,
} from "@/lib/utils";

const TRENDING_COMPARISONS = [
  {
    slugA: "austin-tx",
    slugB: "dallas-tx",
    cityA: "Austin",
    cityB: "Dallas",
    stateA: "TX",
    stateB: "TX",
  },
  {
    slugA: "new-york-ny",
    slugB: "los-angeles-ca",
    cityA: "New York",
    cityB: "Los Angeles",
    stateA: "NY",
    stateB: "CA",
  },
  {
    slugA: "seattle-wa",
    slugB: "san-francisco-ca",
    cityA: "Seattle",
    cityB: "San Francisco",
    stateA: "WA",
    stateB: "CA",
  },
  {
    slugA: "miami-fl",
    slugB: "nashville-tn",
    cityA: "Miami",
    cityB: "Nashville",
    stateA: "FL",
    stateB: "TN",
  },
  {
    slugA: "denver-co",
    slugB: "austin-tx",
    cityA: "Denver",
    cityB: "Austin",
    stateA: "CO",
    stateB: "TX",
  },
  {
    slugA: "chicago-il",
    slugB: "dallas-tx",
    cityA: "Chicago",
    cityB: "Dallas",
    stateA: "IL",
    stateB: "TX",
  },
];

function CityCard({ city }: { city: City }) {
  return (
    <Link href={`/cost-of-living/${city.slug}`}>
      <Card className="cursor-pointer hover-elevate transition-all duration-200 h-full">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <h3 className="font-semibold text-base leading-tight">
                {city.name}
              </h3>
              <p className="text-sm text-muted-foreground">{city.state}</p>
            </div>
            <Badge
              className={`text-xs shrink-0 ${costIndexBg(city.costIndex)}`}
            >
              {costIndexLabel(city.costIndex)}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <BarChart2 className="w-3 h-3" /> Cost Index
              </span>
              <span
                className={`font-semibold ${costIndexColor(city.costIndex)}`}
              >
                {city.costIndex.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <HomeIcon className="w-3 h-3" /> Median Rent
              </span>
              <span className="font-medium">
                {formatCurrency(city.medianRent)}/mo
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <DollarSign className="w-3 h-3" /> Median Income
              </span>
              <span className="font-medium">
                {formatCurrency(city.medianIncome, { compact: true })}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-primary transition-all"
                  style={{
                    width: `${Math.min((city.costIndex / 200) * 100, 100)}%`,
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground ml-2 shrink-0">
                vs avg
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function SalarySandboxCalculator({ cities }: { cities: City[] }) {
  const [salary, setSalary] = useState(80000);
  const [fromCity, setFromCity] = useState("new-york-ny");
  const [toCity, setToCity] = useState("austin-tx");

  const fromCityData = cities.find((c) => c.slug === fromCity);
  const toCityData = cities.find((c) => c.slug === toCity);

  const adjustedSalary =
    fromCityData && toCityData
      ? salary * (toCityData.costIndex / fromCityData.costIndex)
      : null;

  const diff = adjustedSalary ? adjustedSalary - salary : null;

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          Quick Salary Adjustment
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          See how your salary compares in a different city. 100 = national
          average.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <label className="text-sm font-medium mb-2 block">Your Salary</label>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(salary)}
            </span>
          </div>
          <Slider
            value={[salary]}
            onValueChange={([v]) => setSalary(v)}
            min={20000}
            max={300000}
            step={5000}
            className="mt-3"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>$20K</span>
            <span>$300K</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              From City
            </label>
            <Select value={fromCity} onValueChange={setFromCity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cities.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>
                    {c.name}, {c.stateCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">To City</label>
            <Select value={toCity} onValueChange={setToCity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cities.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>
                    {c.name}, {c.stateCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {adjustedSalary !== null &&
          diff !== null &&
          fromCityData &&
          toCityData && (
            <div className="rounded-md bg-accent p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Equivalent Salary in {toCityData.name}
                </span>
                <span className="text-xl font-bold">
                  {formatCurrency(adjustedSalary)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Difference</span>
                <span
                  className={
                    diff > 0
                      ? "text-green-600 dark:text-green-400 font-medium"
                      : "text-red-600 dark:text-red-400 font-medium"
                  }
                >
                  {diff > 0 ? "+" : ""}
                  {formatCurrency(diff)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Cost Index: {fromCityData.name}
                </span>
                <span className="font-medium">
                  {fromCityData.costIndex.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Cost Index: {toCityData.name}
                </span>
                <span className="font-medium">
                  {toCityData.costIndex.toFixed(1)}
                </span>
              </div>
            </div>
          )}

        <Link href="/salary-calculator">
          <Button className="w-full gap-2">
            Full Salary Calculator <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const { data: cities } = useQuery<City[]>({
    queryKey: ["/api/cities"],
  });

  const { data: topCities, isLoading: loadingTop } = useQuery<City[]>({
    queryKey: ["/api/cities/top"],
    queryFn: async () => {
      const res = await fetch("/api/cities/top?limit=12");
      return res.json();
    },
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/90 via-primary to-primary/80 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djZoLTZ2LTZoNnptMCAxMnY2aC02di02aDZ6bTEyLTEydjZoLTZ2LTZoNnptMCAxMnY2aC02di02aDZ6TTI0IDM0djZoLTZ2LTZoNnptMCAxMnY2aC02di02aDZ6bTEyLTI0djZoLTZ2LTZoNnptLTEyIDB2NmgtNnYtNmg2em0yNCAwaDB2NmgtNnYtNmg2em0tMzYgMHY2aC02di02aDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              Free &bull; Updated 2025 &bull; 47 US Cities
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Cost of Living Comparison
              <span className="block text-white/80">
                Calculator for US Cities
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/85 mb-8 leading-relaxed max-w-2xl">
              Compare cost of living index across 47 major US cities. Calculate
              salary equivalents, compare housing costs, state taxes, rent
              prices, and find the cheapest cities to live in America — powered
              by Census, BEA, HUD, and BLS data.
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
                  <TrendingUp className="w-4 h-4" /> Cheapest Cities
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Stats Bar */}
      <section className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Cities Covered", value: "50+", icon: MapPin },
              { label: "Data Sources", value: "4 Gov APIs", icon: BarChart2 },
              { label: "Average US Rent", value: "$1,720/mo", icon: HomeIcon },
              {
                label: "National Avg Income",
                value: "$74,580",
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
        {/* Calculator + Intro */}
        <section>
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div>
              <div className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-3">
                <Calculator className="w-4 h-4" />
                Interactive Tool
              </div>
              <h2 className="text-3xl font-bold mb-4">
                What Is Your Salary Worth?
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                A $100,000 salary in New York City has the purchasing power of
                just $59,000 in terms of national average. Our calculator
                adjusts for the full cost of living difference between any two
                cities.
              </p>
              <div className="space-y-3">
                {[
                  {
                    icon: HomeIcon,
                    text: "Housing costs including rent and mortgage payments",
                  },
                  {
                    icon: Utensils,
                    text: "Grocery and dining out price differences",
                  },
                  {
                    icon: Zap,
                    text: "Utilities — electricity, gas, water, internet",
                  },
                  {
                    icon: Car,
                    text: "Transportation costs including gas and transit",
                  },
                  {
                    icon: Activity,
                    text: "Healthcare costs by metropolitan area",
                  },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              {cities ? (
                <SalarySandboxCalculator cities={cities} />
              ) : (
                <Card>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-48 mb-4" />
                    <Skeleton className="h-10 w-full mb-3" />
                    <Skeleton className="h-10 w-full mb-3" />
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>

        {/* Top Cities Grid */}
        <section>
          <div className="flex items-center justify-between mb-6 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-2">
                <Star className="w-4 h-4" />
                Popular Cities
              </div>
              <h2 className="text-2xl font-bold">
                Explore Cost of Living by City
              </h2>
            </div>
            <Link href="/cheapest-cities">
              <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {loadingTop ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-20 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {topCities?.map((city) => (
                <CityCard key={city.slug} city={city} />
              ))}
            </div>
          )}
        </section>

        {/* Trending Comparisons */}
        <section>
          <div className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-2">
            <TrendingUp className="w-4 h-4" />
            Popular Comparisons
          </div>
          <h2 className="text-2xl font-bold mb-6">Trending City Comparisons</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TRENDING_COMPARISONS.map((comp) => {
              const cityAData = cities?.find((c) => c.slug === comp.slugA);
              const cityBData = cities?.find((c) => c.slug === comp.slugB);
              return (
                <Link
                  key={`${comp.slugA}-${comp.slugB}`}
                  href={`/compare/${comp.slugA}/vs/${comp.slugB}`}
                >
                  <Card className="cursor-pointer hover-elevate">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 text-center">
                          <div className="font-semibold text-sm">
                            {comp.cityA}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {comp.stateA}
                          </div>
                          {cityAData && (
                            <div
                              className={`text-sm font-bold mt-1 ${costIndexColor(cityAData.costIndex)}`}
                            >
                              {cityAData.costIndex.toFixed(0)}
                            </div>
                          )}
                        </div>
                        <div className="text-muted-foreground font-medium text-sm px-2">
                          vs
                        </div>
                        <div className="flex-1 text-center">
                          <div className="font-semibold text-sm">
                            {comp.cityB}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {comp.stateB}
                          </div>
                          {cityBData && (
                            <div
                              className={`text-sm font-bold mt-1 ${costIndexColor(cityBData.costIndex)}`}
                            >
                              {cityBData.costIndex.toFixed(0)}
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Cost Breakdown Explanation */}
        <section className="bg-card rounded-lg border border-card-border p-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-2">
              How We Calculate Cost of Living
            </h2>
            <p className="text-muted-foreground mb-8">
              Our cost of living index is built from four authoritative US
              government data sources.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  title: "US Census Bureau",
                  desc: "Median household income, population data, and housing cost surveys form the foundation of our city profiles.",
                  icon: Users,
                },
                {
                  title: "Bureau of Economic Analysis (BEA)",
                  desc: "Regional Price Parities (RPP) provide the most accurate cross-city cost comparison methodology available.",
                  icon: BarChart2,
                },
                {
                  title: "HUD Fair Market Rents",
                  desc: "Annual Fair Market Rent data gives us precise rental cost benchmarks for 2-bedroom units in every metro area.",
                  icon: HomeIcon,
                },
                {
                  title: "Bureau of Labor Statistics",
                  desc: "CPI regional data tracks price changes for groceries, utilities, healthcare, and transportation by metro area.",
                  icon: TrendingUp,
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          title="Cost of Living FAQ"
          subtitle="Common questions about comparing the cost of living across US cities."
          items={[
            {
              question:
                "What is a cost of living index and how is it calculated?",
              answer:
                "A cost of living index measures the relative price levels across different geographic areas. CostWise uses the Bureau of Economic Analysis Regional Price Parities (RPP), which compare price levels in each metro area to the national average of 100. An index of 110 means prices are 10% above the national average, while 90 means 10% below.",
            },
            {
              question:
                "How much salary do I need to earn to maintain my lifestyle in a new city?",
              answer:
                "To maintain the same standard of living, your salary should adjust proportionally to the cost of living difference. For example, if you earn $100,000 in a city with an index of 100 and move to a city with an index of 120, you'd need roughly $120,000. Our salary calculator accounts for housing costs, taxes, groceries, utilities, and transportation to give you a precise figure.",
            },
            {
              question:
                "What are the cheapest major cities to live in the United States?",
              answer:
                "Based on our data, the most affordable major US cities include Oklahoma City, Memphis, Wichita, El Paso, and Indianapolis. These cities have cost of living indices 10-15% below the national average, with particularly low housing costs. Several also benefit from no state income tax.",
            },
            {
              question:
                "How does state income tax affect my take-home pay when relocating?",
              answer:
                "State income tax can significantly impact your take-home pay. States like Texas, Florida, Tennessee, Nevada, and Washington have no state income tax, while California charges up to 13.3% and New York up to 10.9%. Moving from California to Texas on a $100,000 salary could save you over $10,000 per year in state taxes alone.",
            },
            {
              question: "Where does CostWise get its data?",
              answer:
                "CostWise aggregates data from four official US government sources: the Bureau of Economic Analysis (Regional Price Parities), US Census Bureau (American Community Survey 5-year estimates for income, rent, and home values), HUD Fair Market Rents, and the Bureau of Labor Statistics (unemployment rates and Consumer Price Index sub-components for groceries, utilities, and transportation).",
            },
            {
              question: "How often is the cost of living data updated?",
              answer:
                "Our data is updated annually when new government figures are released. Census ACS data is typically released each December, BEA price parities in late summer, HUD Fair Market Rents in fall, and BLS unemployment data monthly with annual averages published in January.",
            },
          ]}
        />

        {/* CTA Section */}
        <section className="text-center py-8">
          <h2 className="text-2xl font-bold mb-3">Ready to Compare?</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Use our full salary calculator for a complete breakdown including
            tax analysis, rent ratios, and lifestyle comfort scores.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/salary-calculator">
              <Button size="lg" className="gap-2">
                <Calculator className="w-4 h-4" /> Open Salary Calculator
              </Button>
            </Link>
            <Link href="/cheapest-cities">
              <Button size="lg" variant="outline" className="gap-2">
                <MapPin className="w-4 h-4" /> Find Affordable Cities
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
