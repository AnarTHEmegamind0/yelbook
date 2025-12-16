'use client';

import { Search } from 'lucide-react';
import { Input } from '../components/ui/input';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({
  onSearch,
  placeholder = 'Search businesses...',
}: SearchBarProps) {
  return (
    <div className="w-full flex gap-2">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          className="pl-10 h-12 rounded-lg border-muted"
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>
      {/* <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
        Search
      </Button> */}
    </div>
  );
}
