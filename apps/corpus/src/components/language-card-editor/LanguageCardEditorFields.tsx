import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import type { FocusKeywordCandidate } from '@semia/shared';
import {
  isLanguageCardOptionalFieldKey,
  type LanguageCardDraftContent,
  type LanguageCardEditorSlotKey,
  type LanguageCardOptionalFieldKey,
} from '@semia/shared';
import type { CorpusSnippet } from '../../types/corpus';
import type { BaseFormSuggestionView } from '../../hooks/useBaseFormSuggestion';
import { CardFieldEditor, type CardFieldEditorHandle } from './CardFieldEditor';
import { FieldSuggestionChip } from './FieldSuggestionChip';
import { FocusKeywordChips } from './FocusKeywordChips';
import { FocusSpeechPanel } from './FocusSpeechPanel';
import { focusKeywordCursorClasses } from './focusKeywordCursorStyle';
import { LanguageCardSlotDropZone } from './LanguageCardSlotDropZone';
import { OptionalFieldChipAdders } from './OptionalFieldChipAdders';

const RICH_TEXT_SLOTS = new Set<LanguageCardEditorSlotKey>([
  'meaning',
  'example',
  'usageNote',
  'dialogue',
  'pitfalls',
  'personalNote',
]);

type LanguageCardEditorFieldsProps = {
  snippet?: CorpusSnippet;
  content: LanguageCardDraftContent;
  disabled?: boolean;
  showFocusAssist?: boolean;
  focusKeywordCandidates?: FocusKeywordCandidate[];
  focusKeywordsLoading?: boolean;
  focusKeywordsEnabled?: boolean;
  baseFormSuggestion?: BaseFormSuggestionView;
  onChange: (patch: Partial<LanguageCardDraftContent>) => void;
  onToggleOptionalField: (
    field: LanguageCardOptionalFieldKey,
    enabled: boolean,
  ) => void;
  onAppendSlot?: (slot: LanguageCardEditorSlotKey, text: string) => void;
};

