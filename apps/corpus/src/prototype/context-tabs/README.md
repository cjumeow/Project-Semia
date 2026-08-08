# Context tabs + context switcher prototype

**Question:** How should inbox detail tabs and the AI assistant context switcher be structured — and what does the refined "golden layout" (Variant C + Gemini tweaks) look like in practice?

## Run

```bash
npm run prototype:context-tabs
```

Opens at `?prototype=context-tabs&variant=D` (golden layout default).

Use ← → to cycle variants.

## Variants

| Key | Description |
|-----|-------------|
| **A** | Underline tabs + split context (crowded single-row header) |
| **B** | Segmented tabs + snip-card context window chrome |
| **C** | Full-width rail tabs + context sub-bar below title |
| **D** | **Golden layout** — pill segmented tabs + compact header + sticky expanded context banner in chat |
| **E** | Golden · banner collapsed by default (tap to expand) |
| **F** | Golden · compact one-line banner (max chat height) |

## Verdict (in progress)

User + Gemini prefer **C's architecture** (separate context row, full-width tabs), refined as **D**:

1. Left tabs → full-width pill segmented control
2. Context → sticky banner inside chat (not header sub-bar)
3. Header → single row with compact Read \| Drag + Close

## After picking

Fold winner into `DetailTabBar.tsx` and `SnippetChatPanel` / `SnippetChatContextSwitcher.tsx`.
