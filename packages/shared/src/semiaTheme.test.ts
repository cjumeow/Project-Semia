import { describe, expect, it } from 'vitest';
import {
  CURSOR_DEEP_THEME_TOKENS,
  semiaThemeModeForDarkModeEnabled,
} from './semiaTheme';

describe('semiaThemeModeForDarkModeEnabled', () => {
  it('maps setting to theme mode', () => {
    expect(semiaThemeModeForDarkModeEnabled(true)).toBe('dark');
    expect(semiaThemeModeForDarkModeEnabled(false)).toBe('light');
  });
});

describe('CURSOR_DEEP_THEME_TOKENS', () => {
  it('uses the deep editor canvas from prototype variant C', () => {
    expect(CURSOR_DEEP_THEME_TOKENS.canvas).toBe('#181818');
    expect(CURSOR_DEEP_THEME_TOKENS.shelf).toBe('#1f1f1f');
  });
});
