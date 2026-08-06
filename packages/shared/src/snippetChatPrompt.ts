import type { LanguageFragment } from './types';

export function didSnippetChatContextChange(
  previousFragmentId: string | null | undefined,
  currentFragmentId: string | null | undefined,
): boolean {
  const previous = previousFragmentId?.trim() ?? '';
  const current = currentFragmentId?.trim() ?? '';
  if (!previous || !current) return false;
  return previous !== current;
}

export function formatSnippetChatContextSwitchNotice(
  fragment: Pick<LanguageFragment, 'selectedText' | 'sourceTitle'>,
): string {
  const title = fragment.sourceTitle.trim() || 'Untitled source';
  return `Context switched to "${fragment.selectedText.trim()}" (${title}). I will answer using only this capture from now on.`;
}

export function buildActiveCapturePromptBlock(
  fragment: LanguageFragment,
): string {
  return `[ACTIVE CAPTURE — use ONLY this for your next reply]
Selected text: ${fragment.selectedText}
Source: ${fragment.sourceTitle}
Capture language: ${fragment.languageCode}
Capture id: ${fragment.id}`;
}

export const GLOBAL_SNIPPET_CHAT_GROUNDING_RULES = `You are in a GLOBAL inbox tutoring session. The learner may switch between captured snippets mid-conversation.

CRITICAL grounding rules:
- Ground every NEW reply ONLY in the ACTIVE CAPTURE block below.
- Chat history may mention other captures — treat that as background, NOT current source material.
- When the user says "this word", "this phrase", or "this snippet", they mean ACTIVE CAPTURE only.
- If you see a context-switch notice, pivot immediately; do not continue discussing the previous capture unless the user explicitly asks about it.
- Do not invent facts about the source beyond what ACTIVE CAPTURE and SNIP NOTE provide.`;

export const PER_SNIPPET_CHAT_GROUNDING_RULES = `You are a language tutor helping a learner understand a captured snippet from real media.

The following snippet context is attached for this conversation. Use it to give accurate, contextual advice about vocabulary, usage, collocations, and example sentences.`;
