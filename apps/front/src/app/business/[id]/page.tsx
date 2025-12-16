'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, MapPin, Phone, Globe } from 'lucide-react';

import { RatingStars } from '../../components/rating-stars';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

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

export default function BusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${baseUrl}/admin/businesses/${id}`);
        if (res.ok) {
          const data = await res.json();
          setBusiness(data.business);
        } else if (res.status === 404) {
          setError('Бизнес олдсонгүй');
        } else {
          setError('Өгөгдөл татахад алдаа гарлаа');
        }
      } catch (err) {
        console.error('Өгөгдөл татахад алдаа:', err);
        setError('Сүлжээний алдаа');
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [id, baseUrl]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Ачааллаж байна...</p>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">
            {error || 'Бизнес олдсонгүй'}
          </p>
          <Link href="/search">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Хайлт руу буцах
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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

      {/* Hero */}
      <section className="relative h-64 overflow-hidden bg-muted">
        <img
          src={business.imageUrl}
          alt={business.name}
          className="object-cover"
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
                  <Globe className="w-5 h-5 text-accent" />
                  <a
                    href={business.website}
                    target="_blank"
                    className="text-accent hover:underline"
                    rel="noreferrer"
                  >
                    {business.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-4">
              <div className="text-center md:text-right">
                <div className="text-5xl font-bold text-accent mb-2">4.5</div>
                <RatingStars rating={4.5} size="lg" />
                <p className="text-sm text-muted-foreground mt-2">
                  Үнэлгээ харуулах
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      {business.googleMapUrl && (
        <section className="border-b border-border py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Байршил</h2>
            <div className="bg-muted rounded-lg overflow-hidden">
              <iframe
                src={business.googleMapUrl}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              {business.address}
            </p>
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
