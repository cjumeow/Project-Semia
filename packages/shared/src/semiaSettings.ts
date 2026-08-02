import type { SemiaSettings } from './types';

/** Context window is on by default; only an explicit `false` disables it. */
export function isContextWindowEnabled(settings?: SemiaSettings): boolean {
  return settings?.contextWindowEnabled !== false;
}
