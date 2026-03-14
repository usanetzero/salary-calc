"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  Home,
  DollarSign,
  Zap,
  Car,
  Utensils,
  Activity,
  TrendingUp,
  ChevronRight,
  BarChart2,
  Users,
  Percent,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import type { City } from "@/lib/types";
import {
  formatCurrency,
  formatNumber,
  costIndexLabel,
  costIndexBg,
  costIndexColor,
} from "@/lib/utils";

const NEARBY_CITY_SLUGS: Record<string, string[]> = {
  "new-york-ny": [
    "boston-ma",
    "baltimore-md",
    "washington-dc",
    "pittsburgh-pa",
  ],
  "los-angeles-ca": [
    "san-diego-ca",
    "san-francisco-ca",
    "las-vegas-nv",
    "phoenix-az",
  ],
  "chicago-il": [
    "milwaukee-wi",
    "indianapolis-in",
    "detroit-mi",
    "st-louis-mo",
  ],
  "houston-tx": ["dallas-tx", "san-antonio-tx", "austin-tx", "new-orleans-la"],
  "phoenix-az": ["tucson-az", "las-vegas-nv", "albuquerque-nm", "denver-co"],
  "san-antonio-tx": ["houston-tx", "dallas-tx", "austin-tx", "el-paso-tx"],
  "san-diego-ca": [
    "los-angeles-ca",
    "las-vegas-nv",
    "phoenix-az",
    "san-jose-ca",
  ],
  "dallas-tx": ["fort-worth-tx", "houston-tx", "austin-tx", "oklahoma-city-ok"],
  "san-jose-ca": [
    "san-francisco-ca",
    "sacramento-ca",
    "los-angeles-ca",
    "seattle-wa",
  ],
  "austin-tx": ["dallas-tx", "houston-tx", "san-antonio-tx", "nashville-tn"],
  "seattle-wa": [
    "portland-or",
    "denver-co",
    "san-francisco-ca",
    "los-angeles-ca",
  ],
  "denver-co": [
    "colorado-springs-co",
    "salt-lake-city-ut",
    "albuquerque-nm",
    "austin-tx",
  ],
  "miami-fl": ["tampa-fl", "orlando-fl", "jacksonville-fl", "nashville-tn"],
  "nashville-tn": ["memphis-tn", "atlanta-ga", "charlotte-nc", "louisville-ky"],
  "atlanta-ga": ["charlotte-nc", "raleigh-nc", "nashville-tn", "orlando-fl"],
};

