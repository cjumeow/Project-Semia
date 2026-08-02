# Delete control — UI prototype (throwaway)

> Dark pill delete button inspired by reference UI; default **A** is deeper indigo than `#352F64`.

## Run

```bash
npm run prototype:delete
```

- `http://localhost:5173/?prototype=delete&variant=A` — Deep indigo (recommended)
- `?variant=B` — Ink stone
- `?variant=C` — Forest night

Use **← / →** or the bottom bar to switch.

## After picking a winner

Fold into `SemiaButton` danger variant or a dedicated `DeleteButton` in production components.
