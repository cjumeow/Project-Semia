import {
  applySemiaThemeForDarkModeEnabled,
  applySemiaThemeToDocument,
  type SemiaThemeMode,
} from '@semia/shared';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PrototypeSwitcher } from './PrototypeSwitcher';
import {
  INITIAL_SETTINGS_PAGE_STATE,
  type SettingsPageState,
} from './settingsPageMockData';
import { SettingsStatePanel } from './settingsPageShared';
import { SettingsPageVariantA } from './settingsPageVariantA';
import { SettingsPageVariantB } from './settingsPageVariantB';
import { SettingsPageVariantC } from './settingsPageVariantC';
import {
  readSettingsPageVariantKey,
  settingsPageVariantForKey,
  type SettingsPageVariantKey,
} from './settingsPageVariants';

function readDocumentTheme(): SemiaThemeMode {
  if (typeof document === 'undefined') {
    return 'light';
  }
  return document.documentElement.getAttribute('data-semia-theme') === 'dark'
    ? 'dark'
    : 'light';
}

/**
 * PROTOTYPE — standalone settings page layouts (3 variants, light/dark preview).
 * ?prototype=settings-page&variant=A|B|C
 *
 * Question: What should the dedicated Settings page look like?
 */
export function SettingsPagePrototypeApp() {
  const themeBeforePrototypeRef = useRef<SemiaThemeMode>(readDocumentTheme());
  const [variantKey, setVariantKey] = useState<SettingsPageVariantKey>(
    readSettingsPageVariantKey,
  );
  const [previewTheme, setPreviewTheme] = useState<SemiaThemeMode>('light');
  const [state, setState] = useState<SettingsPageState>(INITIAL_SETTINGS_PAGE_STATE);
  const [showState, setShowState] = useState(true);
  const variant = settingsPageVariantForKey(variantKey);

  useEffect(() => {
    applySemiaThemeToDocument(previewTheme, { instant: true });
    return () => {
      applySemiaThemeToDocument(themeBeforePrototypeRef.current, { instant: true });
    };
  }, [previewTheme]);

  useEffect(() => {
    const onPopState = (): void => {
      setVariantKey(readSettingsPageVariantKey());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleChange = useCallback((patch: Partial<SettingsPageState>) => {
    setState((current) => {
      const next = { ...current, ...patch };
      if (typeof patch.darkModeEnabled === 'boolean') {
        applySemiaThemeForDarkModeEnabled(patch.darkModeEnabled, { instant: true });
        setPreviewTheme(patch.darkModeEnabled ? 'dark' : 'light');
      }
      return next;
    });
  }, []);

  const variantProps = { state, onChange: handleChange };

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-canvas text-text">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border bg-surface/90 px-4 py-2">
        <p className="font-mono text-[10px] text-text-muted">
          PROTOTYPE settings-page · {variant.key} {variant.label}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] text-text-muted">Preview theme</span>
          {(['light', 'dark'] as const).map((theme) => (
            <button
              key={theme}
              type="button"
              className={[
                'rounded-full border px-2.5 py-1 text-[10px] font-medium capitalize transition-colors',
                previewTheme === theme
                  ? 'border-accent bg-accent-soft text-accent'
                  : 'border-border text-text-muted hover:text-text',
              ].join(' ')}
              onClick={() => setPreviewTheme(theme)}
            >
              {theme}
            </button>
          ))}
          <button
            type="button"
            className="rounded-full border border-border px-2.5 py-1 text-[10px] text-text-muted hover:text-text"
            onClick={() => setShowState((open) => !open)}
          >
            {showState ? 'Hide state' : 'Show state'}
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1">
        {variantKey === 'A' ? (
          <SettingsPageVariantA {...variantProps} />
        ) : variantKey === 'B' ? (
          <SettingsPageVariantB {...variantProps} />
        ) : (
          <SettingsPageVariantC {...variantProps} />
        )}
      </div>

      {showState ? (
        <div className="shrink-0 border-t border-border bg-shelf/80 px-4 py-2">
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-text-muted">
            Live state (in-memory)
          </p>
          <SettingsStatePanel state={state} />
        </div>
      ) : null}

      <PrototypeSwitcher />
    </div>
  );
}
