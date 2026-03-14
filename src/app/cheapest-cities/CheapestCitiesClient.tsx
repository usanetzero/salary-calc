"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingDown, MapPin, ChevronRight, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { City } from "@/lib/types";
import { FAQSection } from "@/components/FAQSection";
import { formatCurrency, costIndexLabel, costIndexBg, costIndexColor } from "@/lib/utils";

const US_STATES = [
  { code: "all", name: "All States" },
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" }, { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" }, { code: "GA", name: "Georgia" },
  { code: "ID", name: "Idaho" }, { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" }, { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" }, { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" }, { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" }, { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" }, { code: "NC", name: "North Carolina" },
  { code: "OH", name: "Ohio" }, { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" },
  { code: "SC", name: "South Carolina" }, { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" },
  { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" },
  { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" },
  { code: "DC", name: "Washington DC" },
];

type SortBy = "costIndex" | "medianRent" | "medianIncome" | "name";

export default function CheapestCitiesClient() {
  const searchParams = useSearchParams();
  const initialState = searchParams.get("state") || "all";

  const [selectedState, setSelectedState] = useState(initialState);
  const [sortBy, setSortBy] = useState<SortBy>("costIndex");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: cities, isLoading } = useQuery<City[]>({
    queryKey: ["/api/cities"],
  });

  const filteredCities = cities
    ? cities
        .filter((c) => {
          const matchesState = selectedState === "all" || c.stateCode === selectedState;
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

  const selectedStateName = US_STATES.find((s) => s.code === selectedState)?.name || "All States";
  const pageTitle =
    selectedState === "all"
      ? "Cheapest Cities to Live in the US"
      : `Cheapest Cities in ${selectedStateName}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
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
          Affordability Rankings
        </div>
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
          {pageTitle}
        </h1>
        <p className="text-muted-foreground">
          Ranked by cost of living index (100 = national average). Lower is more affordable. Data sourced from Census
          Bureau, BEA, and HUD.
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Filter by State</label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger data-testid="select-state-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((state) => (
                    <SelectItem key={state.code} value={state.code}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[160px]">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Sort By</label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
                <SelectTrigger data-testid="select-sort-by">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="costIndex">Cost Index (Low to High)</SelectItem>
                  <SelectItem value="medianRent">Median Rent (Low to High)</SelectItem>
                  <SelectItem value="medianIncome">Median Income (High to Low)</SelectItem>
                  <SelectItem value="name">City Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[180px]">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Search</label>
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
        <p className="text-sm text-muted-foreground" data-testid="text-results-count">
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
            <p className="text-muted-foreground">No cities found matching your criteria.</p>
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
        <div className="space-y-2">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-[auto,1fr,auto,auto,auto,auto] gap-3 px-4 py-2 text-xs font-medium text-muted-foreground">
            <span className="w-8">#</span>
            <span>City</span>
            <span className="w-24 text-right">Cost Index</span>
            <span className="w-28 text-right">Median Rent</span>
            <span className="w-28 text-right">Median Income</span>
            <span className="w-16"></span>
          </div>

          {filteredCities.map((city, idx) => (
            <Link key={city.slug} href={`/cost-of-living/${city.slug}`}>
              <Card className="cursor-pointer hover-elevate" data-testid={`row-city-${city.slug}`}>
                <CardContent className="p-0">
                  {/* Desktop Row */}
                  <div className="hidden md:grid grid-cols-[auto,1fr,auto,auto,auto,auto] gap-3 px-4 py-3 items-center">
                    <span className="w-8 text-sm font-bold text-muted-foreground">{idx + 1}</span>
                    <div>
                      <div className="font-semibold text-sm">{city.name}</div>
                      <div className="text-xs text-muted-foreground">{city.state}</div>
                    </div>
                    <div className="w-24 text-right">
                      <div className={`font-bold text-sm ${costIndexColor(city.costIndex)}`}>
                        {city.costIndex.toFixed(1)}
                      </div>
                      <Badge className={`text-xs ${costIndexBg(city.costIndex)}`}>
                        {costIndexLabel(city.costIndex)}
                      </Badge>
                    </div>
                    <div className="w-28 text-right text-sm">
                      <div className="font-medium">{formatCurrency(city.medianRent)}/mo</div>
                    </div>
                    <div className="w-28 text-right text-sm">
                      <div className="font-medium">{formatCurrency(city.medianIncome, { compact: true })}</div>
                    </div>
                    <div className="w-16 flex justify-end">
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Mobile Card */}
                  <div className="md:hidden p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground w-6">#{idx + 1}</span>
                        <div>
                          <div className="font-semibold text-sm">{city.name}</div>
                          <div className="text-xs text-muted-foreground">{city.state}</div>
                        </div>
                      </div>
                      <Badge className={`text-xs shrink-0 ${costIndexBg(city.costIndex)}`}>
                        {costIndexLabel(city.costIndex)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground block">Index</span>
                        <span className={`font-bold ${costIndexColor(city.costIndex)}`}>
                          {city.costIndex.toFixed(1)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Rent</span>
                        <span className="font-medium">{formatCurrency(city.medianRent)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Income</span>
                        <span className="font-medium">{formatCurrency(city.medianIncome, { compact: true })}</span>
                      </div>
                    </div>
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
          {["TX", "FL", "TN", "NC", "IN", "OH", "MO", "GA", "AZ", "NV", "CO", "WA", "OR"].map((code) => {
            const stateName = US_STATES.find((s) => s.code === code)?.name || code;
            return (
              <Button
                key={code}
                variant="outline"
                size="sm"
                onClick={() => setSelectedState(code)}
                className={selectedState === code ? "border-primary text-primary" : ""}
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
            <h2 className="text-xl font-bold mb-4">What Makes a City Affordable?</h2>
            <div className="prose prose-sm text-muted-foreground max-w-none space-y-3">
              <p>
                Cost of living comparisons go beyond just rent prices. A truly affordable city needs to balance housing
                costs, local wages, state and local taxes, transportation infrastructure, healthcare access, and daily
                expenses like groceries and utilities.
              </p>
              <p>
                Our affordability rankings use a composite cost of living index benchmarked to the national average
                (100). Cities scoring below 90 offer meaningfully more purchasing power than typical American cities,
                while scores above 120 indicate significantly higher living costs.
              </p>
              <p>
                The South and Midwest consistently rank as the most affordable regions, with cities like Memphis,
                Detroit, St. Louis, Wichita, and Oklahoma City offering exceptional value. The West Coast and Northeast
                tend to be the most expensive, with San Francisco, San Jose, and New York City leading in costs.
              </p>
              <p>
                <strong>Key factors to consider:</strong> State income taxes can dramatically impact take-home pay.
                Texas, Florida, Washington, Tennessee, and Nevada have no state income tax — a significant advantage
                that pure cost index numbers don&apos;t fully capture.
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
            question: "What are the cheapest cities to live in the US in 2025?",
            answer: "Based on the Bureau of Economic Analysis Regional Price Parities, the cheapest major US cities include Oklahoma City (index ~88), Memphis (index ~87), Wichita (index ~87), El Paso (index ~88), and Pittsburgh (index ~91). These cities offer housing costs 25-40% below the national average while still providing strong job markets.",
          },
          {
            question: "Which states have no income tax?",
            answer: "Nine states have no income tax on wages: Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington, and Wyoming. Among major cities, this means Houston, Dallas, Austin, San Antonio, and El Paso (Texas), Miami, Tampa, Jacksonville, and Orlando (Florida), Seattle (Washington), Nashville and Memphis (Tennessee), and Las Vegas (Nevada) all benefit from zero state income tax.",
          },
          {
            question: "Is it better to live in a cheap city with lower salaries?",
            answer: "Often yes. In many affordable cities, the cost savings exceed the salary reduction. For example, a software developer earning $120,000 in San Francisco (cost index ~128) versus $90,000 in Austin (cost index ~101) would have significantly more purchasing power in Austin after accounting for rent, taxes, and daily expenses.",
          },
          {
            question: "How do housing costs vary between cheap and expensive cities?",
            answer: "Housing shows the widest variation. A 2-bedroom apartment in San Francisco averages $2,682/month (HUD FMR), while the same in Wichita costs $948/month — a 64% savings. Median home values range from under $180,000 in affordable cities to over $1.3 million in San Jose.",
          },
          {
            question: "What should I consider beyond cost of living when choosing a city?",
            answer: "Important factors include: job market strength and industry presence for your career, quality of healthcare and education, climate and natural disaster risk, commute times, cultural amenities, proximity to family, and long-term economic growth. A city that's cheap today might not offer the career advancement you need.",
          },
        ]}
      />
    </div>
  );
}
