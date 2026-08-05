/** C — Middle column splits vertically: snippet list on top, chat panel on bottom. */
import {
  ChatFab,
  ChatPanelBody,
  ChatPanelHeader,
  SnippetListColumn,
  ThreeColumnShell,
} from '../prototypeShared';
import type { SnippetChatPrototypeState } from '../useSnippetChatPrototypeState';

export function VariantC({ state }: { state: SnippetChatPrototypeState }) {
  return (
    <ThreeColumnShell state={state} variantLabel="C — Split middle column">
      {state.chatOpen ? (
        <>
          <div className="flex min-h-0 flex-[0_0_38%] flex-col overflow-hidden border-b border-border">
            <SnippetListColumn state={state} />
          </div>
          <div className="flex min-h-0 flex-1 flex-col bg-surface">
            <ChatPanelHeader
              contextLabel={state.contextLabel}
              onClose={() => state.setChatOpen(false)}
            />
            <ChatPanelBody state={state} />
          </div>
        </>
      ) : (
        <>
          <SnippetListColumn state={state} />
          <ChatFab open={state.chatOpen} onClick={state.toggleChat} />
        </>
      )}
    </ThreeColumnShell>
  );
}
