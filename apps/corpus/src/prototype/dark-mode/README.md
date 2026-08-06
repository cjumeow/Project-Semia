# Dark mode prototype (throwaway)

**Question:** Which dark color palette is comfortable for long corpus sessions — without changing layout?

Three token sets on the **real** `App` shell. Switch with the bottom bar or `←` / `→`.

## Run

```bash
npm run prototype:dark-mode
```

Open:

- `http://localhost:5173/?prototype=dark-mode` (default **A**)
- `http://localhost:5173/?prototype=dark-mode&variant=B` — Warm ink
- `http://localhost:5173/?prototype=dark-mode&variant=C` — OLED dim

## Variants

| Key | Name | Notes |
|-----|------|--------|
| A | Slate night | Cool blue-gray |
| B | Warm ink | Stone neutrals, less blue |
| C | OLED dim | Near-black, brand blue accent |

Not production. Pick a winner → fold tokens into `index.css` / theme settings, then delete switcher from main.
