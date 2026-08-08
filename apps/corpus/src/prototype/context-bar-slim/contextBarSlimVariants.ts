export type ContextBarSlimVariantKey = 'A' | 'B' | 'C';

export type ContextBarSlimVariant = {
  key: ContextBarSlimVariantKey;
  label: string;
  description: string;
};

export const CONTEXT_BAR_SLIM_VARIANTS: ContextBarSlimVariant[] = [
  {
    key: 'A',
    label: 'Gemini slim badge',
    description:
      '~28px gray pill, 12px muted text + ▼; switch line ─── 切換上下文至 "…" ───',
  },
  {
    key: 'B',
    label: 'Context | pill (winner)',
    description:
      'chevron-right (→/↓) + Context | snippet; dropdown flush-aligned to pill width.',
  },
  {
    key: 'C',
    label: 'Ghost strip + micro caption',
    description:
      '24px full-width ghost bar; switch is left-aligned · Context → "…" caption.',
  },
];

export function readContextBarSlimVariantKey(): ContextBarSlimVariantKey {
  const raw = new URLSearchParams(window.location.search).get('variant');
  if (raw === 'A' || raw === 'C') return raw;
  return 'B';
}

export function contextBarSlimVariantForKey(
  key: ContextBarSlimVariantKey,
): ContextBarSlimVariant {
  return (
    CONTEXT_BAR_SLIM_VARIANTS.find((entry) => entry.key === key) ??
    CONTEXT_BAR_SLIM_VARIANTS[0]!
  );
}
