// Utility helpers for className merging and tailwind utilities.
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * `cn` merges Tailwind/utility class strings and removes duplicates.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
