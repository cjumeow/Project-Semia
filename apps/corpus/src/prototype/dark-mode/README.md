# Dark mode prototype (throwaway)

**Question:** Can we use **Cursor / VS Code editor chrome** (`#1e1e1e` canvas, `#252526` sidebar) for SEMIA dark mode — on Inbox and Learning cards grid?

## Run

```bash
npm run prototype:dark-mode
```

## URLs

| URL | What |
|-----|------|
| `?prototype=dark-mode` | Inbox mock · variant **A** (Cursor chrome) |
| `?prototype=dark-mode&view=cards` | Learning cards grid |
| `?prototype=dark-mode&variant=C` | Deeper `#181818` editor well |
| `?prototype=dark-mode&variant=B` | Warm ink (comparison) |

- **Top pills:** switch Inbox ↔ Learning cards grid (`1` / `2` keys)
- **Bottom bar:** switch color variant (`←` / `→`)

## Variants

| Key | Name | Base |
|-----|------|------|
| A | Cursor chrome | VS Code Dark+ workbench tokens |
| B | Warm ink | Stone neutrals |
| C | Cursor deep | Darker editor well |

Not production. Pick tokens → fold into `index.css` + settings.
