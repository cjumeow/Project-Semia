import {
  CURSOR_DARK_CSS_VARS,
  CURSOR_DARK_DEEP_CSS_VARS,
} from './cursorThemeTokens';

export type DarkModeVariantKey = 'A' | 'B' | 'C';

export type DarkModeVariant = {
  key: DarkModeVariantKey;
  label: string;
  description: string;
  vars: Record<string, string>;
};

export type DarkModeViewKey = 'inbox' | 'cards';

/** Color-only dark palettes — layout unchanged; showcase uses mock Inbox + cards grid. */
export const DARK_MODE_VARIANTS: DarkModeVariant[] = [
  {
    key: 'A',
    label: 'Cursor chrome',
    description: 'VS Code / Cursor editor — #1e1e1e canvas, #252526 sidebar',
    vars: CURSOR_DARK_CSS_VARS,
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
    label: 'Cursor deep',
    description: 'Darker #181818 editor well, muted sidebar',
    vars: CURSOR_DARK_DEEP_CSS_VARS,
  },
];

export function darkModeVariantForKey(key: string | null): DarkModeVariant {
  return (
    DARK_MODE_VARIANTS.find((variant) => variant.key === key) ??
    DARK_MODE_VARIANTS[0]!
  );
}

export function darkModeViewForKey(key: string | null): DarkModeViewKey {
  return key === 'cards' ? 'cards' : 'inbox';
}
