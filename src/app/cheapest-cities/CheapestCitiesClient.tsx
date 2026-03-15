"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { TrendingDown, MapPin, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SimpleSelect } from "@/components/CitySelect";
import { Skeleton } from "@/components/ui/skeleton";
import type { City } from "@/lib/types";
import { FAQSection } from "@/components/FAQSection";
import {
  formatCurrency,
  costIndexLabel,
  costIndexBg,
  costIndexColor,
} from "@/lib/utils";

const US_STATES = [
  { code: "all", name: "All States" },
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "SC", name: "South Carolina" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
  { code: "DC", name: "Washington DC" },
];

type SortBy = "costIndex" | "medianRent" | "medianIncome" | "name";

export default function CheapestCitiesClient({
  initialCities = [],
}: {
  initialCities?: City[];
}) {
  const searchParams = useSearchParams();
  const initialState = searchParams.get("state") || "all";

  const [selectedState, setSelectedState] = useState(initialState);
  const [sortBy, setSortBy] = useState<SortBy>("costIndex");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: cities, isLoading } = useQuery<City[]>({
    queryKey: ["/api/cities"],
    initialData: initialCities.length > 0 ? initialCities : undefined,
  });

  const filteredCities = cities
    ? cities
        .filter((c) => {
          const matchesState =
            selectedState === "all" || c.stateCode === selectedState;
          const matchesSearch =
            !searchQuery ||
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.state.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesState && matchesSearch;
        })
        .sort((a, b) => {
          if (sortBy === "costIndex") return a.costIndex - b.costIndex;
          if (sortBy === "medianRent") return a.medianRent - b.medianRent;
          if (sortBy === "medianIncome") return b.medianIncome - a.medianIncome;
          if (sortBy === "name") return a.name.localeCompare(b.name);
          return 0;
        })
    : [];

  const selectedStateName =
    US_STATES.find((s) => s.code === selectedState)?.name || "All States";
  const pageTitle =
    selectedState === "all"
      ? "Cheapest Cities to Live in the US"
      : `Cheapest Cities in ${selectedStateName}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/">
          <span className="cursor-pointer hover-elevate rounded-sm">Home</span>
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">Cheapest Cities</span>
      </nav>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-2">
          <TrendingDown className="w-4 h-4" />
          Affordability Rankings — 2026
        </div>
        <h1
          className="text-3xl md:text-4xl font-bold mb-3"
          data-testid="text-page-title"
        >
          {pageTitle}
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Find the most affordable and cheapest cities to live in America.
          Ranked by cost of living index (100 = national average). Lower is more
          affordable. Data sourced from Census Bureau, BEA, HUD, and BLS.
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Filter by State
              </label>
              <SimpleSelect
                options={US_STATES.map((s) => ({
                  value: s.code,
                  label: s.name,
                }))}
                value={selectedState}
                onChange={setSelectedState}
                data-testid="select-state-filter"
              />
            </div>

            <div className="flex-1 min-w-[160px]">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Sort By
              </label>
              <SimpleSelect
                options={[
                  { value: "costIndex", label: "Cost Index (Low to High)" },
                  { value: "medianRent", label: "Median Rent (Low to High)" },
                  {
                    value: "medianIncome",
                    label: "Median Income (High to Low)",
                  },
                  { value: "name", label: "City Name (A-Z)" },
                ]}
                value={sortBy}
                onChange={(v) => setSortBy(v as SortBy)}
                data-testid="select-sort-by"
              />
            </div>

            <div className="flex-1 min-w-[180px]">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter cities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                  data-testid="input-search-cities"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p
          className="text-sm text-muted-foreground"
          data-testid="text-results-count"
        >
          {isLoading ? "Loading..." : `${filteredCities.length} cities found`}
        </p>
        {selectedState !== "all" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedState("all")}
            data-testid="button-clear-filter"
          >
            Clear filter
          </Button>
        )}
      </div>

      {/* City Table / Grid */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md" />
          ))}
        </div>
      ) : filteredCities.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              No cities found matching your criteria.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => {
                setSelectedState("all");
                setSearchQuery("");
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCities.map((city, idx) => (
            <Link key={city.slug} href={`/cost-of-living/${city.slug}`}>
              <Card
                className="cursor-pointer hover-elevate h-full transition-all duration-200"
                data-testid={`row-city-${city.slug}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground/50 w-8">
                        {idx + 1}
                      </span>
                      <div>
                        <h3 className="font-semibold text-base leading-tight">
                          {city.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {city.state}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={`text-xs shrink-0 ${costIndexBg(city.costIndex)}`}
                    >
                      {costIndexLabel(city.costIndex)}
                    </Badge>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">
                          Cost Index
                        </span>
                        <span
                          className={`font-bold ${costIndexColor(city.costIndex)}`}
                        >
                          {city.costIndex.toFixed(1)}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${city.costIndex <= 95 ? "bg-green-500" : city.costIndex <= 105 ? "bg-yellow-500" : "bg-red-500"}`}
                          style={{
                            width: `${Math.min((city.costIndex / 150) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Median Rent</span>
                      <span className="font-medium">
                        {formatCurrency(city.medianRent)}/mo
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Median Income
                      </span>
                      <span className="font-medium">
                        {formatCurrency(city.medianIncome, { compact: true })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">State Tax</span>
                      <span className="font-medium">
                        {city.taxRate === 0 ? (
                          <span className="text-green-600 dark:text-green-400">
                            None
                          </span>
                        ) : (
                          `${city.taxRate}%`
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-end">
                    <span className="text-xs text-primary font-medium flex items-center gap-1">
                      View Details <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Quick State Links */}
      <section className="mt-12">
        <h2 className="text-xl font-bold mb-4">Browse by State</h2>
        <div className="flex flex-wrap gap-2">
          {[
            "TX",
            "FL",
            "TN",
            "NC",
            "IN",
            "OH",
            "MO",
            "GA",
            "AZ",
            "NV",
            "CO",
            "WA",
            "OR",
          ].map((code) => {
            const stateName =
              US_STATES.find((s) => s.code === code)?.name || code;
            return (
              <Button
                key={code}
                variant="outline"
                size="sm"
                onClick={() => setSelectedState(code)}
                className={
                  selectedState === code ? "border-primary text-primary" : ""
                }
                data-testid={`button-state-${code.toLowerCase()}`}
              >
                {stateName}
              </Button>
            );
          })}
        </div>
      </section>

      {/* Content Section */}
      <section className="mt-12">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">
              What Makes a City Affordable?
            </h2>
            <div className="prose prose-sm text-muted-foreground max-w-none space-y-3">
              <p>
                Cost of living comparisons go beyond just rent prices. A truly
                affordable city needs to balance housing costs, local wages,
                state and local taxes, transportation infrastructure, healthcare
                access, and daily expenses like groceries and utilities.
              </p>
              <p>
                Our affordability rankings use a composite cost of living index
                benchmarked to the national average (100). Cities scoring below
                90 offer meaningfully more purchasing power than typical
                American cities, while scores above 120 indicate significantly
                higher living costs.
              </p>
              <p>
                The South and Midwest consistently rank as the most affordable
                regions, with cities like Memphis, Detroit, St. Louis, Wichita,
                and Oklahoma City offering exceptional value. The West Coast and
                Northeast tend to be the most expensive, with San Francisco, San
                Jose, and New York City leading in costs.
              </p>
              <p>
                <strong>Key factors to consider:</strong> State income taxes can
                dramatically impact take-home pay. Texas, Florida, Washington,
                Tennessee, and Nevada have no state income tax — a significant
                advantage that pure cost index numbers don&apos;t fully capture.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* FAQ Section */}
      <FAQSection
        title="Affordable Cities FAQ"
        subtitle="Common questions about finding the cheapest places to live in America."
        items={[
          {
            question: "What are the cheapest cities to live in the US in 2026?",
            answer:
              "Based on the Bureau of Economic Analysis Regional Price Parities, the cheapest major US cities include Oklahoma City (index ~88), Memphis (index ~87), Wichita (index ~87), El Paso (index ~88), and Pittsburgh (index ~91). These cities offer housing costs 25–40% below the national average while still providing strong job markets.",
          },
          {
            question:
              "What is the average cost of living in Arizona for a single person?",
            answer:
              "The average cost of living in Arizona varies by city. Phoenix sits close to the national average (index ~100), while Tucson is about 5–8% below average. A single person in Arizona can expect to spend $2,500–$3,500 per month on rent, food, utilities, and transportation. Arizona also benefits from a relatively low state income tax and affordable housing compared to coastal states.",
          },
          {
            question: "How much does it cost to live in Las Vegas?",
            answer:
              "The cost of living in Las Vegas is near the national average with a cost index around 100. Monthly costs for a single person average $2,800–$3,500 including rent. A major advantage is Nevada's zero state income tax. Average cost of living in Las Vegas is significantly lower than nearby California cities like Los Angeles or San Francisco.",
          },
          {
            question: "Which states have no income tax?",
            answer:
              "Nine states have no income tax on wages: Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington, and Wyoming. Major cities like Houston, Dallas, Miami, Nashville, Las Vegas, and Seattle all benefit from zero state income tax — making them popular destinations for people looking to maximize take-home pay.",
          },
          {
            question: "What are the cheapest states to retire in?",
            answer:
              "The cheapest states to retire in include Texas, Oklahoma, Tennessee, Arkansas, Mississippi, and Kansas — offering low cost of living indices, no or low state income tax, and affordable housing. Cities like Wichita, Memphis, Oklahoma City, and San Antonio are popular retirement destinations combining low costs with good healthcare access.",
          },
          {
            question: "Is Montana an affordable place to live?",
            answer:
              "Montana's cost of living varies significantly. Rural areas are affordable (10–15% below national average) but cities like Bozeman and Missoula have seen rapid price increases due to remote workers relocating. Montana has no state sales tax, which helps offset costs. The Montana cost of living overall is slightly below the national average but rising.",
          },
          {
            question:
              "How do housing costs vary between cheap and expensive cities?",
            answer:
              "Housing shows the widest variation in cost of living. A 2-bedroom apartment in San Francisco averages $2,682/month (HUD FMR), while the same in Wichita costs $948/month — a 64% savings. Median home values range from under $180,000 in affordable cities to over $1.3 million in San Jose.",
          },
        ]}
      />
    </div>
  );
}
