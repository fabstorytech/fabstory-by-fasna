'use client';

import React, { useState, useEffect } from 'react';

export interface CloudinaryImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fill?: boolean;
  priority?: boolean;
  quality?: number | string;
  sizes?: string;
  unoptimized?: boolean;
  fallbackSrc?: string;
}

/**
 * Ensures Cloudinary images use direct CDN auto-formatting and auto-quality
 * (f_auto,q_auto) to maximize speed and minimize bandwidth, completely bypassing
 * Next.js / Vercel image optimization servers.
 */
export function getOptimizedCloudinaryUrl(url?: string): string {
  if (!url || typeof url !== 'string') return '/images/placeholder.jpg';

  // If it's a Cloudinary URL, inject direct CDN transformation
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    if (!url.includes('/upload/f_auto') && !url.includes('/upload/q_auto')) {
      return url.replace('/upload/', '/upload/f_auto,q_auto/');
    }
  }

  return url;
}

/**
 * Universal Direct Cloudinary Image Component.
 * Replaces Next.js <Image /> with zero-risk direct HTML <img> tags, loading directly
 * from Cloudinary global CDN with lazy loading and automatic placeholder fallback.
 */
export default function CloudinaryImage({
  src,
  alt = '',
  fill = false,
  priority = false,
  className = '',
  style,
  sizes,
  unoptimized,
  quality,
  fallbackSrc = '/images/placeholder.jpg',
  width,
  height,
  onError,
  ...rest
}: CloudinaryImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(() => getOptimizedCloudinaryUrl(src));

  useEffect(() => {
    setCurrentSrc(getOptimizedCloudinaryUrl(src));
  }, [src]);

  const combinedClassName = fill
    ? `absolute inset-0 w-full h-full ${className}`
    : className;

  return (
    <img
      src={currentSrc || fallbackSrc}
      alt={alt || ''}
      className={combinedClassName}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      style={style}
      onError={(e) => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
        if (onError) onError(e);
      }}
      {...rest}
    />
  );
}

// Named alias export for flexibility
export { CloudinaryImage as Image };

