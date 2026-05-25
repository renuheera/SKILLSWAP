'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md';
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export function StarRating({ rating, max = 5, size = 'sm', interactive = false, onRate }: StarRatingProps) {
  const sizeClass = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            sizeClass,
            i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300',
            interactive && 'cursor-pointer hover:text-amber-400'
          )}
          onClick={() => interactive && onRate && onRate(i + 1)}
        />
      ))}
    </div>
  );
}
