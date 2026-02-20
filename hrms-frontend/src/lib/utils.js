import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function getFileUrl(path) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    // Normalize path separators for Windows local uploads if any remain
    const normalizedPath = path.replace(/\\/g, '/');
    return `${import.meta.env.VITE_API_URL}/${normalizedPath}`;
}
