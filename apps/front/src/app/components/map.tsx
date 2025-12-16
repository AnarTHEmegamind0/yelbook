'use client';

import { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { cn } from '@/app/lib/utils';

export type GoogleMapProps = {
  lat: number;
  lng: number;
  zoom?: number;
  className?: string;
  markerTitle?: string;
};

type GoogleLike = {
  maps: {
    Map: new (el: HTMLElement, opts: Record<string, unknown>) => unknown;
    Marker: new (opts: Record<string, unknown>) => unknown;
  };
};

export default function GoogleMap({
  lat,
  lng,
  zoom = 12,
  className,
  markerTitle,
}: GoogleMapProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let map: unknown = null;
    const controller = new AbortController();

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn(
        'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set. Map will not load.'
      );
      return;
    }

    const loader = new Loader({ apiKey, version: 'weekly' });

    loader
      .load()
      .then((value: unknown) => {
        const google = value as GoogleLike;
        if (!ref.current || controller.signal.aborted) return;
        map = new google.maps.Map(ref.current, {
          center: { lat, lng },
          zoom,
          disableDefaultUI: true,
        });
        // place a marker at the given coordinates
        void new google.maps.Marker({
          position: { lat, lng },
          map,
          title: markerTitle,
        });
      })
      .catch((err: unknown) => {
        console.error('Failed to load Google Maps', err);
      });

    return () => {
      controller.abort();
      map = null;
    };
  }, [lat, lng, zoom, markerTitle]);

  return (
    <div
      ref={ref}
      className={cn(
        'h-80 w-full rounded-lg border border-border bg-card',
        className
      )}
    />
  );
}
