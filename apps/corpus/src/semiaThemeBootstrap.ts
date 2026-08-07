import {
  applySemiaThemeToDocument,
  isDarkModeEnabled,
  SEMIA_SETTINGS_STORAGE_KEY,
  semiaThemeModeForDarkModeEnabled,
  type SemiaSettings,
} from '@semia/shared';

/** Apply theme before React paints (localStorage corpus dev only). */
export function bootstrapSemiaThemeFromLocalStorage(): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    const raw = localStorage.getItem(SEMIA_SETTINGS_STORAGE_KEY);
    if (!raw) {
      applySemiaThemeToDocument('light');
      return;
    }

    const settings = JSON.parse(raw) as SemiaSettings;
    applySemiaThemeToDocument(
      semiaThemeModeForDarkModeEnabled(isDarkModeEnabled(settings)),
    );
  } catch {
    applySemiaThemeToDocument('light');
  }
}
