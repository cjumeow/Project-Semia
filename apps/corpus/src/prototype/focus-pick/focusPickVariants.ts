export type FocusPickVariantKey = 'A' | 'B' | 'C';

export type FocusPickVariant = {
  key: FocusPickVariantKey;
  label: string;
  description: string;
};

export const FOCUS_PICK_VARIANTS: FocusPickVariant[] = [
  {
    key: 'A',
    label: 'Stacked card (spec)',
    description:
      'Focus → 💡 chips below input → context inset in card; floating 🎯 on double-click / selection.',
  },
  {
    key: 'B',
    label: 'Context-first split',
    description:
      'Large original-speech panel above card; AI chips in context header; selection toolbar pinned to panel top.',
  },
  {
    key: 'C',
    label: 'Inline highlights',
    description:
      'AI keywords clickable in context text; chips as secondary; compact popover on select.',
  },
];

export function readFocusPickVariantKey(): FocusPickVariantKey {
  const raw = new URLSearchParams(window.location.search).get('variant');
  if (raw === 'B' || raw === 'C') return raw;
  return 'A';
}

export function focusPickVariantForKey(
  key: FocusPickVariantKey,
): FocusPickVariant {
  return (
    FOCUS_PICK_VARIANTS.find((entry) => entry.key === key) ??
    FOCUS_PICK_VARIANTS[0]!
  );
}
