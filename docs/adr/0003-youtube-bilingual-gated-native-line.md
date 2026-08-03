# ADR-0003: YouTube bilingual overlay — gated native line

**Status:** Accepted (2026-08-03)  
**Amends:** [ADR-0002](./0002-youtube-bilingual-captions-spike-first.md) (decisions 1–2, consequences)  
**Parent spec:** GitHub [#35](https://github.com/cjumeow/Project-Semia/issues/35)

Spike #02 showed index pairing is unsafe and time overlap alone is insufficient for perfect coverage. Product still requires **no misleading native text** (grilling Q1). Implementation ships a **gate-first** dual-line overlay: native line renders only when automated pairing returns `confidence: high`; otherwise learning-only for that cue.

Perfect Funlingo-level coverage on every cue remains a **product goal**, not a blocker for shipping gated behavior. Escalation paths (Funlingo parity spike #36, LLM-assisted alignment) stay open.

## Decisions

1. **Render native line only when `PairingConfidence === high`.** If pairing returns `none`, show the learning line only for that cue. Never show native text with a warning flag in the overlay.
2. **Pairing strategy (v1):** `pairNativeForLearningCue` — time-overlap candidate selection plus gates (overlap ratio, start-time delta, native/learning length ratio, ambiguity tie-break → `none`). Index `cue[i]` ↔ `native[i]` is **not** used for display.
3. **Bilingual toggle** controls whether the translation track is **fetched** (`tlang`). Per-cue **display** is independently gated by pairing confidence.
4. **Overlay UX:** Learning line unchanged (word-click capture). Native line is subordinate (smaller type, reduced opacity) under the learning line in a single pill.
5. **Subtitle settings on YouTube bottom bar** are shipped (popover: learning/native language, bilingual on/off). Distinct from corpus Settings and extension Options AI keys.
6. **v1 scope:** `learning ≠ native` with YouTube `tlang` auto-translate. Human-uploaded independent translation tracks (e.g. separate zh-TW upload) and YouTube native CC as a second visual layer remain out of scope.
7. **Known failure mode — matching error:** When a native line appears but should not (e.g. short learning cue paired with a long merged `tlang` paragraph, often after switching native language and refetching). Classify as **span mismatch** or **semantic mismatch**; tighten gates or hide native during refetch in follow-up work. Do not revert to learning-only globally.

## Amends ADR-0002

| ADR-0002 decision | ADR-0003 change |
|-------------------|-----------------|
| (1) Ship learning-only until pairing validated | **Amended:** gated native line allowed when `high` |
| (2) No YouTube settings panel until prototype | **Superseded:** variant A settings shipped |
| Spike defer dual-line | **Amended:** dual-line shipped with strict gate; perfect coverage deferred |

ADR-0002 spike conclusions (no index pairing, time overlap necessary but insufficient) **remain in force** for product quality bar and future pairing v3.

## Considered options

| Option | Outcome |
|--------|---------|
| Ship index-paired dual-line | Rejected (spike falsified) |
| Ship time overlap without gates | Rejected (Jo Van Eyck semantic / span failures) |
| Gate-first dual-line (chosen) | Shipped #37–#38 |
| LLM pairing for every cue | Deferred — cost/latency; spike later |
| Hide all native until Funlingo parity | Rejected — user value from gated lines on many videos |

## Consequences

- Positive: Bilingual UX on YouTube without index-pairing regressions; single pairing seam testable in CI.
- Negative: Many cues remain learning-only when gates fail; occasional **matching errors** when gates are too loose or `tlang` segmentation is coarse; native-language switches trigger refetch and may briefly change pairing behavior.
- Follow-up: Funlingo parity report (#36), matching-error gate tightening, optional ADR amendment if LLM pairing ships.

## References

- Spike report: `.scratch/youtube-bilingual-captions/spike-report.md`
- Pairing seam: `apps/extension/src/cuePairing.ts` (`pairNativeForLearningCue`)
- Overlay: `apps/extension/src/captionOverlay.ts`, `captionNativeLine.ts`
