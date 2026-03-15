import type { Metadata } from "next";
import SalaryCalculatorClient from "./SalaryCalculatorClient";
import { getAllCities } from "@/lib/storage";

export const revalidate = 3600;

export const metadata: Metadata = {
  title:
    "Salary Calculator – Compare Cost of Living & Wages Between US Cities (2025)",
  description:
    "Calculate your salary equivalent when moving between US cities. Compare wages vs cost of living for Arizona, Las Vegas, New York, Bay Area, and 47+ metros. Adjusts for housing costs, state income taxes, groceries, utilities, and purchasing power.",
  keywords: [
    "salary calculator by city",
    "cost of living salary calculator",
    "salary equivalent calculator",
    "salary adjustment for cost of living",
    "compare salaries between cities",
    "wages vs cost of living",
    "cost of living vs income over time",
    "how much do I need to earn",
    "cost of living adjustment calculator",
    "relocation salary calculator",
    "salary comparison tool",
    "cost of living in arizona for a single person",
    "average cost of living in las vegas",
  ],
  openGraph: {
    title: "Salary Calculator – Compare Cost of Living | CostWise",
    description:
      "Calculate wages vs cost of living when relocating between US cities. Adjusts for housing, state taxes, and purchasing power.",
  },
};

export default async function SalaryCalculatorPage() {
  const cities = await getAllCities().catch(() => []);
  return <SalaryCalculatorClient initialCities={cities} />;
}
