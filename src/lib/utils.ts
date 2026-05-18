import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the correct URL for an uploaded file.
 * Handles backward compatibility with old /uploads/ paths
 * by converting them to the new /api/files/ serving route.
 */
export function getFileUrl(filePath: string | null | undefined): string {
  if (!filePath) return ''

  // Data URLs (from FileReader) - return as-is
  if (filePath.startsWith('data:')) return filePath

  // Blob URLs (from URL.createObjectURL) - return as-is
  if (filePath.startsWith('blob:')) return filePath

  // Absolute URLs (http/https) - return as-is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath

  // New format: /api/files/xxx - return as-is
  if (filePath.startsWith('/api/files/')) return filePath

  // Old format: /uploads/xxx - convert to /api/files/xxx
  if (filePath.startsWith('/uploads/')) {
    const filename = filePath.replace('/uploads/', '')
    return `/api/files/${filename}`
  }

  // Fallback: return as-is
  return filePath
}
