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
