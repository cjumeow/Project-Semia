import type { ReactNode } from 'react';
import { SnippetChatFab, SnippetChatPanel } from './SnippetChatPanel';
import type { SnippetChatContextOption } from './snippet-chat/SnippetChatContextBanner';
import type { UseSnippetChatResult } from '../hooks/useSnippetChat';

type WorkspaceWithChatProps = {
  children: ReactNode;
  chat: UseSnippetChatResult;
  contextSnippets?: SnippetChatContextOption[];
  activeContextSnippetId?: string | null;
  onSelectContextSnippet?: (snippetId: string) => void;
};

export function WorkspaceWithChat({
  children,
  chat,
  contextSnippets,
  activeContextSnippetId,
  onSelectContextSnippet,
}: WorkspaceWithChatProps) {
  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div
        className={[
          'min-h-0 flex-1 overflow-hidden transition-opacity',
          chat.open ? 'pointer-events-none opacity-40' : '',
        ].join(' ')}
      >
        {children}
      </div>
      {!chat.open ? <SnippetChatFab onClick={chat.toggle} /> : null}
      {chat.open ? (
        <SnippetChatPanel
          chat={chat}
          onClose={chat.closeChat}
          contextSnippets={contextSnippets}
          activeContextSnippetId={activeContextSnippetId}
          onSelectContextSnippet={onSelectContextSnippet}
        />
      ) : null}
    </div>
  );
}
