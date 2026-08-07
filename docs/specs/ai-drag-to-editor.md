# AI drag → editor (narrow spec)

**Status:** draft — replaces all prior `apps/corpus/src/prototype/*` throwaways.

## One sentence

AI-generated rich content must be draggable into the language-card BlockNote editor at an insertion position; once dropped, it becomes native editable BlockNote content with formatting preserved.

## In scope (MVP)

1. **Drag source** — AI chat message (or segment) as a draggable payload (markdown and/or BlockNote `PartialBlock[]`).
2. **Drop target** — the card editor surface (BlockNote).
3. **Insertion** — insert blocks at a position BlockNote understands (block before/after, or native drop if sufficient). No custom depth geometry engine.
4. **After drop** — user can click, type, bold, delete, Enter, reorder via BlockNote; content is normal document state.

## Explicitly out of scope (for now)

- Notion-style hierarchy rails, bulletX measurement, scope overlays, depth-candidate snap UI
- Custom `TreeBlock` / insert-intent framework unless a single call site needs it
- Visual parity with Notion/Heptabase beyond “feels draggable and editable”
- Persistence/sync (prototype uses in-memory editor only until product seam exists)

## Architecture principle

```
AI output → parse to blocks → drag → BlockNote insert API → editable document
```

BlockNote owns editor behavior. We own: chat UI, drag payload, card schema, and the thinnest bridge between them.

## Acceptance (manual)

- [ ] Drag an AI markdown segment into the editor; it lands where the user expects (good enough for demo).
- [ ] Dropped content is immediately editable (cursor, selection, formatting).
- [ ] No prototype-only geometry modules; diff stays small and reviewable.

## Next step

When ready to spike again: one route or dev-only page, **≤5 files**, no `?prototype=` router zoo. Use `.agents/skills/prototype` UI branch only if comparing layouts; otherwise ship a minimal integration behind a feature flag or scratch route.
