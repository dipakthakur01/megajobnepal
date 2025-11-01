import React, { useState } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  enableCacheBusting?: boolean;
}

// Add cache busting to image URLs to ensure updated images are loaded
const addCacheBusting = (url: string, enableCacheBusting: boolean = true): string => {
  if (!enableCacheBusting || !url) return url;
  
  try {
    const urlObj = new URL(url);
    // Only add cache busting for our own domain or relative URLs
    if (urlObj.hostname === window.location.hostname || url.startsWith('/')) {
      urlObj.searchParams.set('t', Date.now().toString());
      return urlObj.toString();
    }
  } catch (e) {
    // If URL parsing fails, try simple append for relative URLs
    if (url.startsWith('/')) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}t=${Date.now()}`;
    }
  }
  
  return url;
};

export function ImageWithFallback(props: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  const { src, alt, style, className, fallbackSrc, enableCacheBusting = true, ...rest } = props

  // Apply cache busting to both main src and fallback
  const cacheBustedSrc = src ? addCacheBusting(src, enableCacheBusting) : src;
  const cacheBustedFallback = fallbackSrc ? addCacheBusting(fallbackSrc, enableCacheBusting) : fallbackSrc;

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img 
          src={cacheBustedFallback || ERROR_IMG_SRC} 
          alt={alt || 'Image unavailable'} 
          className={className} 
          {...rest} 
          data-original-url={src} 
        />
      </div>
    </div>
  ) : (
    <img src={cacheBustedSrc} alt={alt} className={className} style={style} {...rest} onError={handleError} />
  )
}
