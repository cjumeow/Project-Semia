# Diagnosing: Lex #434 405B short semantic mismatch

**Date:** 2026-08-03  
**Symptom:** EN *and the 405B that's not released yet* paired with 繁中 *收入上，而且可能會犯很多錯* (wrong meaning).  
**Video:** `e-gwvmhyU7A` (Lex #434), ~00:56:13 per human transcript.

## Phase 1 — Feedback loop ✅

**Command:**

```bash
npx vitest run apps/extension/src/lex405bPairingDiagnosis.test.ts
```

**Red-capable tests (symptom):** use `it.fails` so CI records the gap without blocking verify.

- `aligned short semantic mismatch must not return high confidence`
- `overlay must hide misleading native for screenshot pair`

**Run output (2026-08-03):** symptom tests **pass as `it.fails`** (underlying assertion still red). Fetched-track tests **PASS**.

Fixture: `apps/extension/src/fixtures/lex-e-gwvmhyU7A-405b-repro.json`

## Phase 2 — Reproduce + minimise ✅

| Layer | Finding |
|-------|---------|
| **User screenshot pair** | Same `start`/`duration`, short wrong zh → gates pass → `high` |
| **Fetched EN @ 3413.48s** | `"is there and the 405b that's not"` |
| **Fetched correct zh-Hant with 405b** | @ **3326.12s** (−87s drift!) — time overlap cannot find it |
| **Best overlap @ 3413** | `"2016年，你"` / RL paragraph — wrong topic; **timing gate → `none`** on full pairing |
| **User zh text in fetch** | `"收入上，而且可能會犯很多錯"` **not found** in current `tlang=zh-Hant` pull — may be different moment, stale cache, or paraphrased screenshot |

**Minimised repro (load-bearing):** `symptom.learning` + `symptom.nativeZhHantWrong` with aligned timing.

## Phase 3 — Ranked hypotheses (before fix)

1. **Short semantic mismatch passes all heuristics** (confirmed)  
   *If this is the cause, tightening length/granularity won't help; only semantic check or learning-only on coarse tracks will.*

2. **tlang track temporal drift** (confirmed on fetch)  
   *If this is the cause, correct 405b zh exists but 87s away — time overlap can never pair correctly at 3413s.*

3. **User screenshot zh not in latest fetch**  
   *If this is the cause, on-screen text may be stale transcript or different cue boundary than we captured.*

4. **Extension not reloaded after #41–#43**  
   *If this is the cause, user still sees pre-granularity behavior on stick case; 405B may be a separate class.*

5. **Coarse track still shows some `high` pairs that are wrong but timing-aligned**  
   *If this is the cause, product fix is default learning-only when `isCoarseNativeTrack` (nuclear) or semantic gate.*

## Phase 4–5 — Fix applied (option A)

**Decision:** Coarse `tlang` track (native cues < 70% of learning) → **learning-only** for the whole video in overlay.

**Change:** `resolveNativeCaptionLine` returns `null` early when `isCoarseNativeTrack`. Pairing seam (`pairNativeForLearningCue`) unchanged for diagnostics.

**405B screenshot:** overlay test now **passes**. `pairNativeForLearningCue` still `high` for aligned wrong pair (`it.fails` documents seam gap).

**Trade-off:** Lex / Jo lose all native lines on coarse tracks, including previously good zh-Hans pairs.

## Phase 6 — Post-mortem note

Heuristic gates (length, span, granularity) only catch **shape** mismatches. **Short wrong native** and **temporal drift** need different seams — document in ADR-0003 follow-up.
