"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ChevronRight,
  Home,
  DollarSign,
  Stethoscope,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PayscaleCity, USState } from "@/lib/types";

function parseDollar(val: string | undefined): number | undefined {
  if (!val) return undefined;
  const m = val.replace(/[^0-9.]/g, "");
  return m ? parseFloat(m) : undefined;
}

function parsePct(val: string | undefined): number | undefined {
  if (!val) return undefined;
  const m = val.replace(/[^0-9\-.]/g, "");
  return m ? parseInt(m, 10) : undefined;
}

function getPctBadge(val: string | null | undefined) {
  if (!val) return null;
  const num = parsePct(val);
  if (num === undefined) return null;
  const color =
    num < -10
      ? "bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300"
      : num < 0
        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
        : num === 0
          ? "bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300"
          : num < 10
            ? "bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300"
            : "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300";
  return <Badge className={`text-xs ${color}`}>{val}</Badge>;
}

export default function StatePageClient({
  state,
  cities,
}: {
  state: USState;
  cities: PayscaleCity[];
}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"name" | "cost">("name");

  const filtered = useMemo(() => {
    let list = cities;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    if (sort === "cost") {
      list = [...list].sort((a, b) => {
        const aP = parsePct(a.overallVsNationalAvg) ?? 0;
        const bP = parsePct(b.overallVsNationalAvg) ?? 0;
        return aP - bP;
      });
    }
    return list;
  }, [cities, search, sort]);

  return (
    <section>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">
          All Cities in {state.name}
          <span className="text-base font-normal text-muted-foreground ml-2">
            ({filtered.length} of {cities.length})
          </span>
        </h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search cities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-[200px]"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "name" | "cost")}
            className="text-sm border border-border rounded-md px-3 py-2 bg-background text-foreground"
          >
            <option value="name">Sort: A-Z</option>
            <option value="cost">Sort: Cheapest</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((city) => {
          const rent = city.housing?.medianRent;
          const homePrice = city.housing?.medianHomePrice;
          const overall = city.overallVsNationalAvg;

          return (
            <Link key={city.slug} href={`/states/${state.slug}/${city.slug}`}>
              <Card className="hover-elevate cursor-pointer h-full transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-semibold">{city.name}</h3>
                    {overall && getPctBadge(overall)}
                  </div>

                  <div className="space-y-1.5 text-sm">
                    {rent && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rent</span>
                        <span className="font-medium">{rent}</span>
                      </div>
                    )}
                    {homePrice && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Home Price
                        </span>
                        <span className="font-medium">{homePrice}</span>
                      </div>
                    )}
                    {city.categoryComparisons?.Housing && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Housing</span>
                        {getPctBadge(city.categoryComparisons.Housing)}
                      </div>
                    )}
                    {city.categoryComparisons?.Groceries && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Groceries</span>
                        {getPctBadge(city.categoryComparisons.Groceries)}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-border">
                    <span className="text-xs text-primary font-medium flex items-center gap-1">
                      View Details <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No cities found matching &quot;{search}&quot;.</p>
        </div>
      )}
    </section>
  );
}
