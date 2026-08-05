# Snippet chat UI prototype

**Question:** How should AI chat + right-column snippet/card detail coexist in the three-column corpus layout?

Three structurally different variants on `?prototype=snippet-chat&variant=A|B|C`.

| Variant | Chat placement |
|---------|----------------|
| **A** | Full-bleed overlay on the middle column |
| **B** | Right-docked panel (~58% of middle column; list peeks on the left) |
| **C** | Split middle column — snippet list on top, chat panel on bottom |

## Session model (all variants)

- Tab memory only; no persistence.
- **General chat** when no snippet is selected (`__general__` thread).
- **Per-snippet threads** when a snippet is selected; switching snippets swaps the visible history.
- No `@` or save-as-card in this prototype.

## Run

```bash
npm run dev -w apps/corpus
```

Open: `http://localhost:5173/?prototype=snippet-chat&variant=A`

Use ← → or the bottom switcher to flip variants.
