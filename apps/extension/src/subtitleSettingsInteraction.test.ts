import { describe, expect, it } from 'vitest';
import { shouldIgnoreDocumentDismiss } from './subtitleSettingsInteraction';

describe('shouldIgnoreDocumentDismiss', () => {
  it('ignores dismiss during the open guard window', () => {
    expect(
      shouldIgnoreDocumentDismiss({
        openedAtMs: 1_000,
        nowMs: 1_200,
        guardMs: 300,
      }),
    ).toBe(true);
  });

  it('allows dismiss after the guard window', () => {
    expect(
      shouldIgnoreDocumentDismiss({
        openedAtMs: 1_000,
        nowMs: 1_400,
        guardMs: 300,
      }),
    ).toBe(false);
  });
});
