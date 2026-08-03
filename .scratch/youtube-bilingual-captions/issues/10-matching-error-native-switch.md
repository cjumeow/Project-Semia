# 10 — Fix matching error on native-language switch

**GitHub:** [#40](https://github.com/cjumeow/Project-Semia/issues/40)

**What to build:** Prevent span-mismatch matching errors (short EN + long native paragraph), especially after switching native language zh-CN ↔ zh-TW. Tighter gates and/or hide native during refetch; regression test at pairing seam.

**Blocked by:** None — can start immediately.

**Status:** resolved

- [x] Fixture / repro test at `pairNativeForLearningCue` or `resolveNativeCaptionLine`
- [x] Fix refetch window and/or pairing gates
- [x] `npm run verify` + reverse-verify
