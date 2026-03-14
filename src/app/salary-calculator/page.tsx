import type { Metadata } from "next";
import SalaryCalculatorClient from "./SalaryCalculatorClient";

export const metadata: Metadata = {
  title: "Salary Calculator – Compare Cost of Living Between Cities",
  description:
    "Calculate your salary equivalent when relocating between US cities. Our cost of living salary calculator adjusts for housing costs, state income taxes, groceries, utilities, and purchasing power across 47 major metros.",
  keywords: [
    "salary calculator by city",
    "cost of living salary calculator",
    "salary equivalent calculator",
    "salary adjustment for cost of living",
    "compare salaries between cities",
    "how much do I need to earn",
    "cost of living adjustment calculator",
    "relocation salary calculator",
    "salary comparison tool",
  ],
  openGraph: {
    title: "Salary Calculator – Compare Cost of Living | CostWise",
    description:
      "Calculate your salary equivalent when relocating between US cities. Adjusts for housing, state taxes, and purchasing power.",
  },
};

export default function SalaryCalculatorPage() {
  return <SalaryCalculatorClient />;
}
