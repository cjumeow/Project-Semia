/**
 * Cursor / VS Code default dark workbench tokens (editor chrome).
 * @see https://github.com/microsoft/vscode/blob/main/extensions/theme-defaults/themes/dark_modern.json
 */
export const CURSOR_DARK_TOKENS = {
  shelf: '#252526',
  canvas: '#1e1e1e',
  surface: '#2d2d2d',
  border: '#3c3c3c',
  borderStrong: '#4e4e4e',
  text: '#cccccc',
  textSecondary: '#b4b4b4',
  textMuted: '#858585',
  accent: '#007acc',
  accentSoft: '#264f78',
  languageCard: '#3794ff',
  contextCollapsed: '#2a2a2a',
  sectionLabel: '#cccccc',
} as const;

function toCssVars(tokens: {
  shelf: string;
  canvas: string;
  surface: string;
  border: string;
  borderStrong: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentSoft: string;
  languageCard: string;
  contextCollapsed: string;
  sectionLabel: string;
}): Record<string, string> {
  return {
    '--color-shelf': tokens.shelf,
    '--color-canvas': tokens.canvas,
    '--color-surface': tokens.surface,
    '--color-border': tokens.border,
    '--color-border-strong': tokens.borderStrong,
    '--color-text': tokens.text,
    '--color-text-secondary': tokens.textSecondary,
    '--color-text-muted': tokens.textMuted,
    '--color-accent': tokens.accent,
    '--color-accent-soft': tokens.accentSoft,
    '--color-language-card': tokens.languageCard,
    '--color-context-collapsed': tokens.contextCollapsed,
    '--color-section-label': tokens.sectionLabel,
  };
}

export const CURSOR_DARK_CSS_VARS = toCssVars(CURSOR_DARK_TOKENS);

/** Slightly deeper editor well — closer to Cursor with dimmed sidebar. */
export const CURSOR_DARK_DEEP_CSS_VARS = toCssVars({
  ...CURSOR_DARK_TOKENS,
  shelf: '#1f1f1f',
  canvas: '#181818',
  surface: '#252526',
  contextCollapsed: '#1f1f1f',
});
