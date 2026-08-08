export type ContextTabsVariantKey = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export type ContextTabsVariant = {
  key: ContextTabsVariantKey;
  label: string;
  description: string;
};

export const CONTEXT_TABS_VARIANTS: ContextTabsVariant[] = [
  {
    key: 'A',
    label: 'Underline tabs + split context',
    description:
      'Browser-style underline tabs; context label separated from capture text with a divider.',
  },
  {
    key: 'B',
    label: 'Segmented tabs + context window mirror',
    description:
      'Inset segmented control for tabs; context switcher reuses snip card context-window chrome.',
  },
  {
    key: 'C',
    label: 'Full-width rail tabs + context band',
    description:
      'Equal-width tab rail; context lives in a dedicated header band below the chat title.',
  },
  {
    key: 'D',
    label: 'Golden layout (Gemini)',
    description:
      'C architecture refined: full-width pill tabs, compact header, sticky expanded context banner in chat.',
  },
  {
    key: 'E',
    label: 'Golden · collapsed banner',
    description:
      'Same as D but context banner starts collapsed — tap to reveal full sentence + source.',
  },
  {
    key: 'F',
    label: 'Golden · compact banner',
    description:
      'One-line sticky rail; expand on tap. Maximum vertical space for chat messages.',
  },
];

export function readContextTabsVariantKey(): ContextTabsVariantKey {
  const raw = new URLSearchParams(window.location.search).get('variant');
  if (
    raw === 'B' ||
    raw === 'C' ||
    raw === 'D' ||
    raw === 'E' ||
    raw === 'F'
  ) {
    return raw;
  }
  return 'D';
}

export function contextTabsVariantForKey(
  key: ContextTabsVariantKey,
): ContextTabsVariant {
  return CONTEXT_TABS_VARIANTS.find((entry) => entry.key === key) ?? CONTEXT_TABS_VARIANTS[0]!;
}
