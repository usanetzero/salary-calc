"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeftRight,
  Home,
  DollarSign,
  Zap,
  Car,
  Utensils,
  Activity,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart2,
  Users,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { CitySelect } from "@/components/CitySelect";
import { FAQSection } from "@/components/FAQSection";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { City } from "@/lib/types";
import {
  formatCurrency,
  costIndexLabel,
  costIndexBg,
  costIndexColor,
} from "@/lib/utils";

interface ComparisonData {
  cityA: City;
  cityB: City;
  salaryMultiplier: number;
  differences: {
    rent: number;
    income: number;
    costIndex: number;
    groceries: number;
    utilities: number;
    transportation: number;
    healthcare: number;
  };
}

function DiffBadge({
  value,
  reverse = false,
}: {
  value: number;
  reverse?: boolean;
}) {
  const positive = reverse ? value < 0 : value > 0;
  if (Math.abs(value) < 0.5)
    return <span className="text-xs text-muted-foreground">~equal</span>;
  return (
    <span
      className={`text-xs font-medium ${positive ? "text-orange-600 dark:text-orange-400" : "text-green-600 dark:text-green-400"}`}
    >
      {value > 0 ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

export default function ComparePageClient({
  initialComparison,
  initialAllCities = [],
}: {
  initialComparison?: ComparisonData;
  initialAllCities?: City[];
}) {
  const params = useParams<{ slugA: string; slugB: string }>();
  const slugA = params.slugA ?? initialComparison?.cityA?.slug ?? "";
  const slugB = params.slugB ?? initialComparison?.cityB?.slug ?? "";
  const router = useRouter();
  const [salary, setSalary] = useState(80000);
  const [customA, setCustomA] = useState(slugA || "");
  const [customB, setCustomB] = useState(slugB || "");

  const {
    data: comparison,
    isLoading,
    isError,
  } = useQuery<ComparisonData>({
    queryKey: ["/api/compare", slugA, slugB],
    queryFn: async () => {
      const res = await fetch(`/api/compare/${slugA}/${slugB}`);
      if (!res.ok) throw new Error("Comparison failed");
      return res.json();
    },
    enabled: !!slugA && !!slugB,
    initialData: initialComparison,
  });

  const { data: allCities } = useQuery<City[]>({
    queryKey: ["/api/cities"],
    initialData: initialAllCities.length > 0 ? initialAllCities : undefined,
  });

  const handleCompare = () => {
    if (customA && customB && customA !== customB) {
      router.push(`/compare/${customA}/vs/${customB}`);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-10 w-80" />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (isError || !comparison) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Comparison Not Available</h1>
        <p className="text-muted-foreground mb-6">
          One or both cities could not be found.
        </p>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }

  const { cityA, cityB, differences } = comparison;
  const adjustedSalaryB = salary * comparison.salaryMultiplier;
  const salaryDiff = adjustedSalaryB - salary;

  const categoryRows = [
    {
      label: "Overall Cost Index",
      valueA: cityA.costIndex,
      valueB: cityB.costIndex,
      diff: differences.costIndex,
      icon: BarChart2,
      lower: true,
    },
    {
      label: "Median Rent",
      valueA: cityA.medianRent,
      valueB: cityB.medianRent,
      diff: differences.rent,
      icon: Home,
      lower: true,
      currency: true,
    },
    {
      label: "Median Income",
      valueA: cityA.medianIncome,
      valueB: cityB.medianIncome,
      diff: differences.income,
      icon: DollarSign,
      lower: false,
      currency: true,
    },
    {
      label: "Grocery Index",
      valueA: cityA.groceryIndex,
      valueB: cityB.groceryIndex,
      diff: differences.groceries,
      icon: Utensils,
      lower: true,
    },
    {
      label: "Utilities Index",
      valueA: cityA.utilitiesIndex,
      valueB: cityB.utilitiesIndex,
      diff: differences.utilities,
      icon: Zap,
      lower: true,
    },
    {
      label: "Transportation",
      valueA: cityA.transportationIndex,
      valueB: cityB.transportationIndex,
      diff: differences.transportation,
      icon: Car,
      lower: true,
    },
    {
      label: "Healthcare",
      valueA: cityA.healthcareIndex,
      valueB: cityB.healthcareIndex,
      diff: differences.healthcare,
      icon: Activity,
      lower: true,
    },
    {
      label: "State Tax Rate",
      valueA: cityA.taxRate,
      valueB: cityB.taxRate,
      diff:
        ((cityB.taxRate - cityA.taxRate) / Math.max(cityA.taxRate, 0.01)) * 100,
      icon: Percent,
      lower: true,
    },
  ];

  const chartData = [
    {
      name: "Cost Index",
      [cityA.name]: cityA.costIndex,
      [cityB.name]: cityB.costIndex,
    },
    {
      name: "Groceries",
      [cityA.name]: cityA.groceryIndex,
      [cityB.name]: cityB.groceryIndex,
    },
    {
      name: "Utilities",
      [cityA.name]: cityA.utilitiesIndex,
      [cityB.name]: cityB.utilitiesIndex,
    },
    {
      name: "Transport",
      [cityA.name]: cityA.transportationIndex,
      [cityB.name]: cityB.transportationIndex,
    },
    {
      name: "Healthcare",
      [cityA.name]: cityA.healthcareIndex,
      [cityB.name]: cityB.healthcareIndex,
    },
  ];

  const cityAWins = categoryRows.filter((r) =>
    r.lower ? r.valueA < r.valueB : r.valueA > r.valueB,
  ).length;
  const cityBWins = categoryRows.filter((r) =>
    r.lower ? r.valueB < r.valueA : r.valueB > r.valueA,
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/">
          <span className="cursor-pointer hover-elevate rounded-sm">Home</span>
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">
          {cityA.name} vs {cityB.name}
        </span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          {cityA.name} vs {cityB.name}: Cost of Living Comparison
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Compare cost of living between {cityA.name}, {cityA.stateCode} and{" "}
          {cityB.name}, {cityB.stateCode}. Side-by-side breakdown of housing
          costs, rent, groceries, utilities, transportation, healthcare, state
          taxes, and salary equivalents.
        </p>
      </div>

      {/* City Selector */}
      <Card className="mb-8">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[180px]">
              <label className="text-sm font-medium mb-1.5 block">City A</label>
              <CitySelect
                cities={allCities || []}
                value={customA}
                onChange={setCustomA}
                placeholder="Select city..."
                data-testid="compare-city-a"
              />
            </div>
            <div className="flex items-center pb-0.5">
              <span className="text-muted-foreground font-medium px-2">vs</span>
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="text-sm font-medium mb-1.5 block">City B</label>
              <CitySelect
                cities={allCities || []}
                value={customB}
                onChange={setCustomB}
                placeholder="Select city..."
                data-testid="compare-city-b"
              />
            </div>
            <Button
              onClick={handleCompare}
              disabled={!customA || !customB || customA === customB}
              className="gap-2"
            >
              <ArrowLeftRight className="w-4 h-4" /> Compare
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Headline Comparison */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          { city: cityA, wins: cityAWins, label: "City A" },
          { city: cityB, wins: cityBWins, label: "City B" },
        ].map(({ city, wins, label }) => (
          <Card
            key={city.slug}
            className={
              wins > (city === cityA ? cityBWins : cityAWins)
                ? "border-primary"
                : ""
            }
          >
            <CardContent className="p-5">
              <div className="text-xs text-muted-foreground mb-1">{label}</div>
              <h2 className="text-xl font-bold">{city.name}</h2>
              <p className="text-sm text-muted-foreground mb-3">{city.state}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Cost Index</span>
                  <span
                    className={`font-bold text-lg ${costIndexColor(city.costIndex)}`}
                  >
                    {city.costIndex.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Median Rent</span>
                  <span className="font-medium">
                    {formatCurrency(city.medianRent)}/mo
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Median Income</span>
                  <span className="font-medium">
                    {formatCurrency(city.medianIncome, { compact: true })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">State Tax</span>
                  <span className="font-medium">
                    {city.taxRate === 0 ? "None" : `${city.taxRate}%`}
                  </span>
                </div>
              </div>
              <Badge className={`mt-3 ${costIndexBg(city.costIndex)}`}>
                {costIndexLabel(city.costIndex)}
              </Badge>
              {wins > (city.slug === cityA.slug ? cityBWins : cityAWins) && (
                <div className="mt-2 text-xs text-primary font-medium flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Better value overall
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Salary Equivalent */}
      <Card className="mb-8 border-primary/30 bg-primary/5 dark:bg-primary/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            Salary Equivalency Calculator
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            How much would you need in {cityB.name} to match your lifestyle in{" "}
            {cityA.name}?
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">
                Salary in {cityA.name}
              </label>
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
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-md bg-background border border-border">
              <div className="text-xs text-muted-foreground mb-1">
                {cityA.name}
              </div>
              <div className="text-2xl font-bold">{formatCurrency(salary)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Cost Index: {cityA.costIndex.toFixed(1)}
              </div>
            </div>
            <div className="text-center p-4 rounded-md bg-background border border-border">
              <div className="text-xs text-muted-foreground mb-1">
                {cityB.name}
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(adjustedSalaryB)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Cost Index: {cityB.costIndex.toFixed(1)}
              </div>
            </div>
          </div>

          <div className="text-center">
            <span className="text-sm text-muted-foreground">
              You need{" "}
              <span
                className={`font-semibold ${salaryDiff > 0 ? "text-orange-600 dark:text-orange-400" : "text-green-600 dark:text-green-400"}`}
              >
                {salaryDiff > 0 ? "+" : ""}
                {formatCurrency(Math.abs(salaryDiff))}{" "}
                {salaryDiff > 0 ? "more" : "less"}
              </span>{" "}
              in {cityB.name} to maintain the same lifestyle.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Category Comparison */}
      <Card className="mb-8">
        <CardHeader className="pb-4">
          <CardTitle>Category-by-Category Breakdown</CardTitle>
          <p className="text-xs text-muted-foreground">
            Index scores where 100 = national average. Green highlights the city
            with the advantage.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {categoryRows.map((row) => {
            const aWins = row.lower
              ? row.valueA < row.valueB
              : row.valueA > row.valueB;
            const bWins = row.lower
              ? row.valueB < row.valueA
              : row.valueB > row.valueA;
            const maxVal = Math.max(row.valueA, row.valueB, 1);
            return (
              <div
                key={row.label}
                className="rounded-lg border border-border p-4 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                    <row.icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold">{row.label}</span>
                  <span className="ml-auto">
                    <DiffBadge value={row.diff} reverse={!row.lower} />
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-muted-foreground">
                        {cityA.name}
                      </span>
                      <span
                        className={`text-sm font-bold ${aWins ? "text-green-600 dark:text-green-400" : ""}`}
                      >
                        {row.currency
                          ? formatCurrency(row.valueA, { compact: true })
                          : row.label === "State Tax Rate"
                            ? row.valueA === 0
                              ? "None"
                              : `${row.valueA.toFixed(2)}%`
                            : row.valueA.toFixed(1)}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${aWins ? "bg-green-500" : "bg-muted-foreground/30"}`}
                        style={{
                          width: `${row.currency ? (row.valueA / maxVal) * 100 : (row.valueA / Math.max(maxVal, 200)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-muted-foreground">
                        {cityB.name}
                      </span>
                      <span
                        className={`text-sm font-bold ${bWins ? "text-green-600 dark:text-green-400" : ""}`}
                      >
                        {row.currency
                          ? formatCurrency(row.valueB, { compact: true })
                          : row.label === "State Tax Rate"
                            ? row.valueB === 0
                              ? "None"
                              : `${row.valueB.toFixed(2)}%`
                            : row.valueB.toFixed(1)}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${bWins ? "bg-green-500" : "bg-muted-foreground/30"}`}
                        style={{
                          width: `${row.currency ? (row.valueB / maxVal) * 100 : (row.valueB / Math.max(maxVal, 200)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Bar Chart */}
      <Card className="mb-8">
        <CardHeader className="pb-4">
          <CardTitle>Side-by-Side Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey={cityA.name}
                  fill="hsl(var(--chart-1))"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey={cityB.name}
                  fill="hsl(var(--chart-2))"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Pros & Cons */}
      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        {[
          { city: cityA, rival: cityB },
          { city: cityB, rival: cityA },
        ].map(({ city, rival }) => {
          const pros: string[] = [];
          const cons: string[] = [];
          if (city.costIndex < rival.costIndex)
            pros.push(
              `${Math.abs(differences.costIndex).toFixed(0)}% lower overall cost of living`,
            );
          else
            cons.push(
              `${Math.abs(differences.costIndex).toFixed(0)}% higher overall cost of living`,
            );
          if (city.medianRent < rival.medianRent)
            pros.push(
              `Lower rent — ${formatCurrency(city.medianRent)}/mo vs ${formatCurrency(rival.medianRent)}/mo`,
            );
          else
            cons.push(
              `Higher rent — ${formatCurrency(city.medianRent)}/mo vs ${formatCurrency(rival.medianRent)}/mo`,
            );
          if (city.medianIncome > rival.medianIncome)
            pros.push(
              `Higher median income (${formatCurrency(city.medianIncome, { compact: true })})`,
            );
          if (city.taxRate < rival.taxRate)
            pros.push(
              `Lower state income tax (${city.taxRate === 0 ? "none" : city.taxRate + "%"})`,
            );
          else if (city.taxRate > rival.taxRate)
            cons.push(`Higher state income tax (${city.taxRate}%)`);
          if (city.groceryIndex < rival.groceryIndex)
            pros.push("Lower grocery costs");
          if (city.unemploymentRate < rival.unemploymentRate)
            pros.push(`Lower unemployment (${city.unemploymentRate}%)`);
          return (
            <Card key={city.slug}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {city.name}: Pros & Cons
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  {pros.map((p) => (
                    <div key={p} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
                {cons.length > 0 && (
                  <div className="space-y-1.5">
                    {cons.map((c) => (
                      <div key={c} className="flex items-start gap-2 text-sm">
                        <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{c}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ */}
      <FAQSection
        title={`${cityA.name} vs ${cityB.name} – FAQ`}
        subtitle={`Common questions about comparing cost of living between ${cityA.name} and ${cityB.name}.`}
        items={[
          {
            question: `Is ${cityA.name} more expensive than ${cityB.name}?`,
            answer: `${cityA.name} has a cost of living index of ${cityA.costIndex.toFixed(1)}, while ${cityB.name} scores ${cityB.costIndex.toFixed(1)}. ${cityA.costIndex > cityB.costIndex ? `${cityA.name} is approximately ${differences.costIndex.toFixed(1)}% more expensive overall.` : `${cityB.name} is approximately ${Math.abs(differences.costIndex).toFixed(1)}% more expensive overall.`} This comparison accounts for housing, groceries, utilities, transportation, healthcare, and taxes.`,
          },
          {
            question: `How does rent compare between ${cityA.name} and ${cityB.name}?`,
            answer: `Median 2-bedroom rent in ${cityA.name} is ${formatCurrency(cityA.medianRent)}/month compared to ${formatCurrency(cityB.medianRent)}/month in ${cityB.name} — a difference of ${Math.abs(differences.rent).toFixed(0)}%. Rent is typically the largest monthly expense, so this significantly impacts overall affordability.`,
          },
          {
            question: `What salary do I need in ${cityB.name} to match my ${cityA.name} income?`,
            answer: `Due to cost of living differences, you would need approximately ${(comparison.salaryMultiplier * 100).toFixed(0)}% of your ${cityA.name} salary to maintain the same standard of living in ${cityB.name}. For example, a $75,000 salary in ${cityA.name} would need to be about ${formatCurrency(75000 * comparison.salaryMultiplier)} in ${cityB.name}. Use the salary slider above to calculate your specific equivalent.`,
          },
          {
            question: "How is the cost of living index calculated?",
            answer:
              "The cost of living index is calculated using data from the Bureau of Economic Analysis (Regional Price Parities), US Census Bureau (median incomes and home values), HUD (Fair Market Rents), and Bureau of Labor Statistics (consumer price data). A score of 100 represents the national average. Scores above 100 indicate higher-than-average costs, while scores below 100 are more affordable.",
          },
          {
            question: `Which city has better job opportunities — ${cityA.name} or ${cityB.name}?`,
            answer: `${cityA.name} has a median household income of ${formatCurrency(cityA.medianIncome)} with an unemployment rate of ${cityA.unemploymentRate}%. ${cityB.name} has a median household income of ${formatCurrency(cityB.medianIncome)} with an unemployment rate of ${cityB.unemploymentRate}%. While income is higher in ${cityA.medianIncome > cityB.medianIncome ? cityA.name : cityB.name}, remember to factor in cost of living when comparing real purchasing power.`,
          },
          {
            question:
              "What factors should I consider when relocating between cities?",
            answer:
              "Beyond cost of living, consider: (1) state income tax differences — some states have no income tax; (2) housing market trends and whether to rent or buy; (3) job market strength in your industry; (4) healthcare costs and access; (5) climate and lifestyle preferences; (6) commute times and transportation options; and (7) proximity to family. Our comparison tool covers the financial factors, but quality of life matters too.",
          },
        ]}
      />
    </div>
  );
}
