import { sendSnippetChat } from '../ai/sendSnippetChat';
import { suggestLanguageCardFields } from '../ai/suggestLanguageCardFields';
import { suggestBaseForm } from '../ai/suggestBaseForm';
import { suggestFocusKeywords } from '../ai/suggestFocusKeywords';
import { finalizeSnippetNote } from '../ai/finalizeSnippetNote';
import { generateContextWindow } from '../ai/generateContextWindow';
import { generateSnippetNote } from '../ai/generateSnippetNote';
import { saveCorpusNote } from '../corpusNotesStorage';
import { createLanguageCard } from '../createLanguageCard';
import { createLanguageCardFromDraft } from '../createLanguageCardFromDraft';
import { updateLanguageCardContent } from '../updateLanguageCardContent';
import { deleteFragment, deleteSource } from '../deleteCaptures';
import { ensureSnippetNote } from '../ensureSnippetNote';
import {
  appendFragment,
  listFragments,
  normalizeFragments,
  setSnippetTriageStatus as persistSnippetTriageStatus,
  recordStillLearning as persistStillLearning,
} from '../fragmentsStorage';
import { listLanguageCards } from '../languageCardsStorage';
import {
  clearLanguageCardDraft,
  loadLanguageCardDraft,
  saveLanguageCardDraft,
} from '../languageCardDraftsStorage';
import {
  markCardMasteredInReview,
  recordCardStillLearning,
  setCardTriageStatus,
} from '../updateLanguageCardReview';
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
  | Extract<BackgroundMessage, { type: 'LIST_LANGUAGE_CARDS' }>
  | Extract<BackgroundMessage, { type: 'GET_LANGUAGE_CARD_DRAFT' }>
  | Extract<BackgroundMessage, { type: 'SAVE_LANGUAGE_CARD_DRAFT' }>
  | Extract<BackgroundMessage, { type: 'CLEAR_LANGUAGE_CARD_DRAFT' }>
  | Extract<BackgroundMessage, { type: 'CREATE_LANGUAGE_CARD_FROM_DRAFT' }>
  | Extract<BackgroundMessage, { type: 'UPDATE_LANGUAGE_CARD_CONTENT' }>
  | Extract<BackgroundMessage, { type: 'GENERATE_SNIPPET_NOTE' }>
  | Extract<BackgroundMessage, { type: 'GENERATE_CONTEXT_WINDOW' }>
  | Extract<BackgroundMessage, { type: 'CREATE_LANGUAGE_CARD' }>
  | Extract<BackgroundMessage, { type: 'OPEN_WEB_CAPTURE' }>
  | Extract<BackgroundMessage, { type: 'DELETE_FRAGMENT' }>
  | Extract<BackgroundMessage, { type: 'DELETE_SOURCE' }>
  | Extract<BackgroundMessage, { type: 'SET_SNIPPET_TRIAGE_STATUS' }>
  | Extract<BackgroundMessage, { type: 'RECORD_STILL_LEARNING' }>
  | Extract<BackgroundMessage, { type: 'RECORD_CARD_STILL_LEARNING' }>
  | Extract<BackgroundMessage, { type: 'MARK_CARD_MASTERED' }>
  | Extract<BackgroundMessage, { type: 'SET_CARD_MASTERED' }>
  | Extract<BackgroundMessage, { type: 'SNIPPET_CHAT' }>
  | Extract<BackgroundMessage, { type: 'SUGGEST_LANGUAGE_CARD_FIELDS' }>
  | Extract<BackgroundMessage, { type: 'SUGGEST_BASE_FORM' }>
  | Extract<BackgroundMessage, { type: 'SUGGEST_FOCUS_KEYWORDS' }>;

