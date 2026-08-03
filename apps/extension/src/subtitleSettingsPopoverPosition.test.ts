import { describe, expect, it } from 'vitest';
import { computePopoverFixedPosition } from './subtitleSettingsPopoverPosition';

describe('computePopoverFixedPosition', () => {
  it('places popover above the anchor aligned to the right edge', () => {
    const position = computePopoverFixedPosition({
      anchor: { top: 500, right: 900, bottom: 536, left: 864 },
      popoverWidth: 288,
      popoverHeight: 220,
      viewportWidth: 1280,
      viewportHeight: 720,
      gap: 8,
    });

    expect(position.left).toBe(612);
    expect(position.top).toBe(272);
  });

  it('flips below the anchor when there is no room above', () => {
    const position = computePopoverFixedPosition({
      anchor: { top: 20, right: 400, bottom: 56, left: 364 },
      popoverWidth: 288,
      popoverHeight: 220,
      viewportWidth: 1280,
      viewportHeight: 720,
    });

    expect(position.top).toBe(64);
  });
});
