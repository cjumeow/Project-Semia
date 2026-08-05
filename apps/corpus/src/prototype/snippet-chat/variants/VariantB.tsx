/** B — Chat docks to the right edge of the middle column; list peeks on the left. */
import {
  ChatFab,
  ChatPanelBody,
  ChatPanelHeader,
  SnippetListColumn,
  ThreeColumnShell,
} from '../prototypeShared';
import type { SnippetChatPrototypeState } from '../useSnippetChatPrototypeState';

export function VariantB({ state }: { state: SnippetChatPrototypeState }) {
  return (
    <ThreeColumnShell state={state} variantLabel="B — Right-docked copilot">
      <SnippetListColumn state={state} />
      <ChatFab open={state.chatOpen} onClick={state.toggleChat} />
      {state.chatOpen ? (
        <div className="absolute inset-y-0 right-0 z-10 flex w-[58%] min-w-[280px] flex-col border-l border-border bg-surface shadow-[-8px_0_24px_rgba(28,25,23,0.06)]">
          <ChatPanelHeader
            contextLabel={state.contextLabel}
            onClose={() => state.setChatOpen(false)}
          />
          <ChatPanelBody state={state} />
        </div>
      ) : null}
    </ThreeColumnShell>
  );
}