export function isFragmentMessage(
  message: BackgroundMessage,
): message is FragmentMessage {
  return (
    message.type === 'SAVE_FRAGMENT' ||
    message.type === 'SAVE_CORPUS_NOTE' ||
    message.type === 'LIST_FRAGMENTS' ||
    message.type === 'LIST_SNIPPET_NOTES' ||
    message.type === 'LIST_LANGUAGE_CARDS' ||
    message.type === 'GET_LANGUAGE_CARD_DRAFT' ||
    message.type === 'SAVE_LANGUAGE_CARD_DRAFT' ||
    message.type === 'CLEAR_LANGUAGE_CARD_DRAFT' ||
    message.type === 'CREATE_LANGUAGE_CARD_FROM_DRAFT' ||
    message.type === 'UPDATE_LANGUAGE_CARD_CONTENT' ||
    message.type === 'GENERATE_SNIPPET_NOTE' ||
    message.type === 'GENERATE_CONTEXT_WINDOW' ||
    message.type === 'CREATE_LANGUAGE_CARD' ||
    message.type === 'OPEN_WEB_CAPTURE' ||
    message.type === 'DELETE_FRAGMENT' ||
    message.type === 'DELETE_SOURCE' ||
    message.type === 'SET_SNIPPET_TRIAGE_STATUS' ||
    message.type === 'RECORD_STILL_LEARNING' ||
    message.type === 'RECORD_CARD_STILL_LEARNING' ||
    message.type === 'MARK_CARD_MASTERED' ||
    message.type === 'SET_CARD_MASTERED' ||
    message.type === 'SNIPPET_CHAT' ||
    message.type === 'SUGGEST_LANGUAGE_CARD_FIELDS' ||
    message.type === 'SUGGEST_BASE_FORM' ||
    message.type === 'SUGGEST_FOCUS_KEYWORDS'
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

    case 'LIST_LANGUAGE_CARDS':
      return { ok: true, cards: await listLanguageCards() };

    case 'GET_LANGUAGE_CARD_DRAFT':
      return {
        ok: true,
        draft: await loadLanguageCardDraft(message.sourceFragmentId),
      };

    case 'SAVE_LANGUAGE_CARD_DRAFT':
      await saveLanguageCardDraft(message.draft);
      return { ok: true };

    case 'CLEAR_LANGUAGE_CARD_DRAFT':
      await clearLanguageCardDraft(message.sourceFragmentId);
      return { ok: true };

    case 'CREATE_LANGUAGE_CARD_FROM_DRAFT': {
      const card = await createLanguageCardFromDraft({
        fragment: message.fragment,
        draft: message.draft,
      });
      return { ok: true, card };
    }

    case 'UPDATE_LANGUAGE_CARD_CONTENT': {
      const card = await updateLanguageCardContent(
        message.cardId,
        message.content,
      );
      return { ok: true, card };
    }

    case 'GENERATE_SNIPPET_NOTE': {
      const note = await finalizeSnippetNote(
        message.fragment,
        await generateSnippetNote(message.fragment),
      );
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

    case 'CREATE_LANGUAGE_CARD': {
      const card = await createLanguageCard({
        fragment: message.fragment,
        focusText: message.focusText,
        intents: message.intents,
        learnerNote: message.learnerNote,
        includeScenario: message.includeScenario ?? true,
      });
      return { ok: true, card };
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

    case 'RECORD_CARD_STILL_LEARNING':
      await recordCardStillLearning(message.cardId);
      return { ok: true };

    case 'MARK_CARD_MASTERED':
      await markCardMasteredInReview(message.cardId);
      return { ok: true };

    case 'SET_CARD_MASTERED':
      await setCardTriageStatus(message.cardId, 'mastered');
      return { ok: true };

    case 'SNIPPET_CHAT': {
      const reply = await sendSnippetChat({
        fragment: message.fragment,
        history: message.history,
        userMessage: message.userMessage,
        globalThread: message.globalThread,
      });
      return { ok: true, reply };
    }

    case 'SUGGEST_LANGUAGE_CARD_FIELDS': {
      const suggestions = await suggestLanguageCardFields({
        fragment: message.fragment,
        focusText: message.focusText,
        fields: message.fields,
      });
      return { ok: true, suggestions };
    }

    case 'SUGGEST_BASE_FORM': {
      const baseFormSuggestion = await suggestBaseForm({
        fragment: message.fragment,
        focusText: message.focusText,
      });
      return { ok: true, baseFormSuggestion };
    }

    case 'SUGGEST_FOCUS_KEYWORDS': {
      const focusKeywords = await suggestFocusKeywords({
        fragment: message.fragment,
      });
      return { ok: true, focusKeywords };
    }
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
