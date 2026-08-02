import { generateContextWindow } from '../ai/generateContextWindow';
import { generateIllustrativeExample } from '../ai/generateIllustrativeExample';
import { generateSnippetNote } from '../ai/generateSnippetNote';
import { saveCorpusNote } from '../corpusNotesStorage';
import { deleteFragment, deleteSource } from '../deleteCaptures';
import { ensureSnippetNote } from '../ensureSnippetNote';
import {
  appendFragment,
  listFragments,
  normalizeFragments,
  setSnippetTriageStatus as persistSnippetTriageStatus,
  recordStillLearning as persistStillLearning,
} from '../fragmentsStorage';
import { openWebCapture } from '../pendingWebRestore';
import {
  getSnippetNote,
  getSnippetNotes,
  saveSnippetNote,
} from '../snippetNotesStorage';
import type { BackgroundMessage } from '../types';

type FragmentMessage =
  | Extract<BackgroundMessage, { type: 'SAVE_FRAGMENT' }>
  | Extract<BackgroundMessage, { type: 'SAVE_CORPUS_NOTE' }>
  | Extract<BackgroundMessage, { type: 'LIST_FRAGMENTS' }>
  | Extract<BackgroundMessage, { type: 'LIST_SNIPPET_NOTES' }>
  | Extract<BackgroundMessage, { type: 'GENERATE_SNIPPET_NOTE' }>
  | Extract<BackgroundMessage, { type: 'GENERATE_CONTEXT_WINDOW' }>
  | Extract<BackgroundMessage, { type: 'GENERATE_ILLUSTRATIVE_EXAMPLE' }>
  | Extract<BackgroundMessage, { type: 'SAVE_ILLUSTRATIVE_EXAMPLE' }>
  | Extract<BackgroundMessage, { type: 'OPEN_WEB_CAPTURE' }>
  | Extract<BackgroundMessage, { type: 'DELETE_FRAGMENT' }>
  | Extract<BackgroundMessage, { type: 'DELETE_SOURCE' }>
  | Extract<BackgroundMessage, { type: 'SET_SNIPPET_TRIAGE_STATUS' }>
  | Extract<BackgroundMessage, { type: 'RECORD_STILL_LEARNING' }>;

export function isFragmentMessage(
  message: BackgroundMessage,
): message is FragmentMessage {
  return (
    message.type === 'SAVE_FRAGMENT' ||
    message.type === 'SAVE_CORPUS_NOTE' ||
    message.type === 'LIST_FRAGMENTS' ||
    message.type === 'LIST_SNIPPET_NOTES' ||
    message.type === 'GENERATE_SNIPPET_NOTE' ||
    message.type === 'GENERATE_CONTEXT_WINDOW' ||
    message.type === 'GENERATE_ILLUSTRATIVE_EXAMPLE' ||
    message.type === 'SAVE_ILLUSTRATIVE_EXAMPLE' ||
    message.type === 'OPEN_WEB_CAPTURE' ||
    message.type === 'DELETE_FRAGMENT' ||
    message.type === 'DELETE_SOURCE' ||
    message.type === 'SET_SNIPPET_TRIAGE_STATUS' ||
    message.type === 'RECORD_STILL_LEARNING'
  );
}

export async function handleFragmentMessage(
  message: FragmentMessage,
): Promise<Record<string, unknown>> {
  switch (message.type) {
    case 'SAVE_FRAGMENT':
      await appendFragment(message.fragment);
      return { ok: true };

    case 'SAVE_CORPUS_NOTE':
      await saveCorpusNote(message.fragmentId, message.markdown);
      return { ok: true };

    case 'LIST_FRAGMENTS':
      return { ok: true, fragments: await listFragments() };

    case 'LIST_SNIPPET_NOTES':
      return { ok: true, notes: await getSnippetNotes() };

    case 'GENERATE_SNIPPET_NOTE': {
      const note = await generateSnippetNote(message.fragment);
      await saveSnippetNote(message.fragment.id, note);
      return { ok: true, note };
    }

    case 'GENERATE_CONTEXT_WINDOW': {
      const existing = await getSnippetNote(message.fragment.id);
      if (!existing?.generatedAt) {
        return {
          ok: false,
          error: 'Generate the snippet note before building a context window.',
        };
      }

      const dynamicContextBlock = await generateContextWindow(message.fragment);
      const note = { ...existing, dynamicContextBlock };
      await saveSnippetNote(message.fragment.id, note);
      return { ok: true, note };
    }

    case 'GENERATE_ILLUSTRATIVE_EXAMPLE': {
      const existing = await getSnippetNote(message.fragment.id);
      if (!existing?.generatedAt) {
        return {
          ok: false,
          error: 'Generate the snippet note before an illustrative example.',
        };
      }
      if (existing.unitType !== 'word') {
        return {
          ok: false,
          error: 'Illustrative examples are only for word-level captures.',
        };
      }

      const illustrativeExample = await generateIllustrativeExample(
        message.fragment,
      );
      const note = { ...existing, illustrativeExample };
      await saveSnippetNote(message.fragment.id, note);
      return { ok: true, note };
    }

    case 'SAVE_ILLUSTRATIVE_EXAMPLE': {
      const existing = await getSnippetNote(message.fragmentId);
      if (!existing) {
        return { ok: false, error: 'Snippet note not found.' };
      }
      if (existing.unitType !== 'word') {
        return {
          ok: false,
          error: 'Illustrative examples are only for word-level captures.',
        };
      }

      const note = {
        ...existing,
        illustrativeExample: message.illustrativeExample.trim(),
      };
      await saveSnippetNote(message.fragmentId, note);
      return { ok: true, note };
    }

    case 'OPEN_WEB_CAPTURE':
      await openWebCapture(message.fragment);
      return { ok: true };

    case 'DELETE_FRAGMENT':
      await deleteFragment(message.fragmentId);
      return { ok: true };

    case 'DELETE_SOURCE':
      await deleteSource(message.sourceUrl);
      return { ok: true };

    case 'SET_SNIPPET_TRIAGE_STATUS':
      await persistSnippetTriageStatus(message.fragmentId, message.status);
      return { ok: true };

    case 'RECORD_STILL_LEARNING':
      await persistStillLearning(message.fragmentId);
      return { ok: true };
  }
}

export function onFragmentsStorageChanged(
  oldValue: unknown,
  newValue: unknown,
): void {
  const oldIds = new Set(
    normalizeFragments(oldValue).map((fragment) => fragment.id),
  );
  const added = normalizeFragments(newValue).filter(
    (fragment) => !oldIds.has(fragment.id),
  );

  for (const fragment of added) {
    void ensureSnippetNote(fragment).catch((err) => {
      console.error(
        `[Semia] Failed to auto-generate note for ${fragment.id}:`,
        err,
      );
    });
  }
}
