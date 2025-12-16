interface RatingStarsProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export function RatingStars({
  rating,
  size = 'md',
  interactive = false,
}: RatingStarsProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex gap-1 items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`${sizeClasses[size]} ${
            i < Math.round(rating)
              ? 'fill-accent text-accent'
              : 'fill-muted text-muted'
          } ${interactive ? 'cursor-pointer hover:fill-accent/80' : ''}`}
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
      <span className="text-sm font-medium text-foreground ml-2">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}
