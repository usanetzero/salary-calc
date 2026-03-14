import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, opts?: { compact?: boolean }): string {
  if (opts?.compact) {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

export function costIndexLabel(index: number): string {
  if (index < 80) return "Very Affordable";
  if (index < 90) return "Affordable";
  if (index < 100) return "Below Average";
  if (index < 110) return "Average";
  if (index < 125) return "Above Average";
  if (index < 145) return "Expensive";
  if (index < 165) return "Very Expensive";
  return "Extremely Expensive";
}

export function costIndexColor(index: number): string {
  if (index < 85) return "text-emerald-600 dark:text-emerald-400";
  if (index < 100) return "text-green-600 dark:text-green-400";
  if (index < 115) return "text-yellow-600 dark:text-yellow-400";
  if (index < 140) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

export function costIndexBg(index: number): string {
  if (index < 85) return "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300";
  if (index < 100) return "bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300";
  if (index < 115) return "bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300";
  if (index < 140) return "bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300";
  return "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300";
}

export function getStateFullName(code: string): string {
  const states: Record<string, string> = {
    AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
    CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
    HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
    KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
    MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
    MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
    NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
    OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
    SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
    VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
    DC: "Washington DC",
  };
  return states[code] || code;
}
