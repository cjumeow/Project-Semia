# 11 — Lex zh-Hans / zh-Hant fixture + pairing regression test

**GitHub:** [#41](https://github.com/cjumeow/Project-Semia/issues/41)

**What to build:** Lock the Lex Fridman #434 asymmetric pairing bug in CI. At ~1:57:41, the same English learning cue must pair correctly with `zh-Hans` (short, semantically aligned Simplified Chinese) and must **not** show native text for `zh-Hant` when the Traditional Chinese segment is a merged wrong paragraph (Sony mission / 跳脫固有思考模式 case). Deliver a fixture snapshot of both `tlang` tracks and regression tests at the pairing seam.

**Blocked by:** None — can start immediately.

**Status:** resolved

- [x] Fixture captures learning cue + `zh-Hans` + `zh-Hant` native segments at the repro timestamp
- [x] Test: `zh-Hans` → `confidence: high` with expected short native text
- [x] Test: `zh-Hant` → `confidence: none` (no misleading native line)
- [x] Reverse-verify at least one gate test fails when implementation is broken
