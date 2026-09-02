// src/app/models/Order.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
  productId: string;
  title: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
}

export interface IOrder extends Document {
  customerName: string;
  email: string;
  phone: string;
  shippingAddress: string;
  city: string;
  province: string;
  postalCode?: string;
  notes?: string;
  paymentMethod: 'GCASH' | 'BANK_TRANSFER' | 'COD';
  items: IOrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: 'PENDING' | 'PAID' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    title: { type: String, required: true },
    size: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    customerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    shippingAddress: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    province: { type: String, required: true, trim: true },
    postalCode: { type: String, trim: true },
    notes: { type: String, trim: true },
    paymentMethod: {
      type: String,
      enum: ['GCASH', 'BANK_TRANSFER', 'COD'],
      required: true,
      default: 'GCASH',
    },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'DISPATCHED', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING',
    },
  },
  { timestamps: true }
);

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);