# YouTube subtitle chrome — UI prototype (v4)

**Question:** Far-right control placement + chrome shell + icon mark.

## Run

```bash
npm run prototype:youtube-captions
```

Base URL: http://localhost:5173/?prototype=youtube-captions

### Chrome shells (D–F)

| Variant | URL |
|---------|-----|
| D Canopy | http://localhost:5173/?prototype=youtube-captions&variant=D |
| E Glass | http://localhost:5173/?prototype=youtube-captions&variant=E |
| F Signal | http://localhost:5173/?prototype=youtube-captions&variant=F |

### Icon directions (G–L) — same badge shell, different mark

| Variant | Icon | Logo ref | URL |
|---------|------|----------|-----|
| **G** | Semicolon · | logo A pause point | http://localhost:5173/?prototype=youtube-captions&variant=G |
| **H** | Brackets [ ] | logo B selection | http://localhost:5173/?prototype=youtube-captions&variant=H |
| **I** | Transcript arc | logo C wave | http://localhost:5173/?prototype=youtube-captions&variant=I |
| **J** | Layered S | logo D monogram | http://localhost:5173/?prototype=youtube-captions&variant=J |
| **K** | Snippet tab | logo E index card | http://localhost:5173/?prototype=youtube-captions&variant=K |
| **L** | Bilingual stack | dual-line metaphor | http://localhost:5173/?prototype=youtube-captions&variant=L |

### Legacy settings UX (A–C)

http://localhost:5173/?prototype=youtube-captions&variant=A (or B, C)

Use bottom switcher or ← → .

## Pick a winner

Reply with chrome (D/E/F) + icon (G–L), or hybrid. Production extension implements chosen pair on far-right mount.
