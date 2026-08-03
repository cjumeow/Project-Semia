import { describe, expect, it } from 'vitest';
import {
  nextPopoverOpenOnToggle,
  shouldDismissPopoverOnDocumentClick,
} from './subtitleSettingsPopover';

describe('shouldDismissPopoverOnDocumentClick', () => {
  it('does nothing when popover is closed', () => {
    expect(
      shouldDismissPopoverOnDocumentClick({
        popoverOpen: false,
        clickInsideHost: false,
      }),
    ).toBe(false);
  });

  it('dismisses on outside click while open', () => {
    expect(
      shouldDismissPopoverOnDocumentClick({
        popoverOpen: true,
        clickInsideHost: false,
      }),
    ).toBe(true);
  });

  it('keeps open when click is inside host (toggle path)', () => {
    expect(
      shouldDismissPopoverOnDocumentClick({
        popoverOpen: true,
        clickInsideHost: true,
      }),
    ).toBe(false);
  });
});

describe('nextPopoverOpenOnToggle', () => {
  it('toggles closed to open and open to closed', () => {
    expect(nextPopoverOpenOnToggle(false)).toBe(true);
    expect(nextPopoverOpenOnToggle(true)).toBe(false);
  });
});
