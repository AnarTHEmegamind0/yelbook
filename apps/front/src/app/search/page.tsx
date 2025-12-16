'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BusinessCard } from '../components/business-card';
import { CategoryChips } from '../components/category-chips';
import { SearchBar } from '../components/search-bar';
import { Button } from '../components/ui/button';
import { ChevronLeft } from 'lucide-react';

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
}

interface Category {
  id: string;
  name: string;
}

const ITEMS_PER_PAGE = 12;

function SearchContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    categoryParam || undefined
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allBusinesses, setAllBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${baseUrl}/search`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
          setAllBusinesses(data.businesses || []);
        }
      } catch (err) {
        console.error('Өгөгдөл татахад алдаа:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [baseUrl]);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Ангилал';
  };

  const filteredBusinesses = allBusinesses.filter((business) => {
    const matchesCategory =
      !selectedCategory ||
      getCategoryName(business.categoryId) === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredBusinesses.length / ITEMS_PER_PAGE);
  const paginatedBusinesses = filteredBusinesses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Нэр эсвэл түлхүүр үгээр хайх..."
          />
        </div>
      </section>

      {/* Filters */}
      <section className="bg-card border-b border-border py-6 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Ангиллаар шүүх
          </h3>
          {loading ? (
            <p className="text-muted-foreground">Ачааллаж байна...</p>
          ) : (
            <CategoryChips
              categories={categories.map((c) => c.name)}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          )}
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-muted-foreground mb-6">
            Нийт {filteredBusinesses.length} бизнесээс{' '}
            {paginatedBusinesses.length > 0
              ? (currentPage - 1) * ITEMS_PER_PAGE + 1
              : 0}
            -{Math.min(currentPage * ITEMS_PER_PAGE, filteredBusinesses.length)}
            -г харуулж байна
          </p>

          {loading ? (
            <p className="text-muted-foreground">Ачааллаж байна...</p>
          ) : paginatedBusinesses.length > 0 ? (
            <>
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
                    image={business.imageUrl}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Өмнөх
                  </Button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <Button
                      key={i + 1}
                      variant={currentPage === i + 1 ? 'default' : 'outline'}
                      onClick={() => setCurrentPage(i + 1)}
                      className={
                        currentPage === i + 1
                          ? 'bg-accent text-accent-foreground'
                          : ''
                      }
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Дараах
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">Бизнес олдсонгүй.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Уншиж байна...</div>}>
      <SearchContent />
    </Suspense>
  );
}
