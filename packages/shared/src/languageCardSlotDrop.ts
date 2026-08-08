export const SNIPPET_CHAT_BULLET_DRAG_MIME =
  'application/x-semia-snippet-chat-bullet';

export type LanguageCardEditorSlotKey =
  | 'focus'
  | 'meaning'
  | 'example'
  | 'usageNote'
  | 'dialogue'
  | 'pitfalls'
  | 'personalNote';

/** Append dropped markdown to a slot; newline-join when slot already has content. */
export function appendMarkdownToSlot(
  existing: string,
  fragment: string,
): string {
  const next = fragment.trim();
  if (!next) {
    return existing;
  }

  const current = existing.trimEnd();
  if (!current) {
    return next;
  }

  return `${current}\n${next}`;
}

export function readSnippetChatBulletDragText(
  dataTransfer: DataTransfer,
): string | null {
  const typed =
    dataTransfer.getData(SNIPPET_CHAT_BULLET_DRAG_MIME) ||
    dataTransfer.getData('text/plain');
  const trimmed = typed.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function hasSnippetChatBulletDrag(
  dataTransfer: DataTransfer,
): boolean {
  return (
    dataTransfer.types.includes(SNIPPET_CHAT_BULLET_DRAG_MIME) ||
    dataTransfer.types.includes('text/plain')
  );
}
