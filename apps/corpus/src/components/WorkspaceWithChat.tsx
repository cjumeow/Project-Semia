import type { ReactNode } from 'react';
import { SnippetChatFab, SnippetChatPanel } from './SnippetChatPanel';
import type { UseSnippetChatResult } from '../hooks/useSnippetChat';

type WorkspaceWithChatProps = {
  children: ReactNode;
  chat: UseSnippetChatResult;
};

export function WorkspaceWithChat({ children, chat }: WorkspaceWithChatProps) {
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
        <SnippetChatPanel chat={chat} onClose={() => chat.setOpen(false)} />
      ) : null}
    </div>
  );
}
