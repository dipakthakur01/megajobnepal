export function normalizeMediaUrl(url?: string): string | undefined {
  if (!url || typeof url !== 'string') return url;
  try {
    // Prefer same-origin proxy for local uploads
    const uploadsIndex = url.indexOf('/uploads/');
    if (uploadsIndex !== -1) {
      const path = url.substring(uploadsIndex);
      return path.startsWith('/') ? path : `/${path}`;
    }
    // Already relative
    if (url.startsWith('/uploads')) return url;
    return url;
  } catch {
    return url;
  }
}