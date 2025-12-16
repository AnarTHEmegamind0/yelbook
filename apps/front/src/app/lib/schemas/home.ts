import { z } from 'zod';
import { BusinessListItemSchema } from './search';

export const HomeResponseSchema = z.object({
  featured: z.array(BusinessListItemSchema),
  categories: z.array(z.string().min(1)),
});

export type HomeResponse = z.infer<typeof HomeResponseSchema>;
