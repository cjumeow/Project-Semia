import { describe, expect, it } from 'vitest';
import { isContextWindowEnabled } from './semiaSettings';

describe('isContextWindowEnabled', () => {
  it('defaults to enabled when setting is missing', () => {
    expect(isContextWindowEnabled()).toBe(true);
    expect(isContextWindowEnabled({})).toBe(true);
  });

  it('respects explicit false', () => {
    expect(isContextWindowEnabled({ contextWindowEnabled: false })).toBe(false);
  });

  it('respects explicit true', () => {
    expect(isContextWindowEnabled({ contextWindowEnabled: true })).toBe(true);
  });
});
