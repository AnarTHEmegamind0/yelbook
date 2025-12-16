import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, MapPin, Phone, Globe, Mail, Clock } from 'lucide-react';
import { Badge } from '../components/ui/badge';

// SSG: Generate static params at build time
export async function generateStaticParams() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  try {
    const res = await fetch(`${baseUrl}/search`);
    if (!res.ok) return [];

    const data = await res.json();
    const businesses = data.businesses || [];

    return businesses.map((business: { id: string }) => ({
      id: business.id,
    }));
  } catch {
    return [];
  }
}

// Enable on-demand revalidation (called via API route)
export const dynamicParams = true;
export const revalidate = false; // Static until revalidated

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
  category?: {
    id: string;
    name: string;
  };
}

async function getBusiness(id: string): Promise<Business | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  try {
    const res = await fetch(`${baseUrl}/businesses/${id}`, {
      next: { tags: [`business-${id}`] }, // Tag for on-demand revalidation
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.business || null;
  } catch {
    return null;
  }
}

// Business details component
async function BusinessDetails({ id }: { id: string }) {
  const business = await getBusiness(id);

  if (!business) {
    notFound();
  }

  const imageUrl = business.imageUrl
    ? business.imageUrl.startsWith('/')
      ? business.imageUrl
      : business.imageUrl
    : '/placeholder.svg';

  return (
    <>
      {/* Hero Image */}
      <section className="relative h-64 overflow-hidden bg-muted">
        <Image
          src={imageUrl}
          alt={business.name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/30" />
      </section>

      {/* Business Info */}
      <section className="bg-card border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <Badge variant="secondary" className="mb-3">
                {business.category?.name || 'Ангилал'}
              </Badge>
              <h1 className="text-4xl font-bold text-foreground mb-4">
                {business.name}
              </h1>
              <p className="text-lg text-foreground max-w-2xl mb-6">
                {business.description}
              </p>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-foreground">
                  <MapPin className="w-5 h-5 text-accent" />
                  <span>{business.address}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Phone className="w-5 h-5 text-accent" />
                  <span>{business.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Mail className="w-5 h-5 text-accent" />
                  <span>{business.email}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Globe className="w-5 h-5 text-accent" />
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent hover:underline"
                  >
                    {business.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Clock className="w-5 h-5 text-accent" />
                  <span>{business.timetable}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-4">
              <div className="text-center md:text-right">
                <div className="text-5xl font-bold text-accent mb-2">4.5</div>
                <p className="text-sm text-muted-foreground mt-2">Үнэлгээ</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      {business.address && (
        <section className="border-b border-border py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Байршил</h2>
            <div className="bg-muted rounded-lg overflow-hidden">
              <iframe
                title={`${business.name} байршил`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  business.address
                )}&output=embed`}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {business.address}
              </p>
              <a
                href={`https://www.google.com/maps?q=${encodeURIComponent(
                  business.address
                )}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-accent hover:text-accent/80 transition-colors"
              >
                Google Maps дээр нээх
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Additional Info */}
      <section className="border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Дэлгэрэнгүй мэдээлэл
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-card border border-border rounded-lg">
              <h3 className="font-semibold text-foreground mb-3">
                Ажиллах цаг
              </h3>
              <p className="text-muted-foreground">{business.timetable}</p>
            </div>
            <div className="p-6 bg-card border border-border rounded-lg">
              <h3 className="font-semibold text-foreground mb-3">
                Холбоо барих
              </h3>
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  И-мэйл: {business.email}
                </p>
                <p className="text-muted-foreground">Утас: {business.phone}</p>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="mt-6 flex gap-4">
            {business.facebookUrl && (
              <a
                href={business.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:text-accent/80 transition-colors"
              >
                Facebook
              </a>
            )}
            {business.instagramUrl && (
              <a
                href={business.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:text-accent/80 transition-colors"
              >
                Instagram
              </a>
            )}
            {business.website && (
              <a
                href={business.website}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:text-accent/80 transition-colors"
              >
                Вэбсайт
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

// Loading skeleton
function BusinessDetailSkeleton() {
  return (
    <>
      <section className="h-64 bg-muted animate-pulse" />
      <section className="bg-card border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            <div className="h-6 bg-muted rounded w-24 animate-pulse" />
            <div className="h-10 bg-muted rounded w-1/2 animate-pulse" />
            <div className="h-20 bg-muted rounded w-3/4 animate-pulse" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-5 bg-muted rounded w-1/3 animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link
            href="/search"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5 text-accent" />
            <span className="font-semibold text-foreground">Буцах</span>
          </Link>
        </div>
      </header>

      <Suspense fallback={<BusinessDetailSkeleton />}>
        <BusinessDetails id={id} />
      </Suspense>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2025 made ❤️ with Anar</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
