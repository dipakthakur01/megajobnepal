// Design System Configuration
// This file contains all the design tokens and utilities for consistent UI

export const colors = {
  // Primary Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Secondary Colors
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  
  // Job Tier Colors
  tiers: {
    megajob: {
      bg: 'bg-gradient-to-r from-yellow-500 to-amber-500',
      text: 'text-yellow-600',
      bgLight: 'bg-yellow-50',
      border: 'border-yellow-200',
    },
    premium: {
      bg: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      text: 'text-blue-600',
      bgLight: 'bg-blue-50',
      border: 'border-blue-200',
    },
    prime: {
      bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
      text: 'text-green-600',
      bgLight: 'bg-green-50',
      border: 'border-green-200',
    },
    latest: {
      bg: 'bg-gradient-to-r from-purple-500 to-pink-500',
      text: 'text-purple-600',
      bgLight: 'bg-purple-50',
      border: 'border-purple-200',
    },
    newspaper: {
      bg: 'bg-gradient-to-r from-orange-500 to-red-500',
      text: 'text-orange-600',
      bgLight: 'bg-orange-50',
      border: 'border-orange-200',
    },
  },
  
  // Status Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

export const spacing = {
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem',   // 96px
};

export const typography = {
  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },
  
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  lineHeights: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
};

// Component Variants
export const buttonVariants = {
  primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white',
  secondary: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
  success: 'bg-green-600 hover:bg-green-700 text-white',
  warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
};

export const cardVariants = {
  default: 'bg-white border border-gray-200 shadow-sm',
  elevated: 'bg-white border-0 shadow-lg',
  outlined: 'bg-white border-2 border-gray-200',
  gradient: 'bg-gradient-to-br from-white to-gray-50 border border-gray-200',
};

// Utility Functions
export const getTierStyles = (tier: string) => {
  return colors.tiers[tier as keyof typeof colors.tiers] || colors.tiers.latest;
};

export const getStatusColor = (status: 'success' | 'warning' | 'error' | 'info') => {
  return colors[status];
};

// Animation Presets
export const animations = {
  fadeIn: 'animate-in fade-in duration-200',
  slideIn: 'animate-in slide-in-from-bottom-4 duration-300',
  scaleIn: 'animate-in zoom-in-95 duration-200',
  slideUp: 'animate-in slide-in-from-bottom-8 duration-500',
};

// Responsive Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Grid System
export const grid = {
  cols: {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  },
  gaps: {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  },
};

// Common Component Styles
export const commonStyles = {
  input: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
  button: 'px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
  card: 'bg-white rounded-lg border border-gray-200 shadow-sm',
  badge: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
};

export default {
  colors,
  spacing,
  typography,
  shadows,
  borderRadius,
  buttonVariants,
  cardVariants,
  getTierStyles,
  getStatusColor,
  animations,
  breakpoints,
  grid,
  commonStyles,
};