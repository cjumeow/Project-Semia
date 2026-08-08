import { useCallback, useEffect, useState, type RefObject } from 'react';

export type FocusSelectionAnchor = {
  text: string;
  top: number;
  left: number;
};

function selectionAnchorFromRange(): FocusSelectionAnchor | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return null;
  }

  const text = selection.toString().trim();
  if (!text) {
    return null;
  }

  const rect = selection.getRangeAt(0).getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    return null;
  }

  return {
    text,
    top: rect.top,
    left: rect.left + rect.width / 2,
  };
}

export function useFocusTextSelection(
  containerRef: RefObject<HTMLElement | null>,
  popoverRef: RefObject<HTMLElement | null>,
) {
  const [anchor, setAnchor] = useState<FocusSelectionAnchor | null>(null);

  const clearAnchor = useCallback(() => {
    setAnchor(null);
  }, []);

  const handleDoubleClick = useCallback(() => {
    const next = selectionAnchorFromRange();
    if (next) {
      setAnchor(next);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    const next = selectionAnchorFromRange();
    if (next) {
      setAnchor(next);
    }
  }, []);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) {
        return;
      }
      if (popoverRef.current?.contains(target)) {
        return;
      }
      setAnchor(null);
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [containerRef, popoverRef]);

  return {
    anchor,
    clearAnchor,
    handleDoubleClick,
    handleMouseUp,
  };
}
