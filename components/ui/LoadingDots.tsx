// components/ui/LoadingDots.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingDotsProps {
  className?: string;
  color?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({ 
  className,
  color = 'bg-gray-600'
}) => {
  return (
    <span className={cn("inline-flex gap-1", className)}>
      <span 
        className={cn(
          "animate-bounce h-2 w-2 rounded-full", 
          color,
          "[animation-delay:-0.3s]"
        )} 
      />
      <span 
        className={cn(
          "animate-bounce h-2 w-2 rounded-full", 
          color,
          "[animation-delay:-0.15s]"
        )} 
      />
      <span 
        className={cn(
          "animate-bounce h-2 w-2 rounded-full",
          color
        )} 
      />
    </span>
  );
};

export default LoadingDots;