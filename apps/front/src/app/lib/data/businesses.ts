import raw from '../../data/businesses.json';
import { BusinessesByIdSchema, Business } from '@/app/lib/schemas/business';

// Validate once at module init; throws on bad data
const STORE = BusinessesByIdSchema.parse(raw);

export function getBusinessById(id: string): Business | null {
  return STORE[id] ?? null;
}

export function getAllBusinesses(): Record<string, Business> {
  return STORE;
}
export function getAllBusinessIds(): string[] {
  return Object.keys(STORE);
}

export function getBusinessesArray(): Business[] {
  return Object.values(STORE);
}

export function searchBusinesses(
  query: string,
  categoryFilter: string | null = null
): Business[] {
  const lowerQuery = query.trim().toLowerCase();

  return Object.values(STORE).filter((business) => {
    const matchesQuery =
      business.name.toLowerCase().includes(lowerQuery) ||
      business.description.toLowerCase().includes(lowerQuery) ||
      business.tags.some((tag) => tag.toLowerCase().includes(lowerQuery));

    const matchesCategory = categoryFilter
      ? business.category.toLowerCase() === categoryFilter.toLowerCase()
      : true;

    return matchesQuery && matchesCategory;
  });
}
