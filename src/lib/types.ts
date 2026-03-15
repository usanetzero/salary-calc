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
  fmrRent1BR: z.number().optional(),
  fmrRent2BR: z.number().optional(),
  fmrRent3BR: z.number().optional(),
  rentRPP: z.number().optional(),
  goodsRPP: z.number().optional(),
  servicesRPP: z.number().optional(),
  averageSalary: z.number().optional(),
});

export const payscaleCitySchema = z.object({
  name: z.string(),
  slug: z.string(),
  stateName: z.string(),
  stateSlug: z.string(),
  url: z.string().optional(),
  overallVsNationalAvg: z.string().optional(),
  categoryComparisons: z
    .object({
      Housing: z.string().nullable().optional(),
      Utilities: z.string().nullable().optional(),
      Groceries: z.string().nullable().optional(),
      Transportation: z.string().nullable().optional(),
    })
    .optional(),
  housing: z
    .object({
      medianHomePrice: z.string().optional(),
      medianRent: z.string().optional(),
      energyBill: z.string().optional(),
      phoneBill: z.string().optional(),
      gas: z.string().optional(),
    })
    .optional(),
  foodGrocery: z
    .object({
      loafOfBread: z.string().optional(),
      gallonOfMilk: z.string().optional(),
      cartonOfEggs: z.string().optional(),
      bunchOfBananas: z.string().optional(),
      hamburger: z.string().optional(),
    })
    .optional(),
  healthcare: z
    .object({
      doctorsVisit: z.string().optional(),
      dentistVisit: z.string().optional(),
      optometristVisit: z.string().optional(),
      rxDrug: z.string().optional(),
      veterinaryVisit: z.string().optional(),
    })
    .optional(),
});

export const stateSchema = z.object({
  slug: z.string(),
  name: z.string(),
  stateCode: z.string(),
  totalCities: z.number(),
  avgCostIndex: z.number().optional(),
  avgTaxRate: z.number().optional(),
  avgMedianRent: z.number().optional(),
  avgMedianIncome: z.number().optional(),
  avgMedianHomeValue: z.number().optional(),
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
export type PayscaleCity = z.infer<typeof payscaleCitySchema>;
export type USState = z.infer<typeof stateSchema>;
export type Comparison = z.infer<typeof comparisonSchema>;