export function LanguageCardEditorFields({
  snippet,
  content,
  disabled = false,
  showFocusAssist = false,
  focusKeywordCandidates = [],
  focusKeywordsLoading = false,
  focusKeywordsEnabled = false,
  baseFormSuggestion,
  onChange,
  onToggleOptionalField,
  onAppendSlot,
}: LanguageCardEditorFieldsProps) {
  const [speechPanelOpen, setSpeechPanelOpen] = useState(false);
  const cursorClasses = focusKeywordCursorClasses();
  const dropEnabled = Boolean(onAppendSlot) && !disabled;

  const meaningRef = useRef<CardFieldEditorHandle>(null);
  const exampleRef = useRef<CardFieldEditorHandle>(null);
  const usageNoteRef = useRef<CardFieldEditorHandle>(null);
  const dialogueRef = useRef<CardFieldEditorHandle>(null);
  const pitfallsRef = useRef<CardFieldEditorHandle>(null);
  const personalNoteRef = useRef<CardFieldEditorHandle>(null);
  const pendingAppendRef = useRef<{
    slot: LanguageCardEditorSlotKey;
    text: string;
  } | null>(null);

  const editorRefs: Record<
    LanguageCardOptionalFieldKey,
    RefObject<CardFieldEditorHandle | null>
  > = {
    example: exampleRef,
    usageNote: usageNoteRef,
    dialogue: dialogueRef,
    pitfalls: pitfallsRef,
    personalNote: personalNoteRef,
  };

  const editorRefForSlot = (
    slot: LanguageCardEditorSlotKey,
  ): RefObject<CardFieldEditorHandle | null> | null => {
    switch (slot) {
      case 'meaning':
        return meaningRef;
      case 'example':
        return exampleRef;
      case 'usageNote':
        return usageNoteRef;
      case 'dialogue':
        return dialogueRef;
      case 'pitfalls':
        return pitfallsRef;
      case 'personalNote':
        return personalNoteRef;
      default:
        return null;
    }
  };

  const insertIntoRichSlot = (
    slot: LanguageCardEditorSlotKey,
    text: string,
  ): boolean => {
    const editorRef = editorRefForSlot(slot);
    if (!editorRef?.current) {
      return false;
    }
    editorRef.current.insertMarkdown(text);
    return true;
  };

  const handleAppend = (slot: LanguageCardEditorSlotKey, text: string) => {
    if (!RICH_TEXT_SLOTS.has(slot)) {
      onAppendSlot?.(slot, text);
      return;
    }

    if (
      isLanguageCardOptionalFieldKey(slot) &&
      !content.enabledOptionalFields.includes(slot)
    ) {
      onToggleOptionalField(slot, true);
      pendingAppendRef.current = { slot, text };
      return;
    }

    if (!insertIntoRichSlot(slot, text)) {
      onAppendSlot?.(slot, text);
    }
  };

  useEffect(() => {
    const pending = pendingAppendRef.current;
    if (!pending) {
      return;
    }

    if (insertIntoRichSlot(pending.slot, pending.text)) {
      pendingAppendRef.current = null;
    }
  }, [content.enabledOptionalFields, content.optionalSlots]);

  useEffect(() => {
    setSpeechPanelOpen(false);
  }, [snippet?.id]);

  const pickFocusText = (text: string) => {
    baseFormSuggestion?.markFocusTextPicked();
    onChange({ focusText: text });
  };

  const wrapDrop = (
    slot: LanguageCardEditorSlotKey,
    node: ReactNode,
    className?: string,
  ) =>
    onAppendSlot ? (
      <LanguageCardSlotDropZone
        slot={slot}
        disabled={!dropEnabled}
        onAppend={handleAppend}
        className={className}
      >
        {node}
      </LanguageCardSlotDropZone>
    ) : (
      node
    );

  const originalSpeech = snippet?.note.originalSpeech.trim() ?? '';

  return (
    <div className="language-card-editor-shelf">
      <article className="language-card-container space-y-4">
        {showFocusAssist && originalSpeech ? (
          <FocusSpeechPanel
            originalSpeech={originalSpeech}
            panelOpen={speechPanelOpen}
            disabled={disabled}
            candidates={focusKeywordCandidates}
            cursorClasses={cursorClasses}
            onPanelOpenChange={setSpeechPanelOpen}
            onPickFocus={pickFocusText}
          />
        ) : null}

        <div>
          <label className="text-xs font-medium text-text-secondary">Focus</label>
          {wrapDrop(
            'focus',
            <input
              type="text"
              value={content.focusText}
              disabled={disabled}
              onChange={(event) => onChange({ focusText: event.target.value })}
              placeholder="Word or phrase from original speech"
              className="language-card-field-inset language-card-field-input mt-1 w-full rounded-lg border px-3 py-2 text-sm text-text placeholder:text-text-muted dark:bg-zinc-800/60 dark:hover:bg-zinc-800/80 dark:focus:bg-zinc-800 dark:border-zinc-700/80 dark:focus:border-accent/60 dark:placeholder:text-zinc-500"
            />,
          )}
          {baseFormSuggestion?.visible && baseFormSuggestion.suggestion ? (
            <FieldSuggestionChip
              label="base form"
              suggestion={baseFormSuggestion.suggestion}
              loading={baseFormSuggestion.loading}
              onAccept={baseFormSuggestion.accept}
              onDismiss={baseFormSuggestion.dismiss}
            />
          ) : null}
          <FocusKeywordChips
            candidates={focusKeywordCandidates}
            loading={focusKeywordsLoading}
            enabled={focusKeywordsEnabled}
            focusText={content.focusText}
            cursorClasses={cursorClasses}
            onPick={pickFocusText}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-text-secondary">Meaning</label>
          {wrapDrop(
            'meaning',
            <CardFieldEditor
              ref={meaningRef}
              value={content.meaning}
              disabled={disabled}
              placeholder="Explanation in your native language"
              className="mt-1"
              onChange={(meaning) => onChange({ meaning })}
            />,
          )}
        </div>

        <OptionalFieldChipAdders
          enabledFields={content.enabledOptionalFields}
          disabled={disabled}
          dropEnabled={dropEnabled}
          values={content.optionalSlots}
          editorRefs={editorRefs}
          onEnable={(field) => onToggleOptionalField(field, true)}
          onDisable={(field) => onToggleOptionalField(field, false)}
          onChange={(field, value) =>
            onChange({
              optionalSlots: {
                ...content.optionalSlots,
                [field]: value,
              },
            })
          }
          onAppend={handleAppend}
        />
      </article>
    </div>
  );
}

export { toggleOptionalField as applyOptionalFieldToggle } from '@semia/shared';
