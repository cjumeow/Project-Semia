import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { applyBlockClickSelection, eventTargetsChatDragBlock } from './chatDragSelection';

type ChatDragBlockSelectionContextValue = {
  draggable: boolean;
  allocateBlockId: () => string;
  isSelected: (blockId: string) => boolean;
  handleBlockClick: (blockId: string, multiSelect: boolean) => void;
  clearSelection: () => void;
  registerBlockElement: (blockId: string, element: HTMLElement | null) => void;
  getDragPayloadElements: (initiatorId: string) => HTMLElement[];
};

const ChatDragBlockSelectionContext =
  createContext<ChatDragBlockSelectionContextValue | null>(null);

export function useChatDragBlockSelection(): ChatDragBlockSelectionContextValue | null {
  return useContext(ChatDragBlockSelectionContext);
}

type ChatDragBlockSelectionProviderProps = {
  messageId: string;
  draggable: boolean;
  children: ReactNode;
};

export function ChatDragBlockSelectionProvider({
  messageId,
  draggable,
  children,
}: ChatDragBlockSelectionProviderProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const blockOrderRef = useRef<string[]>([]);
  const blockIndexRef = useRef(0);
  const blockElementsRef = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    blockIndexRef.current = 0;
    blockOrderRef.current = [];
    setSelectedIds(new Set());
  }, [messageId]);

  const allocateBlockId = useCallback(() => {
    const id = `${messageId}:${blockIndexRef.current}`;
    blockIndexRef.current += 1;
    blockOrderRef.current.push(id);
    return id;
  }, [messageId]);

  const handleBlockClick = useCallback((blockId: string, multiSelect: boolean) => {
    setSelectedIds((current) =>
      applyBlockClickSelection(current, blockId, multiSelect),
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  useEffect(() => {
    if (!draggable) {
      setSelectedIds(new Set());
    }
  }, [draggable]);

  useEffect(() => {
    if (!draggable || selectedIds.size === 0) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (eventTargetsChatDragBlock(event)) {
        return;
      }
      setSelectedIds(new Set());
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [draggable, selectedIds.size]);

  const registerBlockElement = useCallback(
    (blockId: string, element: HTMLElement | null) => {
      if (element) {
        blockElementsRef.current.set(blockId, element);
        return;
      }
      blockElementsRef.current.delete(blockId);
    },
    [],
  );

  const getDragPayloadElements = useCallback(
    (initiatorId: string) => {
      const order = blockOrderRef.current;
      const ids = selectedIds.has(initiatorId)
        ? order.filter((id) => selectedIds.has(id))
        : [initiatorId];

      return ids
        .map((id) => blockElementsRef.current.get(id))
        .filter((element): element is HTMLElement => element != null);
    },
    [selectedIds],
  );

  const isSelected = useCallback(
    (blockId: string) => selectedIds.has(blockId),
    [selectedIds],
  );

  const value = useMemo(
    () => ({
      draggable,
      allocateBlockId,
      isSelected,
      handleBlockClick,
      clearSelection,
      registerBlockElement,
      getDragPayloadElements,
    }),
    [
      draggable,
      allocateBlockId,
      isSelected,
      handleBlockClick,
      clearSelection,
      registerBlockElement,
      getDragPayloadElements,
    ],
  );

  if (!draggable) {
    return (
      <ChatDragBlockSelectionContext.Provider value={value}>
        {children}
      </ChatDragBlockSelectionContext.Provider>
    );
  }

  return (
    <ChatDragBlockSelectionContext.Provider value={value}>
      {children}
    </ChatDragBlockSelectionContext.Provider>
  );
}