function MetricBar({
  value,
  max = 200,
  label,
}: {
  value: number;
  max?: number;
  label?: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  const color =
    value < 90
      ? "#10b981"
      : value < 110
        ? "#f59e0b"
        : value < 140
          ? "#f97316"
          : "#ef4444";
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>{label}</span>
        <span>{value.toFixed(1)}</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function CityPageClient() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [salary, setSalary] = useState(75000);
  const [compareSlug, setCompareSlug] = useState("");

  const {
    data: city,
    isLoading,
    isError,
  } = useQuery<City>({
    queryKey: ["/api/cities", slug],
    queryFn: async () => {
      const res = await fetch(`/api/cities/${slug}`);
      if (!res.ok) throw new Error("City not found");
      return res.json();
    },
    enabled: !!slug,
  });

  const { data: allCities } = useQuery<City[]>({
    queryKey: ["/api/cities"],
  });

  const nearbySlugs = NEARBY_CITY_SLUGS[slug || ""] || [];
  const nearbyCities =
    allCities
      ?.filter(
        (c) => nearbySlugs.includes(c.slug) || c.stateCode === city?.stateCode,
      )
      .slice(0, 4) || [];

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !city) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">City Not Found</h1>
        <p className="text-muted-foreground mb-6">
          We couldn&apos;t find data for this city.
        </p>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }

  const netIncome = city.medianIncome * (1 - city.taxRate / 100);
  const rentBurden = ((city.medianRent * 12) / city.medianIncome) * 100;
  const adjustedSalary =
    compareSlug && allCities
      ? salary *
        ((allCities.find((c) => c.slug === compareSlug)?.costIndex || 100) /
          city.costIndex)
      : null;
  const compareCityData = allCities?.find((c) => c.slug === compareSlug);

  const radarData = [
    { subject: "Housing", value: city.medianRent / 35 },
    { subject: "Groceries", value: city.groceryIndex },
    { subject: "Utilities", value: city.utilitiesIndex },
    { subject: "Transport", value: city.transportationIndex },
    { subject: "Healthcare", value: city.healthcareIndex },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/">
          <span className="cursor-pointer hover-elevate rounded-sm">Home</span>
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/cheapest-cities">
          <span className="cursor-pointer hover-elevate rounded-sm">
            Cities
          </span>
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">{city.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold leading-tight">{city.name}</h1>
              <p className="text-muted-foreground">
                {city.state} · Population: {formatNumber(city.population)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={`text-sm px-3 py-1 ${costIndexBg(city.costIndex)}`}>
            {costIndexLabel(city.costIndex)}
          </Badge>
          <Link
            href={`/compare/${city.slug}/vs/${nearbyCities[0]?.slug || "dallas-tx"}`}
          >
            <Button variant="outline" size="sm" className="gap-1.5">
              <BarChart2 className="w-3.5 h-3.5" /> Compare
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Cost Index",
            value: city.costIndex.toFixed(1),
            icon: BarChart2,
            sub: "100 = US avg",
            color: costIndexColor(city.costIndex),
          },
          {
            label: "Median Income",
            value: formatCurrency(city.medianIncome, { compact: true }),
            icon: DollarSign,
            sub: "Annual household",
          },
          {
            label: "Median Rent",
            value: `${formatCurrency(city.medianRent)}/mo`,
            icon: Home,
            sub: "2-bedroom unit",
          },
          {
            label: "Rent Burden",
            value: `${rentBurden.toFixed(0)}%`,
            icon: Percent,
            sub: "Income to rent ratio",
          },
        ].map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <metric.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {metric.label}
                </span>
              </div>
              <div className={`text-xl font-bold ${metric.color || ""}`}>
                {metric.value}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {metric.sub}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Cost Breakdown */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">
                Cost Category Breakdown
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Indexed to national average (100)
              </p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="bars">
                <TabsList className="mb-4">
                  <TabsTrigger value="bars">Bar Chart</TabsTrigger>
                  <TabsTrigger value="radar">Radar</TabsTrigger>
                </TabsList>
                <TabsContent value="bars">
                  <div className="space-y-3">
                    <MetricBar label="Housing" value={city.medianRent / 17} />
                    <MetricBar label="Groceries" value={city.groceryIndex} />
                    <MetricBar label="Utilities" value={city.utilitiesIndex} />
                    <MetricBar
                      label="Transportation"
                      value={city.transportationIndex}
                    />
                    <MetricBar
                      label="Healthcare"
                      value={city.healthcareIndex}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="radar">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis
                          dataKey="subject"
                          tick={{
                            fill: "hsl(var(--muted-foreground))",
                            fontSize: 11,
                          }}
                        />
                        <Radar
                          dataKey="value"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.3}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Economic Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  label: "Median Home Value",
                  value: formatCurrency(city.medianHomeValue, {
                    compact: true,
                  }),
                  icon: Home,
                },
                {
                  label: "State Income Tax",
                  value: city.taxRate === 0 ? "None" : `${city.taxRate}%`,
                  icon: Percent,
                },
                {
                  label: "Unemployment Rate",
                  value: `${city.unemploymentRate}%`,
                  icon: Users,
                },
                {
                  label: "Est. Net Income",
                  value: formatCurrency(netIncome, { compact: true }) + "/yr",
                  icon: DollarSign,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <item.icon className="w-3 h-3" /> {item.label}
                  </span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Affordability Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-2">
                <div
                  className={`text-4xl font-bold mb-1 ${costIndexColor(city.costIndex)}`}
                >
                  {Math.round(100 - (city.costIndex - 100) * 0.5)
                    .toString()
                    .padStart(2, "0")}
                </div>
                <div className="text-sm text-muted-foreground">out of 100</div>
                <div className="text-xs text-muted-foreground mt-2">
                  {city.costIndex < 100
                    ? "Below national average cost"
                    : "Above national average cost"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Salary Converter */}
      <Card className="mb-8">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            Salary Converter for {city.name}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            See what salary you&apos;d need in another city to match your
            purchasing power in {city.name}.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">
                Salary in {city.name}
              </label>
              <span className="text-xl font-bold text-primary">
                {formatCurrency(salary)}
              </span>
            </div>
            <Slider
              value={[salary]}
              onValueChange={([v]) => setSalary(v)}
              min={20000}
              max={300000}
              step={5000}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Compare to City
            </label>
            <Select value={compareSlug} onValueChange={setCompareSlug}>
              <SelectTrigger>
                <SelectValue placeholder="Select a city to compare..." />
              </SelectTrigger>
              <SelectContent>
                {allCities
                  ?.filter((c) => c.slug !== slug)
                  .map((c) => (
                    <SelectItem key={c.slug} value={c.slug}>
                      {c.name}, {c.stateCode}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {adjustedSalary !== null && compareCityData && (
            <div className="rounded-md bg-accent p-4 grid sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  {city.name}
                </div>
                <div className="text-xl font-bold">
                  {formatCurrency(salary)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Cost Index: {city.costIndex.toFixed(1)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  {compareCityData.name}
                </div>
                <div className="text-xl font-bold">
                  {formatCurrency(adjustedSalary)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Cost Index: {compareCityData.costIndex.toFixed(1)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* City Description */}
      {city.description && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="font-semibold mb-2">About {city.name}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {city.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Nearby Cities */}
      {nearbyCities.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Compare Nearby Cities</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {nearbyCities.map((nearCity) => (
              <Link
                key={nearCity.slug}
                href={`/compare/${city.slug}/vs/${nearCity.slug}`}
              >
                <Card className="cursor-pointer hover-elevate">
                  <CardContent className="p-4 text-center">
                    <div className="font-medium text-sm mb-1">
                      {nearCity.name}
                    </div>
                    <div
                      className={`text-lg font-bold ${costIndexColor(nearCity.costIndex)}`}
                    >
                      {nearCity.costIndex.toFixed(0)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Cost Index
                    </div>
                    <Badge
                      className={`mt-2 text-xs ${costIndexBg(nearCity.costIndex)}`}
                    >
                      {costIndexLabel(nearCity.costIndex)}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="mt-8">
        <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: `Is ${city.name} expensive?`,
              a: `${city.name} has a cost of living index of ${city.costIndex.toFixed(1)}, where 100 represents the national average. ${city.costIndex > 110 ? `This makes ${city.name} more expensive than most US cities.` : city.costIndex < 90 ? `This makes ${city.name} more affordable than most US cities.` : `This is close to the national average.`}`,
            },
            {
              q: `What salary do you need to live comfortably in ${city.name}?`,
              a: `Based on a rent-to-income ratio of 30%, you'd need at least ${formatCurrency((city.medianRent * 12) / 0.3)} to afford the median 2-bedroom apartment in ${city.name} and maintain basic expenses.`,
            },
            {
              q: `What is the median rent in ${city.name}?`,
              a: `The median 2-bedroom rent in ${city.name} is ${formatCurrency(city.medianRent)} per month, according to HUD Fair Market Rent data.`,
            },
          ].map((faq) => (
            <Card key={faq.q}>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
