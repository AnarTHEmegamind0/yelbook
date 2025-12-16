import { Suspense } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { BusinessCard } from './components/business-card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';

// ISR with 60 second revalidation
export const revalidate = 60;

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
  imageUrl: string;
  timetable: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

// Server-side data fetching with ISR
async function getHomeData() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  try {
    const res = await fetch(`${baseUrl}/`, {
      next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
    });
    console.log('Fetched home data with status', res.status);
    if (!res.ok) {
      console.warn('API unavailable, returning empty data');
      return { categories: [], businesses: [] };
    }

    return res.json();
  } catch (error) {
    // Handle fetch failure (e.g., during build when API is not running)
    console.warn('Failed to fetch home data:', error);
    return { categories: [], businesses: [] };
  }
}

// Categories section - streamed with Suspense
async function CategoriesSection() {
  const data = await getHomeData();
  const categories: Category[] = data.categories || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/search?category=${encodeURIComponent(category.name)}`}
          className="p-6 bg-card border border-border rounded-lg hover:shadow-md transition-all hover:border-accent text-center group"
        >
          <div className="text-3xl mb-2">📁</div>
          <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
            {category.name}
          </h3>
        </Link>
      ))}
    </div>
  );
}

// Featured businesses section - streamed with Suspense
async function FeaturedBusinessesSection() {
  const data = await getHomeData();
  const businesses: Business[] = data.businesses || [];
  const categories: Category[] = data.categories || [];
  const featuredBusinesses = businesses.slice(0, 4);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Ангилал';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {featuredBusinesses.map((business) => (
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
  );
}

// Loading skeleton for categories
function CategoriesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="p-6 bg-card border border-border rounded-lg animate-pulse"
        >
          <div className="h-8 w-8 bg-muted rounded mx-auto mb-2" />
          <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
        </div>
      ))}
    </div>
  );
}

// Loading skeleton for businesses
function BusinessesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
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
  );
}

export default function YellowBooksPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-lg">
                G
              </span>
            </div>
            <span className="font-bold text-xl text-foreground">
              Ногоон дэвтэр
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/search"
              className="text-foreground hover:text-accent transition-colors"
            >
              Хайх
            </Link>
            <Link href="/auth/login">
              <Button
                variant="default"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Нэвтрэх
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section - Static, renders immediately */}
      <section className="bg-linear-to-br from-accent/5 to-accent/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">
              Итгэмжлэгдсэн бизнесүүдийг олж нээгээрэй
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Жинхэнэ хэрэглэгчдийн бодит сэтгэгдэл, үнэлгээнээс үндэслэн зөв
              шийдвэр гаргаарай.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <form action="/search" method="GET" className="flex gap-2">
              <Input
                name="q"
                placeholder="Бизнесийн нэр эсвэл ангиллаар хайх..."
                aria-label="Хайлт"
              />
              <Button
                type="submit"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Хайх
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Categories Section - Streamed with Suspense */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Ангиллаар хайх
          </h2>
          <Suspense fallback={<CategoriesSkeleton />}>
            <CategoriesSection />
          </Suspense>
        </div>
      </section>

      {/* Featured Section - Streamed with Suspense */}
      <section className="py-10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">
              Онцлох бизнесүүд
            </h2>
            <Link
              href="/search"
              className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors"
            >
              Бүгдийг харах <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <Suspense fallback={<BusinessesSkeleton />}>
            <FeaturedBusinessesSection />
          </Suspense>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2025 made ❤️ with Anar</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
