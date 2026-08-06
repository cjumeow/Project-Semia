export type DarkModeVariantKey = 'A' | 'B' | 'C';

export type DarkModeVariant = {
  key: DarkModeVariantKey;
  label: string;
  description: string;
  vars: Record<string, string>;
};

/** Color-only dark palettes — production layout unchanged (real App shell). */
export const DARK_MODE_VARIANTS: DarkModeVariant[] = [
  {
    key: 'A',
    label: 'Slate night',
    description: 'Cool blue-gray surfaces, balanced contrast',
    vars: {
      '--color-shelf': '#0f172a',
      '--color-canvas': '#111827',
      '--color-surface': '#1e293b',
      '--color-border': '#334155',
      '--color-border-strong': '#475569',
      '--color-text': '#f1f5f9',
      '--color-text-secondary': '#cbd5e1',
      '--color-text-muted': '#94a3b8',
      '--color-accent': '#60a5fa',
      '--color-accent-soft': '#1e3a5f',
      '--color-language-card': '#3b82f6',
      '--color-context-collapsed': '#1e293b',
      '--color-section-label': '#e2e8f0',
    },
  },
  {
    key: 'B',
    label: 'Warm ink',
    description: 'Stone neutrals — less blue cast for long reading',
    vars: {
      '--color-shelf': '#1c1917',
      '--color-canvas': '#141210',
      '--color-surface': '#292524',
      '--color-border': '#44403c',
      '--color-border-strong': '#57534e',
      '--color-text': '#fafaf9',
      '--color-text-secondary': '#d6d3d1',
      '--color-text-muted': '#a8a29e',
      '--color-accent': '#d4a574',
      '--color-accent-soft': '#3d3428',
      '--color-language-card': '#c9a227',
      '--color-context-collapsed': '#292524',
      '--color-section-label': '#e7e5e4',
    },
  },
  {
    key: 'C',
    label: 'OLED dim',
    description: 'Near-black canvas, higher text contrast, brand blue accent',
    vars: {
      '--color-shelf': '#000000',
      '--color-canvas': '#000000',
      '--color-surface': '#0a0a0a',
      '--color-border': '#262626',
      '--color-border-strong': '#404040',
      '--color-text': '#fafafa',
      '--color-text-secondary': '#d4d4d4',
      '--color-text-muted': '#a3a3a3',
      '--color-accent': '#4493d4',
      '--color-accent-soft': '#0c2d4a',
      '--color-language-card': '#2563eb',
      '--color-context-collapsed': '#171717',
      '--color-section-label': '#f5f5f5',
    },
  },
];

export function darkModeVariantForKey(key: string | null): DarkModeVariant {
  return (
    DARK_MODE_VARIANTS.find((variant) => variant.key === key) ??
    DARK_MODE_VARIANTS[0]!
  );
}
