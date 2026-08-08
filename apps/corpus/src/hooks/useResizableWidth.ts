import { useCallback, useRef, useState } from 'react';

type ResizeEdge = 'start' | 'end';

type UseResizableWidthOptions = {
  min: number;
  max: number;
  defaultWidth: number;
  storageKey?: string;
  /** `end` = drag handle on the right (sidebar). `start` = handle on the left (detail panel). */
  edge?: ResizeEdge;
};

function readStoredWidth(
  storageKey: string | undefined,
  defaultWidth: number,
  min: number,
  max: number,
): number {
  if (!storageKey) return defaultWidth;
  const stored = localStorage.getItem(storageKey);
  if (!stored) return defaultWidth;
  const parsed = Number(stored);
  return Number.isFinite(parsed)
    ? Math.min(max, Math.max(min, parsed))
    : defaultWidth;
}

function clampWidth(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function useResizableWidth({
  min,
  max,
  defaultWidth,
  storageKey,
  edge = 'end',
}: UseResizableWidthOptions) {
  const [width, setWidth] = useState(() =>
    readStoredWidth(storageKey, defaultWidth, min, max),
  );
  const [isResizing, setIsResizing] = useState(false);

  const widthRef = useRef(width);
  widthRef.current = width;

  const containerRef = useRef<HTMLElement | null>(null);

  const setContainerRef = useCallback((node: HTMLElement | null) => {
    containerRef.current = node;
    if (node) {
      node.style.width = `${widthRef.current}px`;
    }
  }, []);

  const commitWidth = useCallback(
    (next: number): void => {
      const clamped = clampWidth(next, min, max);
      widthRef.current = clamped;
      setWidth(clamped);
      if (storageKey) {
        localStorage.setItem(storageKey, String(clamped));
      }
    },
    [min, max, storageKey],
  );

  const onResizeStart = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      const startX = event.clientX;
      const startWidth = widthRef.current;

      setIsResizing(true);

      const applyLiveWidth = (raw: number): number => {
        const clamped = clampWidth(raw, min, max);
        widthRef.current = clamped;
        if (containerRef.current) {
          containerRef.current.style.width = `${clamped}px`;
        }
        return clamped;
      };

      const onPointerMove = (moveEvent: PointerEvent): void => {
        const delta = moveEvent.clientX - startX;
        const next =
          edge === 'end' ? startWidth + delta : startWidth - delta;
        applyLiveWidth(next);
      };

      const onPointerUp = (): void => {
        commitWidth(widthRef.current);
        setIsResizing(false);

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
    [commitWidth, edge, min, max],
  );

  return { width, onResizeStart, setContainerRef, isResizing };
}
