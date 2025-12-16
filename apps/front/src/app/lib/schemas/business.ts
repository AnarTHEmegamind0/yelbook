import { z } from 'zod';

export const CoordinatesSchema = z.object({
  lat: z.number().gte(-90).lte(90),
  lng: z.number().gte(-180).lte(180),
});

export const ReviewSchema = z.object({
  id: z.number().int().positive(),
  author: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  date: z.string().min(1), // keep simple; switch to z.string().datetime() if you store ISO dates
  title: z.string().min(1),
  text: z.string().min(1),
});

// Allow "www.example.com" and normalize to https://www.example.com
const WebsiteSchema = z.preprocess((v) => {
  if (typeof v !== 'string') return v;
  const s = v.trim();
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}, z.string().url());

export const BusinessSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
  description: z.string().min(1),
  image: z.string().min(1),
  address: z.string().min(1),
  phone: z.string().min(1),
  website: WebsiteSchema,
  coordinates: CoordinatesSchema,
  tags: z.array(z.string().min(1)).default([]),
  reviews: z.array(ReviewSchema).default([]),
});

export const BusinessesByIdSchema = z.record(z.string(), BusinessSchema);

export type Business = z.infer<typeof BusinessSchema>;
export type Review = z.infer<typeof ReviewSchema>;
