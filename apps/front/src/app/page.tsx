import Link from 'next/link';
import { BusinessCard } from './components/business-card';
import { SearchBar } from './components/search-bar';
import { Button } from './components/ui/button';
import { ChevronRight } from 'lucide-react';

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

interface HomeData {
  categories: Category[];
  businesses: Business[];
}

async function getHomeData(): Promise<HomeData> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  try {
    const res = await fetch(`${baseUrl}/`, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (res.ok) {
      const data = await res.json();
      return {
        categories: data.categories || [],
        businesses: data.businesses || [],
      };
    }
  } catch (err) {
    console.error('Өгөгдөл татахад алдаа:', err);
  }

  return { categories: [], businesses: [] };
}

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function Home() {
  const { categories, businesses } = await getHomeData();

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Ангилал';
  };

  const featuredBusinesses = businesses.slice(0, 4);

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
            <Link
              href="/auth/login"
              className="text-foreground hover:text-accent transition-colors"
            >
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

      {/* Hero Section */}
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
            <SearchBar placeholder="Бизнесийн нэр эсвэл ангиллаар хайх..." />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Ангиллаар хайх
          </h2>
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
        </div>
      </section>

      {/* Featured Section */}
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
                image={business.imageUrl}
              />
            ))}
          </div>
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
