import { useState } from 'react';
import { DragModeToggle } from './DragModeToggle';
import type { DragModeSwitchVariantKey } from './dragModeSwitchVariants';

type DragBlock = {
  id: string;
  kind: 'p' | 'li';
  text: string;
  nested?: string[];
};

const MOCK_BLOCKS: DragBlock[] = [
  {
    id: 'intro',
    kind: 'p',
    text: '如果你想在英文裡自然提到「後端」，可以參考下面的口語與書面用法。',
  },
  {
    id: 'ol-1',
    kind: 'li',
    text: '口語用法',
    nested: ['直接說「後端」', '口語裡常省略 architecture'],
  },
  {
    id: 'ol-2',
    kind: 'li',
    text: '書面用法',
    nested: ['backend architecture', 'API debugging'],
  },
];

function blockClass(dragMode: boolean, selectedId: string | null, id: string) {
  if (!dragMode) {
    return undefined;
  }
  return [
    'semia-chat-drag-block',
    selectedId === id ? 'semia-chat-drag-block-selected' : null,
  ]
    .filter(Boolean)
    .join(' ');
}

type DragModeChatPreviewProps = {
  variant: DragModeSwitchVariantKey;
};

export function DragModeChatPreview({ variant }: DragModeChatPreviewProps) {
  const [dragMode, setDragMode] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>('ol-1');
  const [lastDragAttempt, setLastDragAttempt] = useState<string>('—');

  const bindBlock = (id: string) => {
    const handlers = {
      className: blockClass(dragMode, selectedId, id),
      draggable: dragMode,
      onClick: (event: React.MouseEvent) => {
        event.stopPropagation();
        if (dragMode) {
          setSelectedId(id);
        }
      },
      onDragStart: (event: React.DragEvent) => {
        if (!dragMode) {
          event.preventDefault();
          setLastDragAttempt('blocked (drag mode off)');
          return;
        }
        event.dataTransfer.setData('text/plain', `mock:${id}`);
        setLastDragAttempt(`started: ${id}`);
      },
    };
    return handlers;
  };

  return (
    <div className="drag-mode-proto mx-auto flex h-[min(720px,90vh)] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold text-text">AI assistant</p>
          <p className="truncate text-[11px] text-text-muted">
            Per-capture thread · grounding: backend
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <DragModeToggle
            variant={variant}
            enabled={dragMode}
            onChange={setDragMode}
          />
          <button
            type="button"
            className="shrink-0 rounded-md border border-border px-2.5 py-1 text-xs text-text-secondary"
          >
            Close
          </button>
        </div>
      </header>

      <div
        className="min-h-0 flex-1 overflow-y-auto px-4 py-4"
        onClick={() => dragMode && setSelectedId(null)}
      >
        <div className="mb-3 ml-auto max-w-[85%] rounded-xl bg-accent px-3 py-2 text-sm text-white">
          給我 number list with bullet sub list
        </div>

        <div className="max-w-[92%] rounded-xl bg-canvas px-3 py-2 text-sm text-text">
          <div className="prose-chat text-sm leading-snug text-text">
            <p {...bindBlock('intro')}>{MOCK_BLOCKS[0]!.text}</p>
            <ol>
              {MOCK_BLOCKS.filter((block) => block.kind === 'li').map((block) => (
                <li key={block.id} {...bindBlock(block.id)}>
                  {block.text}
                  {block.nested ? (
                    <ul>
                      {block.nested.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-border bg-canvas/80 px-4 py-2 font-mono text-[10px] text-text-muted">
        <p>
          drag mode: <strong className="text-text">{dragMode ? 'ON' : 'OFF'}</strong>
          {' · '}
          blocks draggable: <strong className="text-text">{dragMode ? 'yes' : 'no'}</strong>
          {' · '}
          selected: <strong className="text-text">{selectedId ?? '(none)'}</strong>
        </p>
        <p className="mt-0.5">last drag: {lastDragAttempt}</p>
      </div>
    </div>
  );
}
