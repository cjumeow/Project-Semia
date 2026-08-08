export type SlimContextSnippet = {
  id: string;
  selectedText: string;
};

export function truncateForSwitchLine(text: string, max = 28): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}
