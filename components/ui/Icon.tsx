import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Home,
  Users,
  BarChart3,
  type LucideProps,
  Search,
  CircleAlert
} from 'lucide-react';

interface IconProps extends LucideProps {
  name?: keyof typeof IconMap;
}

const IconMap = {
  Home,
  Users,
  BarChart3,
  Search,
  CircleAlert
  // Add more Lucide icons as needed
} as const;

const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ name, size = 24, strokeWidth = 1.5, className, ...props }, ref) => {
    if (name) {
      const LucideIcon = IconMap[name];
      return (
        <LucideIcon
          ref={ref}
          size={size}
          strokeWidth={strokeWidth}
          className={cn('text-gray-400', className)}
          {...props}
        />
      );
    }

    // Default case for custom SVG icons
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn('text-gray-400', className)}
        {...props}
      />
    );
  }
);

// Custom app icons using forwardRef
export const HomeIcon = React.forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, strokeWidth = 2, className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('text-gray-400', className)}
      {...props}
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
);

export const AgentsIcon = React.forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, strokeWidth = 2, className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('text-gray-400', className)}
      {...props}
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
);

export const AutomationsIcon = React.forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, strokeWidth = 2, className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('text-gray-400', className)}
      {...props}
    >
      <path d="M18 20V10" />
      <path d="M12 20V4" />
      <path d="M6 20v-6" />
    </svg>
  )
);

// Add display names for better debugging
Icon.displayName = 'Icon';
HomeIcon.displayName = 'HomeIcon';
AgentsIcon.displayName = 'AgentsIcon';
AutomationsIcon.displayName = 'AutomationsIcon';

export default Icon;