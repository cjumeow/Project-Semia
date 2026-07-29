import { migrateFragment } from './migrateFragment';
import type { LanguageFragment } from './types';

function collectRawFragments(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return Object.values(value);
  return [];
}

/** Accept array or legacy object-map storage shapes; migrate on read. */
export function normalizeFragments(value: unknown): LanguageFragment[] {
  return collectRawFragments(value)
    .map(migrateFragment)
    .filter((fragment): fragment is LanguageFragment => fragment !== null);
}
