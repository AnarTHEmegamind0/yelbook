'use client';

import { Badge } from '../components/ui/badge';

interface CategoryChipsProps {
  categories: string[];
  selectedCategory?: string;
  onSelectCategory?: (category?: string) => void;
}

export function CategoryChips({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge
        variant={selectedCategory === undefined ? 'default' : 'outline'}
        className={`cursor-pointer transition-colors ${
          selectedCategory === undefined
            ? 'bg-accent text-accent-foreground hover:bg-accent/90'
            : 'hover:bg-muted'
        }`}
        onClick={() => onSelectCategory?.()}
      >
        All Categories
      </Badge>
      {categories.map((category) => (
        <Badge
          key={category}
          variant={selectedCategory === category ? 'default' : 'outline'}
          className={`cursor-pointer transition-colors ${
            selectedCategory === category
              ? 'bg-accent text-accent-foreground hover:bg-accent/90'
              : 'hover:bg-muted'
          }`}
          onClick={() => onSelectCategory?.(category)}
        >
          {category}
        </Badge>
      ))}
    </div>
  );
}
