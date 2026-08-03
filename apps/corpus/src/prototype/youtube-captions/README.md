# YouTube subtitle chrome — UI prototype (v4)

**Question:** Where should the Semia control sit on the YouTube bar, and what should it look like?

v4 adds **far-right placement** (after fullscreen, Funlingo-style) and three visual directions **D / E / F**. Legacy **A / B / C** remain for settings UX comparison.

## Run

```bash
npm run prototype:youtube-captions
```

Open (default **D**):

| Variant | URL | Placement | Look |
|---------|-----|-----------|------|
| **D** | `&variant=D` | Far right | **Canopy** — forest green badge, corpus-aligned |
| **E** | `&variant=E` | Far right | **Glass** — frosted circle, YouTube-native |
| **F** | `&variant=F` | Far right | **Signal** — compact `S·` pill, amber bilingual dot |
| A | `&variant=A` | Before ⚙ | Legacy popover (shipped UX) |
| B | `&variant=B` | Before ⚙ | Bottom sheet |
| C | `&variant=C` | Before ⚙ | Toggle + chevron |

Use bottom switcher or ← → .

## Design tokens (D/E/F)

| | D Canopy | E Glass | F Signal |
|---|----------|---------|----------|
| Accent | `#2f5233` forest | white / frost | `amber-400` |
| Shape | rounded square | circle | pill |
| Popover | dark green panel | blur glass | warm black + amber border |
| Active state | green ring | white ring | amber glow dot |

## Pick a winner

Reply with variant (**D / E / F** or hybrid). Production extension will match chosen chrome + far-right mount.
