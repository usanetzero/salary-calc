"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Calculator,
  DollarSign,
  Home,
  Percent,
  TrendingUp,
  ArrowRight,
  Info,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FAQSection } from "@/components/FAQSection";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { City } from "@/lib/types";
import {
  formatCurrency,
  costIndexLabel,
  costIndexBg,
  costIndexColor,
} from "@/lib/utils";

function LifestyleRating({ rentBurden }: { rentBurden: number }) {
  if (rentBurden < 20)
    return {
      label: "Comfortable",
      color: "text-emerald-600 dark:text-emerald-400",
      icon: CheckCircle,
      desc: "Well under the 30% threshold. Excellent financial position.",
    };
  if (rentBurden < 30)
    return {
      label: "Manageable",
      color: "text-green-600 dark:text-green-400",
      icon: CheckCircle,
      desc: "Within the recommended 30% rent-to-income ratio.",
    };
  if (rentBurden < 40)
    return {
      label: "Strained",
      color: "text-yellow-600 dark:text-yellow-400",
      icon: AlertTriangle,
      desc: "Slightly above the 30% threshold. Budget carefully.",
    };
  return {
    label: "Difficult",
    color: "text-red-600 dark:text-red-400",
    icon: AlertTriangle,
    desc: "Significantly above the 30% rent-to-income threshold.",
  };
}

