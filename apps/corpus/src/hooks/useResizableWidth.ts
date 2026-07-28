import { useCallback, useEffect, useState } from 'react';

type UseResizableWidthOptions = {
  min: number;
  max: number;
  defaultWidth: number;
  storageKey?: string;
};

export function useResizableWidth({
  min,
  max,
  defaultWidth,
  storageKey,
}: UseResizableWidthOptions) {
  const [width, setWidth] = useState(() => {
    if (!storageKey) return defaultWidth;
    const stored = localStorage.getItem(storageKey);
    if (!stored) return defaultWidth;
    const parsed = Number(stored);
    return Number.isFinite(parsed)
      ? Math.min(max, Math.max(min, parsed))
      : defaultWidth;
  });

  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, String(width));
    }
  }, [width, storageKey]);

  const onResizeStart = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      const startX = event.clientX;
      const startWidth = width;

      const onPointerMove = (moveEvent: PointerEvent): void => {
        const next = startWidth + (moveEvent.clientX - startX);
        setWidth(Math.min(max, Math.max(min, next)));
      };

      const onPointerUp = (): void => {
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
    },
    [width, min, max],
  );

  return { width, onResizeStart };
}
