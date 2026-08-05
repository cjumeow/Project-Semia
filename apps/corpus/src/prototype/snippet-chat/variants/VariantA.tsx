/** A — Chat covers the entire middle column when open. */
import {
  ChatFab,
  ChatPanelBody,
  ChatPanelHeader,
  SnippetListColumn,
  ThreeColumnShell,
} from '../prototypeShared';
import type { SnippetChatPrototypeState } from '../useSnippetChatPrototypeState';

export function VariantA({ state }: { state: SnippetChatPrototypeState }) {
  return (
    <ThreeColumnShell state={state} variantLabel="A — Full-bleed overlay">
      <SnippetListColumn state={state} dimmed={state.chatOpen} />
      <ChatFab open={state.chatOpen} onClick={state.toggleChat} />
      {state.chatOpen ? (
        <div className="absolute inset-0 z-10 flex flex-col bg-surface">
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