export default function SalaryCalculatorClient({
  initialCities = [],
}: {
  initialCities?: City[];
}) {
  const [salary, setSalary] = useState(80000);
  const [fromCity, setFromCity] = useState("new-york-ny");
  const [toCity, setToCity] = useState("austin-tx");

  const { data: cities, isLoading } = useQuery<City[]>({
    queryKey: ["/api/cities"],
    initialData: initialCities.length > 0 ? initialCities : undefined,
  });

  const fromCityData = cities?.find((c) => c.slug === fromCity);
  const toCityData = cities?.find((c) => c.slug === toCity);

  const adjustedSalary =
    fromCityData && toCityData
      ? salary * (toCityData.costIndex / fromCityData.costIndex)
      : 0;

  const fromNetSalary = fromCityData
    ? salary * (1 - fromCityData.taxRate / 100)
    : 0;
  const toNetSalary = toCityData
    ? adjustedSalary * (1 - toCityData.taxRate / 100)
    : 0;
  const fromRentBurden = fromCityData
    ? ((fromCityData.medianRent * 12) / salary) * 100
    : 0;
  const toRentBurden = toCityData
    ? ((toCityData.medianRent * 12) / adjustedSalary) * 100
    : 0;
  const salaryDiff = adjustedSalary - salary;

  const fromRating = LifestyleRating({ rentBurden: fromRentBurden });
  const toRating = LifestyleRating({ rentBurden: toRentBurden });

  const monthlyBreakdownFrom = fromCityData
    ? {
        rent: fromCityData.medianRent,
        groceries: Math.round(
          (salary / 12) * 0.12 * (fromCityData.groceryIndex / 100),
        ),
        utilities: Math.round(150 * (fromCityData.utilitiesIndex / 100)),
        transport: Math.round(400 * (fromCityData.transportationIndex / 100)),
        healthcare: Math.round(300 * (fromCityData.healthcareIndex / 100)),
      }
    : null;

  const monthlyBreakdownTo = toCityData
    ? {
        rent: toCityData.medianRent,
        groceries: Math.round(
          (adjustedSalary / 12) * 0.12 * (toCityData.groceryIndex / 100),
        ),
        utilities: Math.round(150 * (toCityData.utilitiesIndex / 100)),
        transport: Math.round(400 * (toCityData.transportationIndex / 100)),
        healthcare: Math.round(300 * (toCityData.healthcareIndex / 100)),
      }
    : null;

  const chartData =
    monthlyBreakdownFrom && monthlyBreakdownTo
      ? [
          {
            name: "Rent",
            from: monthlyBreakdownFrom.rent,
            to: monthlyBreakdownTo.rent,
          },
          {
            name: "Groceries",
            from: monthlyBreakdownFrom.groceries,
            to: monthlyBreakdownTo.groceries,
          },
          {
            name: "Utilities",
            from: monthlyBreakdownFrom.utilities,
            to: monthlyBreakdownTo.utilities,
          },
          {
            name: "Transport",
            from: monthlyBreakdownFrom.transport,
            to: monthlyBreakdownTo.transport,
          },
          {
            name: "Healthcare",
            from: monthlyBreakdownFrom.healthcare,
            to: monthlyBreakdownTo.healthcare,
          },
        ]
      : [];

  const totalFromMonthly = monthlyBreakdownFrom
    ? Object.values(monthlyBreakdownFrom).reduce((a, b) => a + b, 0)
    : 0;
  const totalToMonthly = monthlyBreakdownTo
    ? Object.values(monthlyBreakdownTo).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/">
          <span className="cursor-pointer hover-elevate rounded-sm">Home</span>
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">Salary Calculator</span>
      </nav>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-2">
          <Calculator className="w-4 h-4" />
          Salary Comparison Tool
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Cost of Living Salary Calculator
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Compare wages vs cost of living when relocating between US cities.
          Adjusts for housing costs, state income taxes, groceries, utilities,
          and overall purchasing power across 47+ major metros.
        </p>
      </div>

      {/* Main Calculator */}
      <Card className="mb-8">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Enter Your Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">Annual Salary</label>
              <span className="text-3xl font-bold text-primary">
                {formatCurrency(salary)}
              </span>
            </div>
            <Slider
              value={[salary]}
              onValueChange={([v]) => setSalary(v)}
              min={20000}
              max={500000}
              step={5000}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
              <span>$20,000</span>
              <span>$500,000</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Current City
              </label>
              {isLoading ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <Select value={fromCity} onValueChange={setFromCity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cities?.map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>
                        {c.name}, {c.stateCode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Target City
              </label>
              {isLoading ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <Select value={toCity} onValueChange={setToCity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cities?.map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>
                        {c.name}, {c.stateCode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {fromCityData && toCityData && (
        <>
          {/* Result Headline */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <Card className="sm:col-span-2">
              <CardContent className="p-6">
                <div className="text-sm text-muted-foreground mb-1">
                  Equivalent Salary in {toCityData.name}
                </div>
                <div className="text-4xl font-bold mb-2">
                  {formatCurrency(adjustedSalary)}
                </div>
                <div
                  className={`text-sm font-medium ${salaryDiff > 0 ? "text-orange-600 dark:text-orange-400" : "text-green-600 dark:text-green-400"}`}
                >
                  {salaryDiff > 0 ? "You need " : "You save "}
                  <strong>{formatCurrency(Math.abs(salaryDiff))}</strong>
                  {salaryDiff > 0
                    ? " more to maintain your lifestyle"
                    : " compared to your current city"}
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Formula: ${formatCurrency(salary)} × (
                  {toCityData.costIndex.toFixed(1)} ÷{" "}
                  {fromCityData.costIndex.toFixed(1)})
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-muted-foreground mb-1">
                  Multiplier
                </div>
                <div className="text-4xl font-bold mb-1">
                  {(toCityData.costIndex / fromCityData.costIndex).toFixed(2)}x
                </div>
                <div className="text-xs text-muted-foreground">
                  {toCityData.costIndex > fromCityData.costIndex
                    ? `${toCityData.name} is ${((toCityData.costIndex / fromCityData.costIndex - 1) * 100).toFixed(0)}% pricier`
                    : `${toCityData.name} is ${((1 - toCityData.costIndex / fromCityData.costIndex) * 100).toFixed(0)}% cheaper`}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side by Side Breakdown */}
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            {[
              {
                city: fromCityData,
                salary,
                netSalary: fromNetSalary,
                rentBurden: fromRentBurden,
                rating: fromRating,
                label: "Current City",
              },
              {
                city: toCityData,
                salary: adjustedSalary,
                netSalary: toNetSalary,
                rentBurden: toRentBurden,
                rating: toRating,
                label: "Target City",
              },
            ].map(
              ({ city, salary: s, netSalary, rentBurden, rating, label }) => (
                <Card key={city.slug}>
                  <CardHeader className="pb-3">
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <CardTitle className="text-lg">{city.name}</CardTitle>
                    <Badge className={costIndexBg(city.costIndex)}>
                      {costIndexLabel(city.costIndex)}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Gross Salary
                      </span>
                      <span className="font-semibold">{formatCurrency(s)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">State Tax</span>
                      <span className="font-medium">
                        {city.taxRate === 0 ? "None" : `${city.taxRate}%`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Est. Net Income
                      </span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(netSalary)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cost Index</span>
                      <span
                        className={`font-semibold ${costIndexColor(city.costIndex)}`}
                      >
                        {city.costIndex.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Median Rent</span>
                      <span className="font-medium">
                        {formatCurrency(city.medianRent)}/mo
                      </span>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-muted-foreground">
                          Rent Burden
                        </span>
                        <span className={`font-medium ${rating.color}`}>
                          {rentBurden.toFixed(0)}%
                        </span>
                      </div>
                      <Progress
                        value={Math.min(rentBurden, 100)}
                        className="h-2"
                      />
                    </div>
                    <div
                      className={`flex items-start gap-2 text-sm p-3 rounded-md ${rentBurden < 30 ? "bg-green-50 dark:bg-green-950/30" : "bg-yellow-50 dark:bg-yellow-950/30"}`}
                    >
                      <rating.icon
                        className={`w-4 h-4 shrink-0 mt-0.5 ${rating.color}`}
                      />
                      <div>
                        <div className={`font-medium ${rating.color}`}>
                          {rating.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {rating.desc}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ),
            )}
          </div>

          {/* Monthly Budget Chart */}
          {chartData.length > 0 && (
            <Card className="mb-8">
              <CardHeader className="pb-4">
                <CardTitle>Estimated Monthly Expenses</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Estimated based on city cost indices and typical spending
                  patterns
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 5, right: 5, left: -10, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="name"
                        tick={{
                          fill: "hsl(var(--muted-foreground))",
                          fontSize: 11,
                        }}
                      />
                      <YAxis
                        tick={{
                          fill: "hsl(var(--muted-foreground))",
                          fontSize: 11,
                        }}
                        tickFormatter={(v) => `$${v}`}
                      />
                      <Tooltip
                        formatter={(value) => formatCurrency(Number(value))}
                        contentStyle={{
                          background: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                        }}
                      />
                      <Bar
                        dataKey="from"
                        name={fromCityData.name}
                        fill="hsl(var(--chart-1))"
                        radius={[3, 3, 0, 0]}
                      />
                      <Bar
                        dataKey="to"
                        name={toCityData.name}
                        fill="hsl(var(--chart-2))"
                        radius={[3, 3, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">
                      {fromCityData.name} Monthly Total
                    </div>
                    <div className="text-lg font-bold">
                      {formatCurrency(totalFromMonthly)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">
                      {toCityData.name} Monthly Total
                    </div>
                    <div className="text-lg font-bold">
                      {formatCurrency(totalToMonthly)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Compare CTA */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold mb-1">See the Full Comparison</h3>
                <p className="text-sm text-muted-foreground">
                  Explore a detailed side-by-side breakdown of{" "}
                  {fromCityData.name} vs {toCityData.name}.
                </p>
              </div>
              <Link href={`/compare/${fromCity}/vs/${toCity}`}>
                <Button className="gap-2 shrink-0">
                  Compare Cities <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </>
      )}

      {/* Methodology */}
      <section className="mt-12">
        <h2 className="text-xl font-bold mb-4">How Salary Adjustment Works</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              title: "Cost of Living Index",
              desc: "The core formula uses Regional Price Parities (RPP) from the Bureau of Economic Analysis to measure the relative cost of goods and services across metro areas.",
            },
            {
              title: "Tax Impact",
              desc: "State income tax rates from the Tax Foundation are applied to calculate net take-home pay differences between states with and without income taxes.",
            },
            {
              title: "Rent Burden",
              desc: "HUD Fair Market Rent data provides median 2-bedroom apartment costs. The 30% rule is used as the benchmark for housing affordability.",
            },
            {
              title: "Monthly Estimates",
              desc: "Monthly budget estimates are based on BLS Consumer Expenditure Survey averages adjusted by each city's category-specific price indices.",
            },
          ].map((item) => (
            <Card key={item.title}>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-primary" />
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection
        title="Salary Calculator FAQ"
        subtitle="Everything you need to know about adjusting your salary for cost of living."
        items={[
          {
            question: "How does the salary adjustment calculator work?",
            answer:
              "Our salary calculator uses the ratio of cost of living indices between two cities. If you earn $80,000 in a city with an index of 110 and are considering a city with an index of 90, your equivalent salary would be approximately $65,455 ($80,000 × 90/110). We further refine this by factoring in state income tax differences and housing cost ratios.",
          },
          {
            question:
              "Should I accept a lower salary if the cost of living is lower?",
            answer:
              "It depends on your priorities. A lower nominal salary in a cheaper city can give you more purchasing power and a higher savings rate. For example, earning $70,000 in Austin (cost index ~101) can provide a comparable or better lifestyle than $100,000 in San Francisco (cost index ~128). Consider housing costs, state taxes, career growth, and quality of life.",
          },
          {
            question: "What does the rent-to-income ratio mean?",
            answer:
              "The rent-to-income ratio shows what percentage of your gross monthly income goes to rent. Financial experts recommend keeping this below 30%. A ratio above 30% is considered cost-burdened, and above 50% is severely cost-burdened. Our calculator shows this metric for both your current and target cities.",
          },
          {
            question: "How accurate are the salary comparisons?",
            answer:
              "Our calculations are based on official government data including BEA Regional Price Parities, Census ACS income data, and HUD Fair Market Rents. While individual experiences vary based on specific neighborhoods, lifestyle choices, and personal spending habits, our comparisons provide a reliable baseline for salary negotiation and relocation decisions.",
          },
          {
            question: "Does the calculator account for remote work?",
            answer:
              "The calculator compares cost of living between cities regardless of where you work. If you work remotely and keep your current salary while moving to a cheaper city, you'll see the full cost of living benefit without a salary adjustment. Simply compare your current city against potential destinations to see how much further your salary goes.",
          },
        ]}
      />
    </div>
  );
}
