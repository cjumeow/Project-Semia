export function snippetTextFromContextSwitchNotice(content: string): string | null {
  const match = content.match(/Context switched to "([^"]+)"/);
  return match?.[1] ?? null;
}

export function truncateContextSwitchLabel(text: string, max = 24): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}
