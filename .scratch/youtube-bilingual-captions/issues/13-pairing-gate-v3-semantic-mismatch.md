# 13 — Pairing gate v3 — Lex zh-Hant semantic mismatch

**GitHub:** [#43](https://github.com/cjumeow/Project-Semia/issues/43)

**What to build:** Tighten pairing gates so moderate-length but semantically wrong `zh-Hant` segments (timing-aligned yet wrong meaning) are rejected. Lex #434 @ ~1:57:41 must show correct Traditional Chinese or learning-only — never the wrong merged paragraph. Gate changes live at the pairing seam; overlay unchanged except consuming stricter `confidence: none`.

**Blocked by:** [#42](https://github.com/cjumeow/Project-Semia/issues/42) — Coarse native track detection + degraded display

**Status:** resolved

- [x] Lex `zh-Hant` regression from #11 passes
- [x] Jo Van Eyck time-overlap pairing still works for known-good cues
- [ ] Manual smoke: Lex #434 @ ~1:57:41 with 繁體 — correct or learning-only, not wrong block
- [x] `npm run verify` + reverse-verify
