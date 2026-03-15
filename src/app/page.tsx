import Link from "next/link";
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FAQSection } from "@/components/FAQSection";
import type { City } from "@/lib/types";
import {
  formatCurrency,
  costIndexLabel,
  costIndexBg,
  costIndexColor,
} from "@/lib/utils";
import { getAllCities, getTopCities } from "@/lib/storage";
import HomeSandboxClient from "./HomeSandboxClient";

export const revalidate = 3600;

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

export default async function Home() {
  const [cities, topCities] = await Promise.all([
    getAllCities().catch(() => [] as City[]),
    getTopCities(12).catch(() => [] as City[]),
  ]);

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
              Compare cost of living across 47 major US cities — from Arizona
              and Las Vegas to Montana, New York, and the Bay Area. Calculate
              salary equivalents, compare housing costs, state taxes, rent
              prices, and find the cheapest and most affordable cities to live
              in America. Powered by Census, BEA, HUD, and BLS data.
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
              <HomeSandboxClient cities={cities} />
            </div>
          </div>
        </section>

        {/* Top Cities Slider */}
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
        </section>
      </div>

      {/* Full-width slider outside container */}
      <div className="city-slider py-2">
        <div className="city-slider-track">
          {[...topCities, ...topCities].map((city, i) => (
            <div key={`${city.slug}-${i}`} className="city-slider-card">
              <CityCard city={city} />
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Trending Comparisons */}
        <section>
          <div className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-2">
            <TrendingUp className="w-4 h-4" />
            Popular Comparisons
          </div>
          <h2 className="text-2xl font-bold mb-6">Trending City Comparisons</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TRENDING_COMPARISONS.map((comp) => {
              const cityAData = cities.find((c) => c.slug === comp.slugA);
              const cityBData = cities.find((c) => c.slug === comp.slugB);
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
                "A cost of living index measures the relative price levels across different geographic areas. CostWise uses the Bureau of Economic Analysis Regional Price Parities (RPP), which compare price levels in each metro area to the national average of 100. An index of 110 means prices are 10% above the national average, while 90 means 10% below. This accounts for housing, groceries, utilities, transportation, and healthcare costs.",
            },
            {
              question:
                "What is the cost of living in Arizona compared to the national average?",
              answer:
                "The cost of living in Arizona varies by city. Phoenix has a cost index close to the national average (around 100), making it relatively affordable compared to coastal cities. Tucson is even more affordable. Average cost of living in Arizona for a single person ranges from $2,500–$3,500/month depending on the city, which is below the US average.",
            },
            {
              question:
                "How much salary do I need to maintain my lifestyle in a new city?",
              answer:
                "Your salary should adjust proportionally to the cost of living difference. For example, if you earn $100,000 in a city with an index of 100 and move to a city with an index of 120, you'd need roughly $120,000. Our salary calculator accounts for housing costs, state taxes, groceries, utilities, and transportation to give you a precise figure — helpful when comparing wages vs cost of living.",
            },
            {
              question:
                "What are the cheapest major cities to live in the United States?",
              answer:
                "Based on our data, the most affordable major US cities include Oklahoma City, Memphis, Wichita, El Paso, and Indianapolis. These cities have cost of living indices 10–15% below the national average, with particularly low housing costs. Several also benefit from no state income tax, making them the cheapest cities to live in America.",
            },
            {
              question:
                "How does the cost of living in Las Vegas compare to other US cities?",
              answer:
                "The cost of living in Las Vegas is close to the national average, with a cost index around 100. Average cost of living in Las Vegas runs roughly $2,800–$3,500/month for a single person. Housing is more affordable than coastal California cities, and Nevada has no state income tax, making it an attractive option for relocators from high-tax states.",
            },
            {
              question:
                "How does state income tax affect my take-home pay when relocating?",
              answer:
                "State income tax can significantly impact your take-home pay. States like Texas, Florida, Tennessee, Nevada, and Washington have no state income tax, while California charges up to 13.3% and New York up to 10.9%. Moving from California to Texas on a $100,000 salary could save you over $10,000 per year in state taxes alone.",
            },
            {
              question: "Where does CostWise get its cost of living data?",
              answer:
                "CostWise aggregates data from four official US government sources: the Bureau of Economic Analysis (Regional Price Parities), US Census Bureau (American Community Survey 5-year estimates for income, rent, and home values), HUD Fair Market Rents, and the Bureau of Labor Statistics (unemployment rates and Consumer Price Index sub-components for groceries, utilities, and transportation). Data is updated annually.",
            },
            {
              question: "How do wages compare to the cost of living over time?",
              answer:
                "Wages vs cost of living has been a growing concern. While the national average household income has risen to around $75,000, housing costs have grown faster — especially in cities like San Francisco, New York, and the Bay Area. Our tools help you understand whether your salary keeps pace with local prices by comparing cost of living vs income in real time.",
            },
          ]}
        />

        {/* CTA Section */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 via-primary to-primary/80 text-white text-center py-12 px-6">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djZoLTZ2LTZoNnptMCAxMnY2aC02di02aDZ6bTEyLTEydjZoLTZ2LTZoNnptMCAxMnY2aC02di02aDZ6TTI0IDM0djZoLTZ2LTZoNnptMCAxMnY2aC02di02aDZ6bTEyLTI0djZoLTZ2LTZoNnptLTEyIDB2NmgtNnYtNmg2em0yNCAwaDB2NmgtNnYtNmg2em0tMzYgMHY2aC02di02aDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Ready to Compare Cities?
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
      </div>
    </div>
  );
}
