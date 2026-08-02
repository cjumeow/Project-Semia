import type { DeleteButtonStyle } from './deleteButtonTypes';
import { DeleteButton } from './DeleteButton';

export function DeletePrototypePresentation({
  style,
}: {
  style: DeleteButtonStyle;
}) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-canvas">
      <div className="mx-auto max-w-3xl px-6 py-10 pb-28">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-text-muted">
          Delete control prototype
        </p>
        <h1 className="mt-2 font-reading text-3xl font-semibold tracking-tight text-text">
          {style.label}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary">
          {style.description}
        </p>

        <section className="mt-10 rounded-2xl border border-border bg-surface p-10 shadow-sm">
          <p className="semia-section-label mb-8">Isolated</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <DeleteButton style={style}>Delete</DeleteButton>
            <DeleteButton style={style} disabled>
              Delete
            </DeleteButton>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <p className="semia-section-label border-b border-border px-5 py-3">
            Source workspace header
          </p>
          <header className="flex items-start justify-between gap-4 bg-surface/80 px-5 py-4">
            <div className="min-w-0">
              <h2 className="font-display line-clamp-2 text-base font-semibold leading-snug text-text">
                Feynman Lectures on Physics — Vol. I
              </h2>
              <p className="mt-1 text-xs text-text-muted">feynmanlectures.caltech.edu</p>
            </div>
            <DeleteButton style={style} className="shrink-0">
              Delete source
            </DeleteButton>
          </header>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <p className="semia-section-label border-b border-border px-5 py-3">
            Snippet detail (keyboard hint)
          </p>
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <p className="text-sm text-text-secondary">
              Press <kbd className="rounded border border-border bg-canvas px-1.5 py-0.5 font-mono text-[10px]">⌫</kbd>{' '}
              to delete selected snippet
            </p>
            <DeleteButton style={style}>Delete</DeleteButton>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-[#ebe5db] p-6">
          <p className="semia-section-label mb-4">On shelf background</p>
          <DeleteButton style={style}>Delete source</DeleteButton>
        </section>
      </div>
    </div>
  );
}
