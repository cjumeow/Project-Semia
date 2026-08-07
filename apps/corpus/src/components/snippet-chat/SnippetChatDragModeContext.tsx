import { createContext, useContext, type ReactNode } from 'react';

const SnippetChatDragModeContext = createContext(false);

export function SnippetChatDragModeProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) {
  return (
    <SnippetChatDragModeContext.Provider value={enabled}>
      {children}
    </SnippetChatDragModeContext.Provider>
  );
}

export function useSnippetChatDragMode(): boolean {
  return useContext(SnippetChatDragModeContext);
}
