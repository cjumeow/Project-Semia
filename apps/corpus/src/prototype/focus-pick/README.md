# Focus pick prototype (throwaway)

**Locked spec preview** before folding into `LanguageCardEditorFields`.

## Run

```bash
npm run prototype:focus-pick
```

`?prototype=focus-pick`

## What this prototypes

- **Collapsible Context pill** (default collapsed) — `ContextWindowChevron` + `Context | preview`
- **Expanded panel** — original speech only (no context window); inline AI highlights + double-click / selection → `🎯 設為 Focus`
- **Focus field** + **AI chips always visible** below (even when panel collapsed)
- **Daily / Advanced** mode toggle (simulates future `SemiaSettings.focusKeywordMode`)
- **Chevron toggle** on Context pill (`ChevronToggleIcon`)
- **Cursor-style chips** — dark: `zinc-800` fill; light: `zinc-100` fill; both use light gray borders
- **Light / Dark** — toggles `document.documentElement` theme (full page, not scoped columns)
- **Set as Focus** popover matches chip style
- All copy in **English**

## Verdict (when folding to production)

Replace `FocusSourcePicker` modal with this layout. Wire chips to real `suggestFocusKeywords` API (original speech + `user_level_mode` only).

Not production.
