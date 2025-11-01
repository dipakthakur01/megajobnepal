// Legacy compatibility layer - now using MongoDB
// This file exports types and utilities for backwards compatibility

// Re-export all types from the new types file
export * from './types';

// Backwards compatibility exports
export { withTimeout } from './types';
