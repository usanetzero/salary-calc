import mongoose, { Schema, Document } from "mongoose";

export interface ICityDocument extends Document {
  slug: string;
  name: string;
  state: string;
  stateCode: string;
  medianIncome: number;
  medianRent: number;
  medianHomeValue: number;
  costIndex: number;
  taxRate: number;
  unemploymentRate: number;
  utilitiesIndex: number;
  groceryIndex: number;
  transportationIndex: number;
  healthcareIndex: number;
  population: number;
  description?: string;
  fmrRent1BR?: number;
  fmrRent2BR?: number;
  fmrRent3BR?: number;
  rentRPP?: number;
  goodsRPP?: number;
  servicesRPP?: number;
  averageSalary?: number;
  dataSource: {
    income?: string;
    rent?: string;
    homeValue?: string;
    costIndex?: string;
    unemployment?: string;
    utilities?: string;
    groceries?: string;
    transportation?: string;
    healthcare?: string;
  };
  dataLastUpdated: Date;
}

const CitySchema = new Schema<ICityDocument>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    state: { type: String, required: true },
    stateCode: { type: String, required: true, index: true },
    medianIncome: { type: Number, required: true },
    medianRent: { type: Number, required: true },
    medianHomeValue: { type: Number, required: true },
    costIndex: { type: Number, required: true },
    taxRate: { type: Number, required: true },
    unemploymentRate: { type: Number, required: true },
    utilitiesIndex: { type: Number, required: true },
    groceryIndex: { type: Number, required: true },
    transportationIndex: { type: Number, required: true },
    healthcareIndex: { type: Number, required: true },
    population: { type: Number, required: true },
    description: { type: String },
    fmrRent1BR: { type: Number },
    fmrRent2BR: { type: Number },
    fmrRent3BR: { type: Number },
    rentRPP: { type: Number },
    goodsRPP: { type: Number },
    servicesRPP: { type: Number },
    averageSalary: { type: Number },
    dataSource: {
      income: { type: String },
      rent: { type: String },
      homeValue: { type: String },
      costIndex: { type: String },
      unemployment: { type: String },
      utilities: { type: String },
      groceries: { type: String },
      transportation: { type: String },
      healthcare: { type: String },
    },
    dataLastUpdated: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

CitySchema.index({ costIndex: 1 });
CitySchema.index({ population: -1 });
CitySchema.index({ name: "text", state: "text" });

export const CityModel =
  mongoose.models.City || mongoose.model<ICityDocument>("City", CitySchema);

/* ── PayscaleCity Model ─────────────────────────────────── */

export interface IPayscaleCityDocument extends Document {
  name: string;
  slug: string;
  stateName: string;
  stateSlug: string;
  url?: string;
  overallVsNationalAvg?: string;
  categoryComparisons?: {
    Housing?: string | null;
    Utilities?: string | null;
    Groceries?: string | null;
    Transportation?: string | null;
  };
  housing?: {
    medianHomePrice?: string;
    medianRent?: string;
    energyBill?: string;
    phoneBill?: string;
    gas?: string;
  };
  foodGrocery?: {
    loafOfBread?: string;
    gallonOfMilk?: string;
    cartonOfEggs?: string;
    bunchOfBananas?: string;
    hamburger?: string;
  };
  healthcare?: {
    doctorsVisit?: string;
    dentistVisit?: string;
    optometristVisit?: string;
    rxDrug?: string;
    veterinaryVisit?: string;
  };
}

const PayscaleCitySchema = new Schema<IPayscaleCityDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, index: true },
    stateName: { type: String, required: true, index: true },
    stateSlug: { type: String, required: true, index: true },
    url: { type: String },
    overallVsNationalAvg: { type: String },
    categoryComparisons: {
      Housing: { type: String },
      Utilities: { type: String },
      Groceries: { type: String },
      Transportation: { type: String },
    },
    housing: {
      medianHomePrice: { type: String },
      medianRent: { type: String },
      energyBill: { type: String },
      phoneBill: { type: String },
      gas: { type: String },
    },
    foodGrocery: {
      loafOfBread: { type: String },
      gallonOfMilk: { type: String },
      cartonOfEggs: { type: String },
      bunchOfBananas: { type: String },
      hamburger: { type: String },
    },
    healthcare: {
      doctorsVisit: { type: String },
      dentistVisit: { type: String },
      optometristVisit: { type: String },
      rxDrug: { type: String },
      veterinaryVisit: { type: String },
    },
  },
  { timestamps: true },
);

PayscaleCitySchema.index({ stateName: 1, slug: 1 }, { unique: true });
PayscaleCitySchema.index({ name: "text", stateName: "text" });

export const PayscaleCityModel =
  mongoose.models.PayscaleCity ||
  mongoose.model<IPayscaleCityDocument>("PayscaleCity", PayscaleCitySchema);

/* ── State Model ────────────────────────────────────────── */

export interface IStateDocument extends Document {
  slug: string;
  name: string;
  stateCode: string;
  totalCities: number;
  avgCostIndex?: number;
  avgTaxRate?: number;
  avgMedianRent?: number;
  avgMedianIncome?: number;
  avgMedianHomeValue?: number;
  description?: string;
}

const StateSchema = new Schema<IStateDocument>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    stateCode: { type: String, required: true, unique: true, index: true },
    totalCities: { type: Number, required: true },
    avgCostIndex: { type: Number },
    avgTaxRate: { type: Number },
    avgMedianRent: { type: Number },
    avgMedianIncome: { type: Number },
    avgMedianHomeValue: { type: Number },
    description: { type: String },
  },
  { timestamps: true },
);

export const StateModel =
  mongoose.models.State || mongoose.model<IStateDocument>("State", StateSchema);
