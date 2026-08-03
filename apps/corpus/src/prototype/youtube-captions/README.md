# YouTube subtitle settings — UI prototype (v3)

**Question:** Where should subtitle settings live on the YouTube watch page, and how should the popover look?

Aligned with [ADR-0002](../../../docs/adr/0002-youtube-bilingual-captions-spike-first.md): settings **only** on the YouTube bottom bar; **LingoPanel is capture-only** (no summary chip / Edit). Dual-line pill is a visual preview — production stays learning-only until pairing is solved (spike #02).

## Run

```bash
npm run prototype:youtube-captions
```

Open:

- **A (recommended):** http://localhost:5173/?prototype=youtube-captions&variant=A
- **B:** `&variant=B`
- **C:** `&variant=C`

Use the bottom switcher or ← → to compare variants.

## Variants

| Key | Settings entry | Notes |
|-----|----------------|-------|
| **A** | Semia icon in YouTube bottom bar → **popover** above CC | Recommended in grilling |
| **B** | Same icon → **bottom sheet** | More room for future fields |
| **C** | **雙語** toggle + chevron → popover | Split control |

Shared:

- Mock Jo Van Eyck player chrome (title, CC, Semia icon, YouTube gear)
- Bilingual pill on video (toggle off = learning line only)
- LingoPanel open on the right — **no subtitle settings inside**
- Amber state bar shows cue index, language summary, popover open/closed

## Mock data

Cue #96 reproduces the spike #02 index-pairing bug (`That's part of context engineering` vs long unrelated ZH).

## Pick a winner

Reply with variant (or hybrid: e.g. “A popover layout, B sheet on mobile”). Record decision in ticket #03 Comments before ticket #05 implementation.

**Do not merge this folder to production as-is** — rewrite in `apps/extension` when implementing.
