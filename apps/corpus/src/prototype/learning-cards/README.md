# Learning cards grid prototype

**Question:** What should the Learning cards browse grid look like — especially gap between pills and border clarity?

## Run

From repo root:

```bash
npm run dev -w @semia/corpus
```

Open:

- `http://localhost:5173/?prototype=learning-cards&variant=A`
- `?variant=B` — bordered tiles, wider gap
- `?variant=C` — loose chips inside dashed canvas frame

Use **← / →** (when search is not focused) or the bottom bar to switch variants.

## Variants

| Key | Label | Structure |
|-----|-------|-----------|
| A | Capsule pill grid | `rounded-full` pills, `gap-3`, `border` |
| B | Bordered tile grid | `rounded-xl`, `border-2`, `gap-4`, min-height tiles |
| C | Loose chip grid | `gap-5`, inner divider on meaning, dashed outer frame |

Shared: header search (focus + meaning), click → detail modal, status dot (review vs mastered).

## Verdict

_(fill in after picking a variant)_
