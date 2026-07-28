/** True when the captured snippet is a single word (not a phrase). */
export function isSingleWordSnippet(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  return trimmed.split(/\s+/).length === 1;
}
