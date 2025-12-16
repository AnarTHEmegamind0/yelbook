import { z } from 'zod';
import { BusinessSchema } from './business';

// Client-д хэрэгтэй талбаруудыг л буцаая
export const BusinessListItemSchema = BusinessSchema.pick({
  id: true,
  name: true,
  category: true,
  rating: true,
  reviewCount: true,
  description: true,
  image: true,
});

export type BusinessListItem = z.infer<typeof BusinessListItemSchema>;

export const SearchParamsSchema = z.object({
  q: z.string().trim().optional(),
  category: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  take: z.coerce.number().int().min(1).max(100).default(12),
});

export type SearchParams = z.infer<typeof SearchParamsSchema>;

export const SearchResponseSchema = z.object({
  items: z.array(BusinessListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().min(1),
  pageCount: z.number().int().min(1),
  categories: z.array(z.string()),
});

export type SearchResponse = z.infer<typeof SearchResponseSchema>;
