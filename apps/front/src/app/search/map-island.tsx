'use client';

import Link from 'next/link';

interface MapIslandProps {
  businesses: Array<{
    id: string;
    name: string;
    address: string;
    googleMapUrl?: string;
  }>;
  className?: string;
}

export function MapIsland({ businesses, className = '' }: MapIslandProps) {
  const first = businesses[0];
  const query = first?.address || 'Улаанбаатар';
  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(
    query
  )}&output=embed`;
  const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(query)}`;

  if (businesses.length === 0) {
    return (
      <div
        className={`bg-muted rounded-lg flex items-center justify-center ${className}`}
      >
        <div className="text-center p-8">
          <p className="text-muted-foreground">
            Газрын зураг харах өгөгдөл алга.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-border bg-card ${className}`}
    >
      <iframe
        title="Газрын зураг"
        src={embedUrl}
        className="w-full h-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="absolute bottom-2 right-2">
        <Link
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs bg-card/90 border border-border rounded px-2 py-1 text-foreground hover:text-accent transition-colors"
        >
          Google Maps дээр нээх
        </Link>
      </div>
    </div>
  );
}
