import React, { useState, useRef, useEffect } from 'react';
import imageManifest from '../image-manifest.json';

/**
 * OptimizedImage - High-performance image component with blur-up loading effect.
 * 
 * Features:
 * - Serves optimized WebP images in the right size (thumb/medium/full)
 * - Shows a tiny blurred placeholder instantly while the real image loads
 * - Smooth fade-in transition when the full image is ready
 * - Proper width/height to prevent layout shift (CLS)
 * - Native lazy loading for off-screen images
 * 
 * @param {string} src - Original image path (e.g., "/images/rocenta.png")
 * @param {string} alt - Alt text for accessibility
 * @param {string} size - "thumb" | "medium" | "full" (default: "thumb")
 * @param {string} className - CSS class for the <img> element
 * @param {object} style - Inline styles
 * @param {boolean} eager - If true, loads immediately (for above-fold images)
 */
export default function OptimizedImage({ 
  src, 
  alt, 
  size = 'thumb', 
  className = '', 
  style = {},
  eager = false,
  ...rest 
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef(null);

  // Look up optimized version from manifest
  const manifest = imageManifest[src];

  // If no optimized version exists, fall back to original
  if (!manifest) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={style}
        loading={eager ? 'eager' : 'lazy'}
        {...rest}
      />
    );
  }

  const optimizedSrc = manifest[size] || manifest.thumb;

  // Build srcset for responsive loading
  const srcSet = [
    manifest.thumb && `${manifest.thumb} 400w`,
    manifest.medium && `${manifest.medium} 800w`,
    manifest.full && `${manifest.full} 1200w`,
  ].filter(Boolean).join(', ');

  // Sizes hint based on the requested size
  const sizesAttr = size === 'thumb' 
    ? '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px'
    : size === 'medium'
    ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px'
    : '(max-width: 640px) 100vw, 1200px';

  // Check if image is already cached (loaded from browser cache)
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, []);

  return (
    <div className={`optimized-img-container ${isLoaded ? 'loaded' : ''}`}>
      {/* Blur placeholder - shown instantly */}
      <img
        src={manifest.placeholder}
        alt=""
        aria-hidden="true"
        className="optimized-img-placeholder"
      />
      {/* Real optimized image */}
      <img
        ref={imgRef}
        src={optimizedSrc}
        srcSet={srcSet}
        sizes={sizesAttr}
        alt={alt}
        className={`optimized-img-real ${className}`}
        style={style}
        loading={eager ? 'eager' : 'lazy'}
        fetchpriority={eager ? 'high' : undefined}
        width={manifest.width}
        height={manifest.height}
        onLoad={() => setIsLoaded(true)}
        {...rest}
      />
    </div>
  );
}
