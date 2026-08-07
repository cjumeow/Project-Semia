# Drag mode switch prototype (throwaway)

Compare top-bar toggle patterns for AI assistant drag mode. When off, chat blocks are not draggable and lose amber drag chrome.

## Run

```bash
npm run prototype:drag-mode-switch
```

| URL | Variant |
|-----|---------|
| `?prototype=drag-mode-switch` | **A** — Labeled switch |
| `?prototype=drag-mode-switch&variant=B` | Icon toggle (grip + amber ring) |
| `?prototype=drag-mode-switch&variant=C` | Segmented Read \| Drag |
| `?prototype=drag-mode-switch&variant=D` | Compact chip |

Use **← / →** or the bottom pill to cycle. Status bar shows `drag mode`, selection, and last drag attempt.

## Fold-in notes (when a variant wins)

- Gate `DragBlockChromeContext.interactive` (and likely `styled`) on drag mode flag from top bar.
- Persist preference in `semiaSettings` if needed across sessions.
- Wire toggle into `SnippetChatPanel` header next to context switcher / Close.
