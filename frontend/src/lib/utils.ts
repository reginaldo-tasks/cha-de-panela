import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert a couple name to a URL-friendly slug
 * Example: "Iara & Ramon" -> "iara-ramon"
 */
export function generateSlug(coupleName: string): string {
  return coupleName
    .toLowerCase() // convert to lowercase
    .trim() // remove leading/trailing whitespace
    .replace(/&/g, '') // remove ampersands
    .replace(/[^\w\s-]/g, '') // remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/-+/g, '-') // replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // remove leading/trailing hyphens
}
