import Link from 'next/link';
import { Badge } from '../components/ui/badge';
import { RatingStars } from './rating-stars';

interface BusinessCardProps {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  description: string;
  image?: string;
}

export function BusinessCard({
  id,
  name,
  category,
  rating,
  reviewCount,
  description,
  image,
}: BusinessCardProps) {
  return (
    <Link href={`/${id}`}>
      <div className="h-full bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
        {image && (
          <div className="relative h-40 w-full bg-muted overflow-hidden">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-6 flex flex-col h-full">
          <div className="mb-3">
            <Badge variant="secondary" className="text-xs mb-2">
              {category}
            </Badge>
            <h3 className="text-lg font-bold text-foreground line-clamp-2">
              {name}
            </h3>
          </div>

          <div className="mb-4">
            <RatingStars rating={rating} size="md" />
            <p className="text-sm text-muted-foreground mt-2">
              {reviewCount.toLocaleString()} reviews
            </p>
          </div>

          <p className="text-sm text-foreground line-clamp-3 flex-1">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}
