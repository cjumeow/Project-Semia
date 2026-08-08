import { applySemiaThemeToDocument, type SemiaThemeMode } from '@semia/shared';
import { useEffect, useRef, useState } from 'react';
import {
  buildLockedPreviewState,
  FocusPickLockedPreview,
} from './FocusPickLockedPreview';
import type { FocusKeywordMode, FocusPickLockedState } from './focusPickLockedState';
import { FOCUS_PICK_MOCK_SNIPPET } from './focusPickMockData';

function readDocumentTheme(): SemiaThemeMode {
  if (typeof document === 'undefined') {
    return 'light';
  }
  return document.documentElement.getAttribute('data-semia-theme') === 'dark'
    ? 'dark'
    : 'light';
}

/**
 * PROTOTYPE — locked Focus pick spec before production fold.
 * ?prototype=focus-pick
 *
 * Full-page light/dark via document theme · Variant C · Daily/Advanced chips.
 */
export function FocusPickPrototypeApp() {
  const themeBeforePrototypeRef = useRef<SemiaThemeMode>(readDocumentTheme());
  const [pageTheme, setPageTheme] = useState<SemiaThemeMode>('light');
  const [keywordMode, setKeywordMode] = useState<FocusKeywordMode>('daily');
  const [simulateEmpty, setSimulateEmpty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<FocusPickLockedState>({
    focusText: '',
    panelOpen: false,
    keywordMode: 'daily',
    candidates: [],
    loading: true,
    lastAction: 'loaded snippet',
  });

  useEffect(() => {
    applySemiaThemeToDocument(pageTheme);
    return () => {
      applySemiaThemeToDocument(themeBeforePrototypeRef.current);
    };
  }, [pageTheme]);

  useEffect(() => {
    setLoading(true);
    setState((current) => ({
      ...current,
      loading: true,
      keywordMode,
    }));

    const timer = window.setTimeout(() => {
      const next = buildLockedPreviewState(keywordMode, simulateEmpty, false);
      setLoading(false);
      setState((current) => ({
        ...current,
        ...next,
        lastAction: `AI refreshed (${keywordMode}${simulateEmpty ? ', empty' : ''})`,
      }));
    }, 450);

    return () => window.clearTimeout(timer);
  }, [keywordMode, simulateEmpty]);

  return (
    <div className="relative min-h-screen bg-shelf px-4 py-6 pb-16 text-text">
      <div className="mx-auto max-w-2xl">
        <p className="mb-1 text-center font-mono text-[10px] text-text-muted">
          PROTOTYPE focus-pick · locked spec (Variant C)
        </p>
        <p className="mb-4 text-center text-xs text-text-secondary">
          Snip: &quot;{FOCUS_PICK_MOCK_SNIPPET.selectedText.slice(0, 52)}…&quot;
        </p>

        <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
          <div
            className="flex rounded-lg border border-border bg-surface p-0.5"
            role="group"
            aria-label="Page theme"
          >
            {(['light', 'dark'] as const).map((theme) => (
              <button
                key={theme}
                type="button"
                className={[
                  'rounded-md px-3 py-1 text-[11px] font-medium capitalize transition-colors',
                  pageTheme === theme
                    ? 'bg-canvas text-text shadow-sm'
                    : 'text-text-muted',
                ].join(' ')}
                onClick={() => setPageTheme(theme)}
              >
                {theme}
              </button>
            ))}
          </div>
          <div
            className="flex rounded-lg border border-border bg-surface p-0.5"
            role="group"
            aria-label="Keyword mode (settings preview)"
          >
            {(['daily', 'advanced'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                className={[
                  'rounded-md px-3 py-1 text-[11px] font-medium capitalize transition-colors',
                  keywordMode === mode
                    ? 'bg-canvas text-text shadow-sm'
                    : 'text-text-muted',
                ].join(' ')}
                onClick={() => setKeywordMode(mode)}
              >
                {mode === 'daily' ? 'Daily' : 'Advanced'}
              </button>
            ))}
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-[11px] text-text-muted">
            <input
              type="checkbox"
              checked={simulateEmpty}
              onChange={(event) => setSimulateEmpty(event.target.checked)}
            />
            Simulate empty AI
          </label>
        </div>

        <FocusPickLockedPreview
          state={{ ...state, loading }}
          chipTheme={pageTheme}
          simulateEmpty={simulateEmpty}
          onPanelOpenChange={(panelOpen) => {
            setState((current) => ({
              ...current,
              panelOpen,
              lastAction: panelOpen ? 'expanded context panel' : 'collapsed context panel',
            }));
          }}
          onFocusChange={(focusText, lastAction) => {
            setState((current) => ({ ...current, focusText, lastAction }));
          }}
        />
      </div>
    </div>
  );
}
