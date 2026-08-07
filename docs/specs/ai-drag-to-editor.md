# AI drag → editor (narrow spec)

**Status:** in progress on `feat/card-field-tiptap-editor`.

## One sentence

AI-generated rich content must be draggable into language-card fields; once dropped, it becomes native editable WYSIWYG content with formatting preserved.

## In scope (MVP)

1. **Drag source** — AI chat `<p>` / `<li>` segments serialized to markdown (`serializeDragRootElement`). Shift+click selects a range; dragging any selected block drops all selected blocks (`serializeDragElements`).
2. **Drop target** — `meaning`, `example`, `usageNote` via `LanguageCardSlotDropZone`.
3. **Insertion** — Tiptap `insertContentAt` with `contentType: 'markdown'` (bullets render as list nodes).
4. **After drop** — user can click, type, bold, delete in a single-pane WYSIWYG field (no split preview, no toolbar).
5. **Multi-select drag ghost** — when ≥2 blocks are selected, drag preview shows a Language card icon chip with block count (not initiator text only).

## Explicitly out of scope (for now)

- BlockNote / custom block geometry engine
- AI field suggestions (disabled until editor merge is stable)
- Visual parity with Notion/Heptabase beyond “feels draggable and editable”

## Architecture principle

```
AI output → serializeDragRootElement → drag → CardFieldEditor.insertMarkdown → markdown draft state
```

Tiptap owns in-field editing. We own: chat UI, drag payload, card schema, and markdown persistence on `LanguageCardDraftContent`.

## Acceptance (manual)

- [ ] Drag an AI markdown segment into Meaning; bullets render as `•`, bold as bold.
- [ ] Dropped content is immediately editable in place (single pane).
- [ ] No split preview or toolbar chrome in card fields.
