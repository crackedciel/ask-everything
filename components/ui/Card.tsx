import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  onClick?: () => void;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  interactive?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, onClick, icon, title, description, interactive = true, children, ...props }, ref) => {
    const baseStyles = cn(
      'rounded-xl backdrop-blur-md bg-gray-800/30 p-4',
      'border border-gray-700/40',
      'transition-all duration-200',
      interactive && 'hover:bg-gray-800/60 cursor-pointer',
      className
    );

    if (title || description || icon) {
      return (
        <div
          ref={ref}
          className={baseStyles}
          onClick={onClick}
          role={onClick ? 'button' : undefined}
          tabIndex={onClick ? 0 : undefined}
          {...props}
        >
          <div className="flex items-start gap-4">
            {icon && (
              <div className="flex-shrink-0 mt-1">
                {icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="text-base font-medium text-gray-200 mb-1">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-sm text-gray-400">
                  {description}
                </p>
              )}
              {children}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={baseStyles}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;