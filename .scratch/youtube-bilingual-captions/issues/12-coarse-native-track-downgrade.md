# 12 — Coarse native track detection + degraded display

**GitHub:** [#42](https://github.com/cjumeow/Project-Semia/issues/42)

**What to build:** When the YouTube `tlang` native track is structurally coarse (native cue count far below learning cue count), automatically degrade bilingual display so users do not see misleading native lines. End-to-end: detect at fetch or pairing time, persist or compute the coarse signal, and overlay respects it (stricter per-cue gates or learning-only for the video). Jo Van Eyck and Lex `zh-Hant` fixtures should be covered.

**Blocked by:** [#41](https://github.com/cjumeow/Project-Semia/issues/41) — Lex zh-Hans / zh-Hant fixture + pairing regression test

**Status:** resolved

- [x] Coarse-track threshold defined and applied when native segment count ≪ learning count
- [x] Overlay never shows high-confidence native on videos flagged coarse (or uses stricter policy)
- [x] Existing Jo fixture (48% native/learning cue ratio) covered by test
- [x] `npm run verify` passes
