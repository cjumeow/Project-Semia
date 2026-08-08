import { useCallback, useEffect, useState, type RefObject } from 'react';

export type FocusSelectionAnchor = {
  text: string;
  top: number;
  left: number;
};

/** Pick a visible rect for a DOM range; falls back when bounding box is empty. */
export function anchorRectFromRange(range: Range): DOMRect | null {
  const bounding = range.getBoundingClientRect();
  if (bounding.width > 0 || bounding.height > 0) {
    return bounding;
  }

  const clientRects = Array.from(range.getClientRects()).filter(
    (rect) => rect.width > 0 || rect.height > 0,
  );
  if (clientRects.length === 0) {
    return null;
  }

  return clientRects[clientRects.length - 1];
}

function selectionAnchorFromRange(): FocusSelectionAnchor | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return null;
  }

  const text = selection.toString().trim();
  if (!text) {
    return null;
  }

  const anchorRect = anchorRectFromRange(selection.getRangeAt(0));
  if (!anchorRect) {
    return null;
  }

  return {
    text,
    top: anchorRect.top,
    left: anchorRect.left + anchorRect.width / 2,
  };
}

function selectionIsInsideContainer(
  container: HTMLElement,
  selection: Selection,
): boolean {
  const anchorNode = selection.anchorNode;
  const focusNode = selection.focusNode;
  return (
    (anchorNode !== null && container.contains(anchorNode)) ||
    (focusNode !== null && container.contains(focusNode))
  );
}

export function useFocusTextSelection(
  containerRef: RefObject<HTMLElement | null>,
  popoverRef: RefObject<HTMLElement | null>,
) {
  const [anchor, setAnchor] = useState<FocusSelectionAnchor | null>(null);

  const clearAnchor = useCallback(() => {
    setAnchor(null);
  }, []);

  const syncAnchorFromSelection = useCallback(() => {
    const next = selectionAnchorFromRange();
    if (next) {
      setAnchor(next);
    }
  }, []);

  const handleDoubleClick = useCallback(() => {
    syncAnchorFromSelection();
  }, [syncAnchorFromSelection]);

  const handleMouseUp = useCallback(() => {
    syncAnchorFromSelection();
  }, [syncAnchorFromSelection]);

  useEffect(() => {
    let mouseDown = false;

    const onMouseDown = () => {
      mouseDown = true;
    };

    const onMouseUp = () => {
      mouseDown = false;
    };

    const onSelectionChange = () => {
      if (mouseDown) {
        return;
      }

      const selection = window.getSelection();
      const container = containerRef.current;
      if (!selection || selection.isCollapsed || !container) {
        return;
      }
      if (!selectionIsInsideContainer(container, selection)) {
        return;
      }

      syncAnchorFromSelection();
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('selectionchange', onSelectionChange);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('selectionchange', onSelectionChange);
    };
  }, [containerRef, syncAnchorFromSelection]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (popoverRef.current?.contains(target)) {
        return;
      }
      if (containerRef.current?.contains(target)) {
        if (anchor) {
          setAnchor(null);
          window.getSelection()?.removeAllRanges();
        }
        return;
      }
      setAnchor(null);
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [anchor, containerRef, popoverRef]);

  return {
    anchor,
    clearAnchor,
    handleDoubleClick,
    handleMouseUp,
  };
}
