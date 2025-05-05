import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'sm', children, ...props }, ref) => {
    const variants = {
      default: 'bg-gray-800 text-gray-200 border-gray-700',
      secondary: 'bg-gray-700 text-gray-200 border-gray-600',
      success: 'bg-green-900/30 text-green-400 border-green-800/50',
      warning: 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50',
      danger: 'bg-red-900/30 text-red-400 border-red-800/50'
    };

    const sizes = {
      sm: 'text-xs px-2 py-0.5',
      md: 'text-sm px-2.5 py-0.5'
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-md border font-medium',
          'transition-colors duration-200',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

// For beta badge specifically, create a specialized component
export const BetaBadge = React.forwardRef<HTMLSpanElement, Omit<BadgeProps, 'variant' | 'children'>>(
  ({ className, size = 'sm', ...props }, ref) => {
    return (
      <Badge
        ref={ref}
        variant="default"
        size={size}
        className={cn('uppercase tracking-wide font-semibold', className)}
        {...props}
      >
        Beta
      </Badge>
    );
  }
);

Badge.displayName = 'Badge';
BetaBadge.displayName = 'BetaBadge';

export default Badge;