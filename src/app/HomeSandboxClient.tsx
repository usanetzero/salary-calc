"use client";

import { useState } from "react";
import Link from "next/link";
import { Calculator, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { City } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export default function HomeSandboxClient({ cities }: { cities: City[] }) {
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
