export function normalizeMediaUrl(url?: string): string | undefined {
  if (!url || typeof url !== 'string') return url;
  try {
    const uploadsIndex = url.indexOf('/uploads/');

    // If absolute, rewrite localhost-based upload URLs to relative for Vite proxy
    if (/^https?:\/\//i.test(url)) {
      try {
        const u = new URL(url);
        const isLocalHost = /^(localhost|127\.0\.0\.1)$/i.test(u.hostname);
        if (isLocalHost && uploadsIndex !== -1) {
          const path = url.substring(uploadsIndex);
          return path.startsWith('/') ? path : `/${path}`;
        }
        // Non-local absolute URLs (e.g., Cloudinary) stay as-is
        return url;
      } catch {
        // If URL parsing fails, fall through to relative normalization
      }
    }

    // Normalize any relative path containing uploads
    if (uploadsIndex !== -1) {
      const path = url.substring(uploadsIndex);
      return path.startsWith('/') ? path : `/${path}`;
    }

    // Already relative and not an uploads path
    return url;
  } catch {
    return url;
  }
}