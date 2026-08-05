import type { LanguageCard } from '@semia/shared';
import type { ReactNode } from 'react';
import { LanguageCardView } from '../../components/LanguageCardView';
import { ResizeHandle } from '../../components/ResizeHandle';
import { useResizableWidth } from '../../hooks/useResizableWidth';
import type { CorpusSnippet } from '../../types/corpus';
import type { SnippetChatPrototypeState } from './useSnippetChatPrototypeState';

export function usePrototypeLayoutWidths() {
  const sidebar = useResizableWidth({
    min: 160,
    max: 480,
    defaultWidth: 240,
    storageKey: 'semia-proto-snippet-chat-sidebar',
    edge: 'end',
  });
  const detail = useResizableWidth({
    min: 280,
    max: 640,
    defaultWidth: 400,
    storageKey: 'semia-proto-snippet-chat-detail',
    edge: 'start',
  });
  return { sidebar, detail };
}

export function PrototypeSidebar({
  snippets,
  selectedSnippetId,
  onSelectSnippet,
}: {
  snippets: CorpusSnippet[];
  selectedSnippetId: string | null;
  onSelectSnippet: (id: string | null) => void;
}) {
  return (
    <aside className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-3">
        <p className="font-display text-sm font-semibold text-text">semia</p>
        <p className="text-[10px] text-text-muted">Prototype — snippet chat</p>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        <button
          type="button"
          className={[
            'mb-1 w-full rounded-md px-2.5 py-2 text-left text-xs font-medium',
            selectedSnippetId === null
              ? 'semia-margin-active text-accent'
              : 'text-text-secondary hover:bg-black/[0.04]',
          ].join(' ')}
          onClick={() => onSelectSnippet(null)}
        >
          General chat
        </button>
        <p className="px-2.5 pb-1 pt-3 text-[10px] font-medium uppercase tracking-wide text-text-muted">
          Library
        </p>
        {snippets.map((snippet) => (
          <button
            key={snippet.id}
            type="button"
            className={[
              'my-0.5 w-full rounded-md px-2.5 py-2 text-left text-xs transition-colors',
              snippet.id === selectedSnippetId
                ? 'semia-margin-active text-accent'
                : 'text-text-secondary hover:bg-black/[0.04] hover:text-text',
            ].join(' ')}
            onClick={() => onSelectSnippet(snippet.id)}
          >
            <span className="block truncate font-medium">{snippet.selectedText}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

export function SnippetListColumn({
  state,
  dimmed = false,
}: {
  state: SnippetChatPrototypeState;
  dimmed?: boolean;
}) {
  return (
    <div
      className={[
        'flex min-h-0 flex-1 flex-col overflow-hidden transition-opacity',
        dimmed ? 'pointer-events-none opacity-40' : '',
      ].join(' ')}
    >
      <header className="shrink-0 border-b border-border bg-surface/80 px-5 py-4">
        <p className="text-[10px] font-medium uppercase tracking-wide text-text-muted">
          Library
        </p>
        <h2 className="font-display line-clamp-2 text-base font-semibold text-text">
          Gary Gallagher: American Civil War…
        </h2>
      </header>
      <ul className="min-h-0 flex-1 overflow-y-auto px-5 py-4" role="listbox">
        {state.snippets.map((snippet) => (
          <li key={snippet.id} role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={snippet.id === state.selectedSnippetId}
              className={[
                'mb-1 flex w-full items-center gap-3 rounded-md border-l-[3px] border-transparent py-2.5 pl-[calc(0.75rem-3px)] pr-3 text-left',
                snippet.id === state.selectedSnippetId
                  ? 'semia-margin-active text-text'
                  : 'text-text-secondary hover:bg-surface/60',
              ].join(' ')}
              onClick={() => state.selectSnippet(snippet.id)}
            >
              <span className="shrink-0 font-mono text-xs tabular-nums text-text-muted">
                {String(snippet.anchor.kind === 'youtube' ? snippet.anchor.startSeconds : 0).padStart(2, '0')}:00
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {snippet.selectedText}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RightDetailColumn({
  state,
  width,
}: {
  state: SnippetChatPrototypeState;
  width: number;
}) {
  const snippet = state.selectedSnippet;

  if (!snippet) {
    return (
      <section
        className="flex h-full shrink-0 items-center justify-center border-l border-border bg-surface"
        style={{ width }}
      >
        <p className="px-6 text-center text-sm text-text-muted">
          Select a snippet to view its note and language cards.
        </p>
      </section>
    );
  }

  return (
    <section
      className="flex h-full shrink-0 flex-col overflow-y-auto border-l border-border bg-surface"
      style={{ width }}
    >
      <header className="sticky top-0 z-10 border-b border-border bg-surface/95 px-5 py-4 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-reading min-w-0 text-xl font-semibold text-text">
            {snippet.selectedText}
          </h2>
          {state.cardsForSnippet.length > 0 ? (
            <button
              type="button"
              className="shrink-0 rounded-full border border-border bg-canvas px-2 py-0.5 text-[10px] tabular-nums text-text-secondary hover:underline"
              onClick={() => state.setCardListModalOpen(true)}
            >
              {state.cardsForSnippet.length} cards
            </button>
          ) : null}
        </div>
      </header>

      <div className="flex flex-col gap-5 p-5">
        <NotePreview snippet={snippet} />
        {state.cardsForSnippet.length > 0 ? (
          <LinkedCardsSection state={state} />
        ) : null}
      </div>

      {state.cardListModalOpen ? (
        <CardListModalStub
          cards={state.cardsForSnippet}
          onClose={() => state.setCardListModalOpen(false)}
        />
      ) : null}
    </section>
  );
}

function NotePreview({ snippet }: { snippet: CorpusSnippet }) {
  return (
    <article className="semia-note-card">
      <dl className="flex flex-col gap-4">
        <Field label="Original Speech" value={snippet.note.originalSpeech} reading />
        <Field label="Natural Translation" value={snippet.note.naturalTranslation} zh />
        <Field label="Background Note" value={snippet.note.backgroundNote} zh multiline />
      </dl>
      <div className="semia-context-collapsed mt-4">
        <div className="px-4 py-3.5 text-sm font-medium text-text">Context window</div>
      </div>
    </article>
  );
}

function Field({
  label,
  value,
  reading,
  zh,
  multiline,
}: {
  label: string;
  value: string;
  reading?: boolean;
  zh?: boolean;
  multiline?: boolean;
}) {
  return (
    <div>
      <dt className="semia-section-label">{label}</dt>
      <dd
        className={[
          'mt-1.5 text-sm leading-relaxed text-text',
          reading ? 'font-reading' : '',
          zh ? 'semia-field-zh text-text-secondary' : '',
          multiline ? 'whitespace-pre-line' : '',
        ].join(' ')}
      >
        {value}
      </dd>
    </div>
  );
}

function LinkedCardsSection({ state }: { state: SnippetChatPrototypeState }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="semia-section-label">Language cards</h3>
      <ul className="flex flex-col gap-2">
        {state.cardsForSnippet.map((card) => (
          <li key={card.id}>
            <button
              type="button"
              className={[
                'w-full rounded-xl border p-4 text-left transition-colors',
                state.expandedCardId === card.id
                  ? 'border-accent/40 bg-accent-soft/20'
                  : 'border-border bg-surface hover:border-accent/30',
              ].join(' ')}
              onClick={() => state.expandCard(card.id)}
            >
              <p className="font-reading text-sm font-semibold text-text">{card.focus}</p>
              <p className="semia-field-zh mt-1 text-sm text-text-secondary">{card.meaning}</p>
            </button>
            {state.expandedCardId === card.id ? (
              <div className="mt-2 rounded-xl border border-border bg-canvas p-4">
                <LanguageCardView card={card} />
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function CardListModalStub({
  cards,
  onClose,
}: {
  cards: LanguageCard[];
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-xl"
        role="dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-base font-semibold">Card list modal (stub)</h3>
        <p className="mt-2 text-sm text-text-muted">
          Production: top-right badge keeps this popup. Tile clicks use inline expand below.
        </p>
        <ul className="mt-4 space-y-2">
          {cards.map((c) => (
            <li key={c.id} className="text-sm text-text">
              {c.focus} — {c.meaning}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="mt-4 text-xs text-text-muted hover:text-text"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export function ChatFab({
  open,
  onClick,
}: {
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={[
        'absolute bottom-5 right-5 z-20 flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium shadow-lg transition-colors',
        open
          ? 'border border-border bg-surface text-text-secondary'
          : 'bg-accent text-white hover:bg-accent/90',
      ].join(' ')}
      onClick={onClick}
    >
      {open ? 'Close chat' : 'AI assistant'}
    </button>
  );
}

export function ChatPanelBody({ state }: { state: SnippetChatPrototypeState }) {
  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {state.activeMessages.length === 0 ? (
          <p className="text-sm text-text-muted">
            {state.selectedSnippet
              ? 'Ask about this snippet — context is attached automatically.'
              : 'General tutor mode. Select a snippet to attach note + context.'}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {state.activeMessages.map((msg) => (
              <li
                key={msg.id}
                className={[
                  'max-w-[90%] rounded-xl px-3 py-2 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'ml-auto bg-accent text-white'
                    : 'bg-canvas text-text',
                ].join(' ')}
              >
                {msg.content}
              </li>
            ))}
          </ul>
        )}
      </div>

      {state.selectedSnippet ? (
        <div className="flex shrink-0 flex-wrap gap-2 border-t border-border px-4 py-2">
          {state.suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] text-text-secondary hover:border-accent/30"
              onClick={() => state.sendMessage(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
      ) : null}

      <form
        className="flex shrink-0 gap-2 border-t border-border p-4"
        onSubmit={(event) => {
          event.preventDefault();
          state.sendMessage(state.draft);
        }}
      >
        <input
          type="text"
          value={state.draft}
          placeholder="Ask anything…"
          className="min-w-0 flex-1 rounded-lg border border-border bg-canvas px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          onChange={(event) => state.setDraft(event.target.value)}
        />
        <button
          type="submit"
          className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white"
        >
          Send
        </button>
      </form>
    </>
  );
}

export function ChatPanelHeader({
  contextLabel,
  onClose,
}: {
  contextLabel: string;
  onClose: () => void;
}) {
  return (
    <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
      <div className="min-w-0">
        <p className="font-display text-sm font-semibold text-text">AI assistant</p>
        <p className="truncate text-[11px] text-text-muted">
          context: <span className="text-text-secondary">{contextLabel}</span>
        </p>
      </div>
      <button
        type="button"
        className="shrink-0 text-xs text-text-muted hover:text-text"
        onClick={onClose}
      >
        Close
      </button>
    </header>
  );
}

export function StateFooter({
  state,
  variantLabel,
}: {
  state: SnippetChatPrototypeState;
  variantLabel: string;
}) {
  return (
    <footer className="pointer-events-none absolute inset-x-0 bottom-16 z-10 px-4">
      <p className="mx-auto max-w-2xl rounded-lg border border-border bg-surface/95 px-3 py-2 text-center font-mono text-[10px] leading-relaxed text-text-muted shadow-sm">
        <span className="font-semibold text-text">{variantLabel}</span>
        <span> · {state.stateSummary}</span>
      </p>
    </footer>
  );
}

export function ThreeColumnShell({
  state,
  variantLabel,
  children,
}: {
  state: SnippetChatPrototypeState;
  variantLabel: string;
  children: ReactNode;
}) {
  const { sidebar, detail } = usePrototypeLayoutWidths();

  return (
    <>
      <div
        className="flex h-full shrink-0 flex-col border-r border-border bg-shelf"
        style={{ width: sidebar.width }}
      >
        <PrototypeSidebar
          snippets={state.snippets}
          selectedSnippetId={state.selectedSnippetId}
          onSelectSnippet={state.selectSnippet}
        />
      </div>

      <ResizeHandle onResizeStart={sidebar.onResizeStart} />

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-canvas">
        {children}
        <StateFooter state={state} variantLabel={variantLabel} />
      </div>

      <ResizeHandle onResizeStart={detail.onResizeStart} />

      <RightDetailColumn state={state} width={detail.width} />
    </>
  );
}
