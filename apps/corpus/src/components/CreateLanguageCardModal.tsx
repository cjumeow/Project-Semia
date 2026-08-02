import type { CardIntent, LanguageCard } from '@semia/shared';
import { useEffect, useState } from 'react';
import type { CorpusSnippet } from '../types/corpus';
import { TextDots } from './TextDots';
import { LanguageCardView, intentLabel } from './LanguageCardView';

type CreateLanguageCardModalProps = {
  open: boolean;
  snippet: CorpusSnippet | undefined;
  languageCardsProEnabled: boolean;
  showOnboarding: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onMarkOnboardingSeen: () => void;
  onCreate: (input: {
    focusText: string;
    intents: CardIntent[];
    learnerNote?: string;
  }) => Promise<LanguageCard>;
};

export function CreateLanguageCardModal({
  open,
  snippet,
  languageCardsProEnabled,
  showOnboarding,
  onClose,
  onOpenSettings,
  onMarkOnboardingSeen,
  onCreate,
}: CreateLanguageCardModalProps) {
  const [focusText, setFocusText] = useState('');
  const [intents, setIntents] = useState<CardIntent[]>(['speaking']);
  const [learnerNote, setLearnerNote] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCard, setCreatedCard] = useState<LanguageCard | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setFocusText('');
    setIntents(['speaking']);
    setLearnerNote('');
    setCreating(false);
    setError(null);
    setCreatedCard(null);
  }, [open, snippet?.id]);

  if (!open || !snippet) {
    return null;
  }

  const handleClose = (): void => {
    if (showOnboarding) {
      onMarkOnboardingSeen();
    }
    onClose();
  };

  const toggleIntent = (intent: CardIntent): void => {
    setIntents((current) => {
      if (current.includes(intent)) {
        const next = current.filter((value) => value !== intent);
        return next.length > 0 ? next : current;
      }
      return [...current, intent];
    });
  };

  const handleSubmit = async (): Promise<void> => {
    const trimmedFocus = focusText.trim();
    if (!trimmedFocus) {
      setError('Focus text is required.');
      return;
    }

    setCreating(true);
    setError(null);
    try {
      const card = await onCreate({
        focusText: trimmedFocus,
        intents,
        learnerNote: learnerNote.trim() || undefined,
      });
      if (showOnboarding) {
        onMarkOnboardingSeen();
      }
      setCreatedCard(card);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create language card.',
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-labelledby="create-language-card-title"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-surface p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        {!languageCardsProEnabled ? (
          <ProGatePanel onClose={handleClose} onOpenSettings={onOpenSettings} />
        ) : createdCard ? (
          <SuccessPanel card={createdCard} onClose={handleClose} />
        ) : (
          <>
            {showOnboarding ? (
              <div className="mb-4 rounded-lg border border-dashed border-accent/40 bg-accent-soft/40 p-4 text-sm leading-relaxed text-text-secondary">
                <p className="font-medium text-text">Language cards (Pro)</p>
                <p className="mt-1.5">
                  Snip notes explain the sentence. Language cards focus on{' '}
                  <em>what you</em> want to learn — one focus per card.
                </p>
              </div>
            ) : null}
            <h2
              id="create-language-card-title"
              className="font-display text-base font-semibold text-text"
            >
              Create language card
            </h2>
            <div className="mt-4 space-y-4">
              <div className="rounded-md bg-canvas px-3 py-2.5">
                <p className="text-[10px] font-medium uppercase tracking-wide text-text-muted">
                  From selection
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  {snippet.selectedText}
                </p>
              </div>
              <label className="block">
                <span className="text-[10px] font-medium uppercase tracking-wide text-text-muted">
                  Focus text *
                </span>
                <input
                  className="mt-1.5 w-full rounded-md border border-border bg-canvas px-3 py-2.5 text-sm text-text"
                  placeholder="What do you want to learn?"
                  value={focusText}
                  disabled={creating}
                  onChange={(event) => setFocusText(event.target.value)}
                  autoFocus
                />
              </label>
              <fieldset>
                <legend className="text-[10px] font-medium uppercase tracking-wide text-text-muted">
                  Intent
                </legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(['speaking', 'writing'] as const).map((intent) => {
                    const selected = intents.includes(intent);
                    return (
                      <label
                        key={intent}
                        className={[
                          'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
                          selected
                            ? 'border-accent/40 bg-accent-soft text-accent'
                            : 'border-border text-text-secondary hover:border-accent/30',
                        ].join(' ')}
                      >
                        <input
                          type="checkbox"
                          className="rounded border-border"
                          checked={selected}
                          disabled={creating}
                          onChange={() => toggleIntent(intent)}
                        />
                        {intentLabel(intent)}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              <label className="block">
                <span className="text-[10px] font-medium uppercase tracking-wide text-text-muted">
                  Note (optional)
                </span>
                <input
                  className="mt-1.5 w-full rounded-md border border-border bg-canvas px-3 py-2.5 text-sm text-text"
                  placeholder="One sentence about your goal"
                  value={learnerNote}
                  disabled={creating}
                  onChange={(event) => setLearnerNote(event.target.value)}
                />
              </label>
            </div>
            {error ? (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-canvas"
                onClick={handleClose}
                disabled={creating}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                onClick={() => void handleSubmit()}
                disabled={creating}
              >
                {creating ? <TextDots>Generating</TextDots> : 'Generate card'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ProGatePanel({
  onClose,
  onOpenSettings,
}: {
  onClose: () => void;
  onOpenSettings: () => void;
}) {
  return (
    <>
      <h2 className="font-display text-base font-semibold text-text">
        Language cards (Pro)
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        Language cards let you pick a specific focus from a capture and build a
        permanent study card with scenarios and examples. This feature is part
        of Semia Pro.
      </p>
      <p className="mt-3 text-sm text-text-muted">
        Enable the Pro preview in Settings to try card creation locally.
      </p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          className="rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-canvas"
          onClick={onClose}
        >
          Close
        </button>
        <button
          type="button"
          className="rounded-md border border-accent/30 bg-accent-soft px-3 py-2 text-sm font-medium text-accent"
          onClick={() => {
            onClose();
            onOpenSettings();
          }}
        >
          Open Settings
        </button>
      </div>
    </>
  );
}

function SuccessPanel({
  card,
  onClose,
}: {
  card: LanguageCard;
  onClose: () => void;
}) {
  return (
    <>
      <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
        Language card created for &ldquo;{card.focusText}&rdquo;.
      </p>
      <div className="mt-4">
        <LanguageCardView card={card} />
      </div>
      <div className="mt-5 flex justify-end">
        <button
          type="button"
          className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-white"
          onClick={onClose}
        >
          Done
        </button>
      </div>
    </>
  );
}
