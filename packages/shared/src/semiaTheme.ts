/** DOM attribute for light/dark token sets on `document.documentElement`. */
export const SEMIA_THEME_ATTRIBUTE = 'data-semia-theme';

export type SemiaThemeMode = 'light' | 'dark';

/** Cursor deep — validated in dark-mode prototype variant C. */
export const CURSOR_DEEP_THEME_TOKENS = {
  shelf: '#1f1f1f',
  canvas: '#181818',
  surface: '#252526',
  border: '#3c3c3c',
  borderStrong: '#4e4e4e',
  text: '#cccccc',
  textSecondary: '#b4b4b4',
  textMuted: '#858585',
  accent: '#007acc',
  accentSoft: '#264f78',
  languageCard: '#3794ff',
  contextCollapsed: '#1f1f1f',
  sectionLabel: '#cccccc',
} as const;

export function semiaThemeModeForDarkModeEnabled(
  darkModeEnabled: boolean,
): SemiaThemeMode {
  return darkModeEnabled ? 'dark' : 'light';
}

export function applySemiaThemeToDocument(mode: SemiaThemeMode): void {
  if (typeof document === 'undefined') {
    return;
  }
  document.documentElement.setAttribute(SEMIA_THEME_ATTRIBUTE, mode);
}
