// src/app/lib/seed.ts
import { connectDB } from './db';
import { Product } from '../models/Products';

const sampleKits = [
  {
    title: 'Arsenal 2003/04 Invincibles Home Shirt',
    slug: 'arsenal-2003-04-invincibles-home',
    team: 'Arsenal',
    brand: 'Nike',
    year: '2003',
    condition: 10,
    kitType: 'Home',
    spec: 'Stadium',
    price: 3499,
    images: ['https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800'],
    variants: [
      { size: 'S', stock: 5 },
      { size: 'M', stock: 12 },
      { size: 'L', stock: 8 },
      { size: 'XL', stock: 3 },
    ],
    hasCustomPrinting: true,
    printingPrice: 250,
  },
  {
    title: 'Real Madrid 2017/18 Final Kyiv Away Shirt',
    slug: 'real-madrid-2017-18-final-kyiv-away',
    team: 'Real Madrid',
    brand: 'Adidas',
    year: '2017',
    condition: 9,
    kitType: 'Away',
    spec: 'Player Issue',
    price: 4199,
    images: ['https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800'],
    variants: [
      { size: 'M', stock: 4 },
      { size: 'L', stock: 6 },
      { size: 'XL', stock: 2 },
    ],
    hasCustomPrinting: true,
    printingPrice: 300,
  },
  {
    title: 'Japan 2022 World Cup Home Shirt',
    slug: 'japan-2022-world-cup-home',
    team: 'Japan',
    brand: 'Adidas',
    year: '2022',
    condition: 10,
    kitType: 'Home',
    spec: 'Stadium',
    price: 3899,
    images: ['https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800'],
    variants: [
      { size: 'S', stock: 10 },
      { size: 'M', stock: 15 },
      { size: 'L', stock: 10 },
    ],
    hasCustomPrinting: true,
    printingPrice: 250,
  },
];

export async function seedProducts() {
  await connectDB();
  await Product.deleteMany({});
  const inserted = await Product.insertMany(sampleKits);
  return inserted;
}