# Context bar slim prototype

**Question:** How should the context bar and context-switch system messages be slimmed down without losing switch affordance?

## Run

```bash
npm run prototype:context-bar-slim
```

`?prototype=context-bar-slim&variant=A|B|C` — use ← → to cycle. Default **B**.

**Shared chevron:** `prototype/shared/ChevronToggleIcon.tsx` (Lucide chevron-right; `rotate-90` when open). Used in chat context bar and snip context window stub below each preview.

Toggle **Light / Dark** at the top.

## Variants

| Key | Context bar | Switch line |
|-----|-------------|-------------|
| **A** | Gemini — ~28px gray pill, 12px muted, `▼`, ellipsis | `─── 切換上下文至 "…" ───` centered |
| **B** | **Winner** — w-fit pill (max 85%), flush sticky; chevron + `Context \|` | Flex hairlines + `切換至 "…"` |
| **C** | 24px ghost strip + chevron | Left `· Context → "…"` micro caption |

## After picking

Fold winner into `SnippetChatContextBanner.tsx` and `SnippetChatPanel` context-switch rendering.
