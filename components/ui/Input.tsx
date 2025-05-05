'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  maxLength?: number;
  showCount?: boolean;
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onEnter?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className,
    type = 'text',
    maxLength,
    showCount,
    error,
    leftIcon,
    rightIcon,
    disabled,
    value = '',
    onEnter,
    onKeyDown,
    ...props 
  }, ref) => {
    // Handle key events
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onEnter) {
        onEnter();
      }
      onKeyDown?.(e);
    };

    const inputStyles = cn(
      // Base styles
      'flex-1 w-full bg-gray-900/50 text-gray-100',
      'placeholder:text-gray-500',
      'outline-none focus:ring-1',
      'transition-shadow duration-200',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      // Conditional styles for error and focus states
      error 
        ? 'ring-1 ring-red-500 focus:ring-red-500' 
        : 'focus:ring-gray-600',
      // Padding based on icon presence
      leftIcon ? 'pl-10' : 'pl-4',
      rightIcon ? 'pr-10' : 'pr-4',
      // Height and rounding
      'h-12 rounded-lg',
      className
    );

    const wrapperStyles = cn(
      'relative flex items-center group',
      disabled && 'opacity-50 cursor-not-allowed'
    );

    const iconStyles = cn(
      'absolute flex items-center justify-center',
      'w-10 h-full text-gray-400'
    );

    return (
      <div className="w-full space-y-1">
        <div className={wrapperStyles}>
          {leftIcon && (
            <div className={cn(iconStyles, 'left-0')}>
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            type={type}
            value={value}
            disabled={disabled}
            maxLength={maxLength}
            className={inputStyles}
            onKeyDown={handleKeyDown}
            {...props}
          />

          {rightIcon && (
            <div className={cn(iconStyles, 'right-0')}>
              {rightIcon}
            </div>
          )}
        </div>

        {showCount && maxLength && (
          <div className="flex justify-end">
            <span className="text-xs text-gray-500">
              {String(value).length}/{maxLength}
            </span>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;