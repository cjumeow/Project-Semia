import {
  SNIPPET_CHAT_BULLET_DRAG_MIME,
  serializeDragElements,
} from '@semia/shared';
import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { TextDots } from '../TextDots';
import type { SnippetChatMessage } from '../../hooks/useSnippetChat';
import { applyMultiBlockDragGhost } from './chatDragGhost';
import {
  ChatDragBlockSelectionProvider,
  useChatDragBlockSelection,
} from './ChatDragBlockSelection';

const BulletsDraggableContext = createContext(false);
/** Paragraphs inside `<li>` are not separate drag blocks — the list item is the container. */
const InsideListItemContext = createContext(false);

const draggableItemClass = 'semia-chat-drag-block';

const selectedItemClass = 'semia-chat-drag-block-selected';

function setDragMarkdownPayload(event: React.DragEvent, elements: HTMLElement[]) {
  const markdownText = serializeDragElements(elements);
  if (!markdownText) {
    event.preventDefault();
    return;
  }

  event.dataTransfer.setData(SNIPPET_CHAT_BULLET_DRAG_MIME, markdownText);
  event.dataTransfer.setData('text/plain', markdownText);
  event.dataTransfer.effectAllowed = 'copy';
  applyMultiBlockDragGhost(event, elements.length);
}

function useDraggableBlock<T extends HTMLElement>() {
  const bulletsDraggable = useContext(BulletsDraggableContext);
  const selection = useChatDragBlockSelection();
  const itemRef = useRef<T>(null);
  const blockIdRef = useRef<string | null>(null);

  if (bulletsDraggable && selection && blockIdRef.current === null) {
    blockIdRef.current = selection.allocateBlockId();
  }

  const blockId = blockIdRef.current;
  const selected =
    bulletsDraggable && blockId != null && selection?.isSelected(blockId);

  useLayoutEffect(() => {
    if (!selection || !blockId) {
      return;
    }
    selection.registerBlockElement(blockId, itemRef.current);
    return () => {
      selection.registerBlockElement(blockId, null);
    };
  }, [blockId, selection]);

  const className = bulletsDraggable
    ? [draggableItemClass, selected ? selectedItemClass : null]
        .filter(Boolean)
        .join(' ')
    : undefined;

  const dragHandlers = bulletsDraggable
    ? {
        draggable: true as const,
        onMouseDown: (event: React.MouseEvent) => {
          if (event.shiftKey || event.metaKey || event.ctrlKey) {
            event.preventDefault();
          }
        },
        onClick: (event: React.MouseEvent) => {
          if (!selection || !blockId) {
            return;
          }
          event.preventDefault();
          const multiSelect =
            event.shiftKey || event.metaKey || event.ctrlKey;
          selection.handleBlockClick(blockId, multiSelect);
        },
        onDragStart: (event: React.DragEvent) => {
          if (!selection || !blockId) {
            return;
          }
          event.stopPropagation();
          setDragMarkdownPayload(
            event,
            selection.getDragPayloadElements(blockId),
          );
        },
      }
    : {};

  return { itemRef, className, dragHandlers };
}

function MarkdownP({ children }: { children?: ReactNode }) {
  const insideLi = useContext(InsideListItemContext);
  if (insideLi) {
    return <p>{children}</p>;
  }

  const { itemRef, className, dragHandlers } =
    useDraggableBlock<HTMLParagraphElement>();

  return (
    <p ref={itemRef} className={className} {...dragHandlers}>
      {children}
    </p>
  );
}

function MarkdownLi({ children }: { children?: ReactNode }) {
  const { itemRef, className, dragHandlers } = useDraggableBlock<HTMLLIElement>();

  return (
    <InsideListItemContext.Provider value={true}>
      <li ref={itemRef} className={className} {...dragHandlers}>
        {children}
      </li>
    </InsideListItemContext.Provider>
  );
}

const markdownComponents = {
  table: ({ children }: { children?: ReactNode }) => (
    <div className="prose-chat-table-wrap">
      <table>{children}</table>
    </div>
  ),
  p: MarkdownP,
  li: MarkdownLi,
};

type DraggableAssistantMarkdownProps = {
  message: SnippetChatMessage;
};

export function DraggableAssistantMarkdown({
  message,
}: DraggableAssistantMarkdownProps) {
  const bulletsDraggable = !message.streaming;

  if (!message.content && message.streaming) {
    return (
      <span className="text-text-muted">
        <TextDots>Thinking</TextDots>
      </span>
    );
  }

  return (
    <ChatDragBlockSelectionProvider
      messageId={message.id}
      draggable={bulletsDraggable}
    >
      <div className="prose-chat text-sm leading-snug text-text">
        <BulletsDraggableContext.Provider value={bulletsDraggable}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {message.content}
          </ReactMarkdown>
        </BulletsDraggableContext.Provider>
        {message.streaming ? (
          <span
            aria-hidden
            className="ml-0.5 inline-block h-[1em] w-0.5 animate-pulse bg-text-muted align-[-0.1em]"
          />
        ) : null}
      </div>
    </ChatDragBlockSelectionProvider>
  );
}
