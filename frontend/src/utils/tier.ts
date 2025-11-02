// Utilities for normalizing job tiers across the app

export type CanonicalTier = 'megajob' | 'premium' | 'prime' | 'latest' | 'newspaper' | undefined;

export function normalizeTier(tier?: string | null): CanonicalTier {
  if (!tier) return undefined;
  const t = tier.toLowerCase();
  switch (t) {
    case 'megajob':
    case 'mega_job':
      return 'megajob';
    case 'premium':
    case 'premium_job':
      return 'premium';
    case 'prime':
    case 'prime_job':
      return 'prime';
    case 'latest':
    case 'latest_job':
      return 'latest';
    case 'newspaper':
    case 'newspaper_job':
      return 'newspaper';
    default:
      return undefined;
  }
}

export function isMegaJob(tier?: string | null): boolean {
  return normalizeTier(tier) === 'megajob';
}

export function getTierLabel(tier?: string | null, config?: Record<string, { label?: string }>): string {
  const t = normalizeTier(tier);
  const fromConfig = t && config && config[t]?.label;
  if (fromConfig && typeof fromConfig === 'string') return fromConfig;
  switch (t) {
    case 'megajob':
      return 'MegaJob';
    case 'premium':
      return 'Premium';
    case 'prime':
      return 'Prime';
    case 'newspaper':
      return 'Newspaper';
    case 'latest':
    default:
      return 'Latest';
  }
}

export function getTierBadgeClass(tier?: string | null, config?: Record<string, { badgeClass?: string }>): string | undefined {
  const t = normalizeTier(tier);
  const cls = t && config && config[t]?.badgeClass;
  return cls || undefined;
}

export function getTierTextClass(tier?: string | null, config?: Record<string, { textClass?: string }>): string | undefined {
  const t = normalizeTier(tier);
  const cls = t && config && config[t]?.textClass;
  return cls || undefined;
}

export function getTierBgClass(tier?: string | null, config?: Record<string, { bgClass?: string }>): string | undefined {
  const t = normalizeTier(tier);
  const cls = t && config && config[t]?.bgClass;
  return cls || undefined;
}