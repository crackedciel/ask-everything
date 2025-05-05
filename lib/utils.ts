import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines multiple class names using clsx and tailwind-merge
 * This ensures proper handling of Tailwind CSS classes and prevents conflicts
 * @param inputs - Array of class names or conditional class objects
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Delays execution for specified milliseconds
 * @param ms - Number of milliseconds to delay
 * @returns Promise that resolves after the delay
 */
export const delay = (ms: number) => new Promise(res => setTimeout(res, ms))

/**
 * Formats a date to a human-readable string
 * @param date - Date to format
 * @returns Formatted date string
 */
export const formatDate = (input: string | Date | number): string => {
  try {
    // Handle different input types
    let date: Date;
    
    if (input instanceof Date) {
      date = input;
    } else if (typeof input === 'string') {
      // Handle ISO strings and other date string formats
      date = new Date(input);
    } else if (typeof input === 'number') {
      // Handle timestamps
      date = new Date(input);
    } else {
      throw new Error('Invalid date input type');
    }

    // Validate if the date is valid
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date value');
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch (error) {
    // You can customize the error handling based on your needs
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Checks if a string is a valid URL
 * @param str - String to check
 * @returns Boolean indicating if string is a valid URL
 */
export const isValidUrl = (str: string): boolean => {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}

/**
 * Truncates a string to a specified length
 * @param str - String to truncate
 * @param length - Maximum length
 * @returns Truncated string with ellipsis
 */
export const truncate = (str: string, length: number): string => {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

/**
 * Formats a wallet address for display
 * @param address - Wallet address to format
 * @returns Formatted wallet address
 */
export const formatAddress = (address: string) => {
  const isEvm = address.startsWith("0x");

  if (address.length <= 10) {
    return address;
  }

  const start = address.substring(0, isEvm ? 5 : 4);
  const end = address.substring(address.length - 4);

  return `${start}...${end}`;
};
