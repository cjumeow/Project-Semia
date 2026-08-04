# SaaS theme — UI prototype

**Question:** Badge colors (Due now / n cards), intent chips (Speaking / Writing), and note-card layout under B theme.

## Run

```bash
npm run prototype:saas-theme
```

http://localhost:5173/?prototype=saas-theme

← → switches **badge + intent style** (A/B/C). Theme stays B (press-forward).

## Locked chrome (all variants)

- No sidebar header · Practice above Study cards
- Inbox triage square buttons only (no status circles)
- Right column = bordered note card (`proto-note-card`)
- Language card = Discuss-style `#1F57D1` pill
- Context highlight = `#FFEB3B`
- Example block bg = sidebar shelf `#F8FAFC`, Speaking lines = bullet list

## Style variants

| Variant | Due now / schedule / cards | Speaking / Writing |
|---------|---------------------------|-------------------|
| **A** Warm urgent | Amber due · accent-soft cards · muted schedule | Blue / violet uppercase pills |
| **B** Cool neutral | Rose due · slate border cards | Sky / violet bordered chips |
| **C** Accent unified | Accent-blue family for all badges | Outline pills + colored dot |

Center list shows all three badge types on different snippets. Right card shows both intent tags + Speaking examples.

## Pick a winner

Reply with variant (or mix, e.g. A badges + B intents). Fold into production components.
