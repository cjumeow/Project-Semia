export type RectLike = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

/** Fixed popover placement above the anchor button, clamped to the viewport. */
export function computePopoverFixedPosition(options: {
  anchor: RectLike;
  popoverWidth: number;
  popoverHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  gap?: number;
}): { top: number; left: number } {
  const gap = options.gap ?? 8;
  const {
    anchor,
    popoverWidth,
    popoverHeight,
    viewportWidth,
    viewportHeight,
  } = options;

  let left = anchor.right - popoverWidth;
  left = Math.max(8, Math.min(left, viewportWidth - popoverWidth - 8));

  let top = anchor.top - popoverHeight - gap;
  if (top < 8) {
    top = anchor.bottom + gap;
  }
  top = Math.max(8, Math.min(top, viewportHeight - popoverHeight - 8));

  return { top, left };
}
