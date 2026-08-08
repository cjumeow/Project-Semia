# Settings page prototype

> Three variants of a standalone Settings page, switchable via `?variant=`, on throwaway route `?prototype=settings-page`.

## Question

What should the dedicated Settings page look like for:

1. Dark mode
2. Context window
3. Language card AI suggestions
4. Language card **default fields** (pre-enabled optional fields on new drafts)
5. Language learning preferences (learning language + native language)

**Out of scope for production settings (noted in product direction):** Focus keyword daily/advanced modes — unified prompt only.

## Run

```bash
npm run dev -w @semia/corpus
```

Open (extension corpus URL or local dev):

- `?prototype=settings-page` — variant A (stacked sections)
- `?prototype=settings-page&variant=B` — sidebar nav
- `?prototype=settings-page&variant=C` — card grid

Use **Preview theme** (light / dark) in the top bar, or toggle **Dark mode** inside a variant to sync preview.

Bottom bar: `←` / `→` cycles variants (keyboard arrows when not in an input).

## Variants

| Key | Name | Structure |
|-----|------|-----------|
| A | Stacked sections | Full-width scroll; grouped h3 sections; checkbox list for default fields |
| B | Sidebar nav | Cursor-style left nav; one section per pane |
| C | Card grid | 2-column tiles; default fields as toggle chips |

## Default field options

Matches production `LANGUAGE_CARD_OPTIONAL_FIELD_DEFS`: Example, Usage, Dialogue, Pitfalls, My note. Focus + Meaning are always on (not configurable here).

## After picking a winner

Fold layout into a real `/settings` route (or corpus settings pane), wire to `SemiaSettings` + new `defaultOptionalFields` key, remove this prototype from main.
