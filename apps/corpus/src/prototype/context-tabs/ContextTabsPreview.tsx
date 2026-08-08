import { useState } from 'react';
import {
  CONTEXT_TABS_MOCK_CHAT,
  CONTEXT_TABS_MOCK_SNIPPETS,
} from './contextTabsMockData';
import type { ContextTabsVariantKey } from './contextTabsVariants';
import {
  VariantAContextSwitcher,
  VariantADetailTabBar,
  VariantBContextSwitcher,
  VariantBDetailTabBar,
  VariantCContextSwitcher,
  VariantCDetailTabBar,
} from './contextTabsVariantComponents';
import { SnipContextWindowStub } from '../shared/SnipContextWindowStub';
import {
  GoldenCompactChatHeader,
  StickyContextBanner,
  VariantGoldenDetailTabBar,
} from './goldenLayoutComponents';

type ContextTabsPreviewProps = {
  variant: ContextTabsVariantKey;
};

function isGoldenVariant(variant: ContextTabsVariantKey): variant is 'D' | 'E' | 'F' {
  return variant === 'D' || variant === 'E' || variant === 'F';
}

function DragModeStub() {
  return (
    <div
      className="flex rounded-lg border border-border bg-canvas p-0.5"
      role="group"
      aria-label="Chat interaction mode"
    >
      <span className="rounded-md bg-surface px-2.5 py-1 text-[11px] font-medium text-text shadow-sm">
        Read
      </span>
      <span className="rounded-md px-2.5 py-1 text-[11px] font-medium text-text-muted">
        Drag
      </span>
    </div>
  );
}

function LanguageCardStub() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-border bg-canvas px-4 py-2">
        <p className="text-xs text-text-secondary">
          <span className="font-medium text-accent">Draft</span>
          <span className="text-text-muted"> — building new card</span>
        </p>
      </div>
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2 text-[11px] text-text-muted">
        <span>Saved</span>
        <button
          type="button"
          className="rounded-md bg-accent px-3 py-1 text-xs font-medium text-white"
        >
          Create
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-text">Focus</p>
            <button
              type="button"
              className="rounded-md border border-border px-2.5 py-1 text-[11px] text-text-secondary"
            >
              Pick from capture
            </button>
          </div>
          <p className="mt-3 font-reading text-sm text-text-muted">
            Card fields would appear here…
          </p>
        </div>
      </div>
    </div>
  );
}

function SnipCardStub() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-4">
      <p className="font-reading text-lg text-text">
        {CONTEXT_TABS_MOCK_SNIPPETS[0]?.selectedText}
      </p>
      <p className="mt-2 text-sm text-text-secondary">
        Natural translation preview — meaning would appear here in the real note.
      </p>
      <div className="mt-4">
        <SnipContextWindowStub />
      </div>
    </div>
  );
}

function ChatMessages({ longThread }: { longThread: boolean }) {
  return (
    <ul className="flex flex-col gap-3">
      <li className="ml-auto max-w-[92%] rounded-xl bg-accent px-3 py-2 text-sm leading-relaxed text-white">
        What does &quot;context&quot; mean in this sentence?
      </li>
      <li className="max-w-[92%] rounded-xl bg-canvas px-3 py-2 text-sm text-text">
        <div className="prose-chat whitespace-pre-wrap text-sm leading-snug">
          {CONTEXT_TABS_MOCK_CHAT.assistantReply}
        </div>
      </li>
      {longThread
        ? CONTEXT_TABS_MOCK_CHAT.extraMessages.map((message, index) => (
            <li
              key={`${message.role}-${index}`}
              className={[
                'max-w-[92%] rounded-xl px-3 py-2 text-sm',
                message.role === 'user'
                  ? 'ml-auto bg-accent leading-relaxed text-white'
                  : 'bg-canvas text-text',
              ].join(' ')}
            >
              <div className="prose-chat whitespace-pre-wrap text-sm leading-snug">
                {message.content}
              </div>
            </li>
          ))
        : null}
    </ul>
  );
}

