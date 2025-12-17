import { Suspense } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { BusinessCard } from '../components/business-card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { MapIsland } from './map-island';
import { getServerApiUrl } from '../lib/api';

// Force SSR - no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Business {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  googleMapUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  imageUrl?: string;
  timetable: string;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
}

interface SearchPageProps {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}

const ITEMS_PER_PAGE = 12;

async function getSearchData() {
  const baseUrl = getServerApiUrl();

  try {
    const res = await fetch(`${baseUrl}/search`, {
      cache: 'no-store', // SSR: always fetch fresh data
    });

    if (!res.ok) {
      console.warn('Search API unavailable');
      return { categories: [], businesses: [] };
    }

    return res.json();
  } catch (error) {
    console.warn('Failed to fetch search data:', error);
    return { categories: [], businesses: [] };
  }
}

function SearchForm({ initialQuery }: { initialQuery?: string }) {
  return (
    <form action="/search" method="GET" className="flex gap-2">
      <Input
        name="q"
        defaultValue={initialQuery}
        placeholder="Бизнесийн нэрээр хайх..."
        aria-label="Хайлт"
      />
      <Button
        type="submit"
        className="bg-accent hover:bg-accent/90 text-accent-foreground"
      >
        Хайх
      </Button>
    </form>
  );
}

// Server component for search results
async function SearchResults({
  category,
  query,
  page,
}: {
  category?: string;
  query?: string;
  page: number;
}) {
  const data = await getSearchData();
  const allBusinesses: Business[] = data.businesses || [];
  const categories: Category[] = data.categories || [];

  const getCategoryName = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.name || 'Ангилал';
  };

  // Filter businesses
  const filteredBusinesses = allBusinesses.filter((business) => {
    const matchesCategory =
      !category || getCategoryName(business.categoryId) === category;
    const matchesSearch =
      !query ||
      business.name.toLowerCase().includes(query.toLowerCase()) ||
      business.description.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredBusinesses.length / ITEMS_PER_PAGE);
  const paginatedBusinesses = filteredBusinesses.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <>
      {/* Results count */}
      <p className="text-muted-foreground mb-6">
        Нийт {filteredBusinesses.length} бизнесээс{' '}
        {paginatedBusinesses.length > 0 ? (page - 1) * ITEMS_PER_PAGE + 1 : 0}-
        {Math.min(page * ITEMS_PER_PAGE, filteredBusinesses.length)}-г харуулж
        байна
      </p>

      {paginatedBusinesses.length > 0 ? (
        <>
          {/* Map Island - Client Component */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Газрын зураг дээр харах
            </h3>
            <MapIsland businesses={paginatedBusinesses} className="h-64" />
          </div>

          {/* Business Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {paginatedBusinesses.map((business) => (
              <BusinessCard
                key={business.id}
                id={business.id}
                name={business.name}
                category={getCategoryName(business.categoryId)}
                rating={4.5}
                reviewCount={0}
                description={business.description}
                image={
                  business.imageUrl
                    ? business.imageUrl.startsWith('http')
                      ? business.imageUrl
                      : business.imageUrl.startsWith('/')
                      ? business.imageUrl
                      : `/${business.imageUrl}`
                    : '/placeholder.svg'
                }
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Link
                href={`/search?${new URLSearchParams({
                  ...(category && { category }),
                  ...(query && { q: query }),
                  page: String(Math.max(1, page - 1)),
                })}`}
              >
                <Button variant="outline" disabled={page === 1}>
                  Өмнөх
                </Button>
              </Link>
              {Array.from({ length: totalPages }).map((_, i) => (
                <Link
                  key={i + 1}
                  href={`/search?${new URLSearchParams({
                    ...(category && { category }),
                    ...(query && { q: query }),
                    page: String(i + 1),
                  })}`}
                >
                  <Button
                    variant={page === i + 1 ? 'default' : 'outline'}
                    className={
                      page === i + 1 ? 'bg-accent text-accent-foreground' : ''
                    }
                  >
                    {i + 1}
                  </Button>
                </Link>
              ))}
              <Link
                href={`/search?${new URLSearchParams({
                  ...(category && { category }),
                  ...(query && { q: query }),
                  page: String(Math.min(totalPages, page + 1)),
                })}`}
              >
                <Button variant="outline" disabled={page === totalPages}>
                  Дараах
                </Button>
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Бизнес олдсонгүй.</p>
        </div>
      )}
    </>
  );
}

// Category filters component - Server-side with Links (no client JS needed)
async function CategoryFilters({
  selectedCategory,
}: {
  selectedCategory?: string;
}) {
  const data = await getSearchData();
  const categories: Category[] = data.categories || [];

  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/search">
        <Badge
          variant={!selectedCategory ? 'default' : 'outline'}
          className={`cursor-pointer transition-colors ${
            !selectedCategory
              ? 'bg-accent text-accent-foreground hover:bg-accent/90'
              : 'hover:bg-muted'
          }`}
        >
          Бүгд
        </Badge>
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/search?category=${encodeURIComponent(cat.name)}`}
        >
          <Badge
            variant={selectedCategory === cat.name ? 'default' : 'outline'}
            className={`cursor-pointer transition-colors ${
              selectedCategory === cat.name
                ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                : 'hover:bg-muted'
            }`}
          >
            {cat.name}
          </Badge>
        </Link>
      ))}
    </div>
  );
}

// Loading skeletons
function ResultsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-5 bg-muted rounded w-48 animate-pulse" />
      <div className="h-64 bg-muted rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-lg overflow-hidden animate-pulse"
          >
            <div className="h-40 bg-muted" />
            <div className="p-6 space-y-3">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-5 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="h-12 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FiltersSkeleton() {
  return (
    <div className="flex gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-8 w-20 bg-muted rounded-full animate-pulse" />
      ))}
    </div>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const category = params.category;
  const query = params.q;
  const page = parseInt(params.page || '1', 10);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5 text-accent" />
            <span className="font-semibold text-foreground">
              Нүүр хуудас руу буцах
            </span>
          </Link>
        </div>
      </header>

      {/* Search Section */}
      <section className="bg-linear-to-br from-accent/5 to-accent/10 py-8 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">
            Бизнес хайх
          </h1>
          <SearchForm initialQuery={query} />
        </div>
      </section>

      {/* Filters */}
      <section className="bg-card border-b border-border py-6 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Ангиллаар шүүх
          </h3>
          <Suspense fallback={<FiltersSkeleton />}>
            <CategoryFilters selectedCategory={category} />
          </Suspense>
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<ResultsSkeleton />}>
            <SearchResults category={category} query={query} page={page} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
