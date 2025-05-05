import React from 'react';
import { cn } from '@/lib/utils';

// Types
interface DropdownMenuProps {
  children: React.ReactNode;
  className?: string;
}

interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  align?: 'start' | 'end' | 'center';
}

interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

// Context
type DropdownMenuContextType = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const DropdownMenuContext = React.createContext<DropdownMenuContextType | undefined>(undefined);

function useDropdownMenuContext() {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('Dropdown components must be used within a DropdownMenu');
  }
  return context;
}

// Components
export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children, className }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen }}>
      <div ref={dropdownRef} className={cn('relative inline-block text-left', className)}>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
};

export const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ children, className, ...props }, ref) => {
    const { setIsOpen } = useDropdownMenuContext();

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium',
          'transition-colors focus-visible:outline-none focus-visible:ring-1',
          'focus-visible:ring-gray-400',
          className
        )}
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
        {...props}
      >
        {children}
      </button>
    );
  }
);
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

export const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ children, className, align = 'end', ...props }, ref) => {
    const { isOpen } = useDropdownMenuContext();

    if (!isOpen) return null;

    return (
      <div
        ref={ref}
        className={cn(
          'absolute z-50 min-w-[8rem] rounded-md border border-gray-700',
          'bg-gray-900 p-1 shadow-lg',
          'animate-in fade-in-0 zoom-in-95',
          {
            'right-0': align === 'end',
            'left-0': align === 'start',
            'left-1/2 -translate-x-1/2': align === 'center',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DropdownMenuContent.displayName = 'DropdownMenuContent';

export const DropdownMenuItem = React.forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  ({ children, className, ...props }, ref) => {
    const { setIsOpen } = useDropdownMenuContext();

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'flex w-full items-center rounded-sm px-2 py-1.5 text-sm',
          'text-gray-200 outline-none transition-colors',
          'hover:bg-gray-800 focus:bg-gray-800',
          className
        )}
        onClick={(e) => {
          props.onClick?.(e);
          setIsOpen(false);
        }}
        {...props}
      >
        {children}
      </button>
    );
  }
);
DropdownMenuItem.displayName = 'DropdownMenuItem';