export function ContextTabsPreview({ variant }: ContextTabsPreviewProps) {
  const [detailTab, setDetailTab] = useState<'snip' | 'language'>('language');
  const [activeSnippetId, setActiveSnippetId] = useState(
    CONTEXT_TABS_MOCK_SNIPPETS[0]?.id ?? 's1',
  );

  const golden = isGoldenVariant(variant);

  const DetailTabBar = golden
    ? VariantGoldenDetailTabBar
    : variant === 'A'
      ? VariantADetailTabBar
      : variant === 'B'
        ? VariantBDetailTabBar
        : VariantCDetailTabBar;

  const ContextSwitcher =
    variant === 'A'
      ? VariantAContextSwitcher
      : variant === 'B'
        ? VariantBContextSwitcher
        : VariantCContextSwitcher;

  const chatHeader = golden ? (
    <GoldenCompactChatHeader />
  ) : variant === 'C' ? (
    <>
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold text-text">
            AI assistant
          </p>
          <p className="text-[11px] text-text-muted">Global thread</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <DragModeStub />
          <button
            type="button"
            className="shrink-0 rounded-md border border-border px-2.5 py-1 text-xs text-text-secondary"
          >
            Close
          </button>
        </div>
      </div>
      <div className="border-t border-border bg-canvas/70 px-4 py-2.5">
        <ContextSwitcher
          snippets={CONTEXT_TABS_MOCK_SNIPPETS}
          activeSnippetId={activeSnippetId}
          onSelectSnippet={setActiveSnippetId}
        />
      </div>
    </>
  ) : (
    <div className="flex items-start justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="font-display text-sm font-semibold text-text">AI assistant</p>
        <p className="truncate text-[11px] text-text-muted">
          Global thread · grounding:{' '}
          <span className="text-text-secondary">
            {CONTEXT_TABS_MOCK_SNIPPETS.find((s) => s.id === activeSnippetId)
              ?.selectedText ?? ''}
          </span>
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <DragModeStub />
        <ContextSwitcher
          snippets={CONTEXT_TABS_MOCK_SNIPPETS}
          activeSnippetId={activeSnippetId}
          onSelectSnippet={setActiveSnippetId}
        />
        <button
          type="button"
          className="shrink-0 rounded-md border border-border px-2.5 py-1 text-xs text-text-secondary"
        >
          Close
        </button>
      </div>
    </div>
  );

  const bannerMode =
    variant === 'D' ? 'expanded' : variant === 'E' ? 'collapsed' : 'compact';

  return (
    <div className="mx-auto flex h-[min(720px,calc(100vh-8rem))] max-w-6xl overflow-hidden rounded-2xl border border-border bg-canvas shadow-xl">
      <section className="flex min-w-0 flex-[1.1] flex-col border-r border-border bg-surface">
        <DetailTabBar activeTab={detailTab} onTabChange={setDetailTab} />
        {detailTab === 'snip' ? <SnipCardStub /> : <LanguageCardStub />}
      </section>

      <section className="flex min-w-0 flex-1 flex-col bg-surface">
        <header className="shrink-0 border-b border-border">{chatHeader}</header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {golden ? (
            <StickyContextBanner
              snippets={CONTEXT_TABS_MOCK_SNIPPETS}
              activeSnippetId={activeSnippetId}
              onSelectSnippet={setActiveSnippetId}
              mode={bannerMode}
            />
          ) : null}
          <ChatMessages longThread={golden} />
        </div>
        <form className="flex shrink-0 gap-2 border-t border-border p-4">
          <input
            type="text"
            readOnly
            value=""
            placeholder="Ask anything…"
            className="min-w-0 flex-1 rounded-lg border border-border bg-canvas px-3 py-2 text-sm text-text placeholder:text-text-muted"
          />
          <button
            type="button"
            className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white opacity-50"
          >
            Send
          </button>
        </form>
      </section>
    </div>
  );
}
