import { SNIPPET_CHAT_BULLET_DRAG_MIME } from '@semia/shared';
import {
  createContext,
  useContext,
  useRef,
  type ReactNode,
} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { TextDots } from '../TextDots';
import type { SnippetChatMessage } from '../../hooks/useSnippetChat';

const MarkdownListDepthContext = createContext(0);
const BulletsDraggableContext = createContext(false);

function MarkdownUl({ children }: { children?: ReactNode }) {
  const depth = useContext(MarkdownListDepthContext);
  return (
    <MarkdownListDepthContext.Provider value={depth + 1}>
      <ul>{children}</ul>
    </MarkdownListDepthContext.Provider>
  );
}

function MarkdownLi({ children }: { children?: ReactNode }) {
  const depth = useContext(MarkdownListDepthContext);
  const bulletsDraggable = useContext(BulletsDraggableContext);
  const itemRef = useRef<HTMLLIElement>(null);
  const isTopLevelBullet = depth === 1;
  const draggable = bulletsDraggable && isTopLevelBullet;

  return (
    <li
      ref={itemRef}
      draggable={draggable}
      className={
        draggable
          ? 'cursor-grab rounded-md border border-transparent px-1 -mx-1 transition-colors hover:border-accent/30 hover:bg-accent/5 active:cursor-grabbing'
          : undefined
      }
      onDragStart={(event) => {
        if (!draggable) {
          return;
        }
        const text = itemRef.current?.textContent?.trim() ?? '';
        if (!text) {
          event.preventDefault();
          return;
        }
        event.dataTransfer.setData(SNIPPET_CHAT_BULLET_DRAG_MIME, text);
        event.dataTransfer.setData('text/plain', text);
        event.dataTransfer.effectAllowed = 'copy';
      }}
    >
      {children}
    </li>
  );
}

const markdownComponents = {
  table: ({ children }: { children?: ReactNode }) => (
    <div className="prose-chat-table-wrap">
      <table>{children}</table>
    </div>
  ),
  ul: MarkdownUl,
  li: MarkdownLi,
};

type DraggableAssistantMarkdownProps = {
  message: SnippetChatMessage;
};

export function DraggableAssistantMarkdown({
  message,
}: DraggableAssistantMarkdownProps) {
  if (!message.content && message.streaming) {
    return (
      <span className="text-text-muted">
        <TextDots>Thinking</TextDots>
      </span>
    );
  }

  return (
    <div className="prose-chat text-sm leading-snug text-text">
      <BulletsDraggableContext.Provider value={!message.streaming}>
        <MarkdownListDepthContext.Provider value={0}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {message.content}
          </ReactMarkdown>
        </MarkdownListDepthContext.Provider>
      </BulletsDraggableContext.Provider>
      {message.streaming ? (
        <span
          aria-hidden
          className="ml-0.5 inline-block h-[1em] w-0.5 animate-pulse bg-text-muted align-[-0.1em]"
        />
      ) : null}
    </div>
  );
}
