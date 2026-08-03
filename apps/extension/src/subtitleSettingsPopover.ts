export type PopoverDismissReason = 'outside-click' | 'toggle' | 'close-button';

/** Outside-click should not run on the same click that opens via toggle. */
export function shouldDismissPopoverOnDocumentClick(options: {
  popoverOpen: boolean;
  clickInsideHost: boolean;
}): boolean {
  if (!options.popoverOpen) return false;
  return !options.clickInsideHost;
}

export function nextPopoverOpenOnToggle(currentOpen: boolean): boolean {
  return !currentOpen;
}
