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

/** Class toggled during instant theme swaps to suppress CSS transitions. */
export const SEMIA_THEME_INSTANT_CLASS = 'semia-theme-instant';

export type ApplySemiaThemeOptions = {
  /** Skip CSS transitions for one paint cycle (used on user toggle). */
  instant?: boolean;
};

export function readSemiaThemeModeFromDocument(): SemiaThemeMode | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const mode = document.documentElement.getAttribute(SEMIA_THEME_ATTRIBUTE);
  if (mode === 'dark' || mode === 'light') {
    return mode;
  }

  return null;
}

function clearSemiaThemeInstantSwap(): void {
  if (typeof document === 'undefined') {
    return;
  }
  document.documentElement.classList.remove(SEMIA_THEME_INSTANT_CLASS);
}

export function applySemiaThemeToDocument(
  mode: SemiaThemeMode,
  options?: ApplySemiaThemeOptions,
): void {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  const instant = options?.instant === true;

  if (instant) {
    root.classList.add(SEMIA_THEME_INSTANT_CLASS);
  }

  root.setAttribute(SEMIA_THEME_ATTRIBUTE, mode);

  if (!instant) {
    return;
  }

  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        clearSemiaThemeInstantSwap();
      });
    });
    return;
  }

  clearSemiaThemeInstantSwap();
}

export function applySemiaThemeForDarkModeEnabled(
  darkModeEnabled: boolean,
  options?: ApplySemiaThemeOptions,
): void {
  applySemiaThemeToDocument(
    semiaThemeModeForDarkModeEnabled(darkModeEnabled),
    options,
  );
}
