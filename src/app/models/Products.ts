// src/app/models/Products.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  SHIRT_SIZES,
  KIT_TYPES,
  KIT_SPECS,
  SHIRT_CONDITIONS,
  KIT_BRANDS,
} from '@/app/lib/constants';

export type ShirtSize = (typeof SHIRT_SIZES)[number];
export type KitType = (typeof KIT_TYPES)[number];
export type KitSpec = (typeof KIT_SPECS)[number];
export type ShirtCondition = (typeof SHIRT_CONDITIONS)[number];
export type KitBrand = (typeof KIT_BRANDS)[number] | string;

export interface IProductVariant {
  size: ShirtSize;
  stock: number;
}

export interface IProduct extends Document {
  title: string;
  slug: string;
  team: string;            // Free string to allow dynamic teams/nations
  brand: string;           // e.g. Nike, Adidas, Umbro
  year: string;
  condition: ShirtCondition;
  kitType: KitType;
  spec: KitSpec;
  price: number;
  images: string[];
  variants: IProductVariant[];
  hasCustomPrinting: boolean;
  printingPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>({
  size: {
    type: String,
    enum: SHIRT_SIZES,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
});

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    team: { type: String, required: true, index: true },
    brand: { type: String, required: true, default: 'Other' },
    year: { type: String, required: true, index: true },
    condition: {
      type: Number,
      enum: SHIRT_CONDITIONS,
      required: true,
      default: 10,
    },
    kitType: {
      type: String,
      enum: KIT_TYPES,
      required: true,
    },
    spec: {
      type: String,
      enum: KIT_SPECS,
      default: 'Stadium',
    },
    price: { type: Number, required: true },
    images: [{ type: String, required: true }],
    variants: [ProductVariantSchema],
    hasCustomPrinting: { type: Boolean, default: true },
    printingPrice: { type: Number, default: 150 },
  },
  { timestamps: true }
);

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);