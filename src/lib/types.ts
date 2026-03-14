import { z } from "zod";

export const citySchema = z.object({
  slug: z.string(),
  name: z.string(),
  state: z.string(),
  stateCode: z.string(),
  medianIncome: z.number(),
  medianRent: z.number(),
  medianHomeValue: z.number(),
  costIndex: z.number(),
  taxRate: z.number(),
  unemploymentRate: z.number(),
  utilitiesIndex: z.number(),
  groceryIndex: z.number(),
  transportationIndex: z.number(),
  healthcareIndex: z.number(),
  population: z.number(),
  description: z.string().optional(),
});

export const comparisonSchema = z.object({
  cityA: citySchema,
  cityB: citySchema,
  salaryMultiplier: z.number(),
  differences: z.object({
    rent: z.number(),
    income: z.number(),
    costIndex: z.number(),
    groceries: z.number(),
    utilities: z.number(),
    transportation: z.number(),
    healthcare: z.number(),
  }),
});

export type City = z.infer<typeof citySchema>;
export type Comparison = z.infer<typeof comparisonSchema>;
