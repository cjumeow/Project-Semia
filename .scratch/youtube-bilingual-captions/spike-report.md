# Caption pairing spike report

**Date:** 2026-08-03  
**Ticket:** [02-caption-pairing-spike.md](./issues/02-caption-pairing-spike.md)  
**ADR:** [ADR-0002](../../docs/adr/0002-youtube-bilingual-captions-spike-first.md)

## Methods

| Strategy | Definition |
|----------|------------|
| **A — Time overlap** | For each learning cue, pick native cue(s) with maximum interval overlap (>10ms). |
| **B — Index gate** | Pair learning cue *i* with native cue *i* only when `start` and `duration` match within ±50ms. |
| **C — YouTube native CC** | Manual assessment — Semia hides YT CC today; dual-layer means YT translate UI + Semia learning overlay. |

Tracks fetched via YouTube InnerTube (ANDROID client). Translation uses `&tlang=zh-Hant` on the English ASR `baseUrl` unless noted as human `zh-TW` upload.

**Note:** YouTube rate-limits automated `tlang` fetches. Batch runs often return empty native tracks; numbers below combine saved fixtures plus verified single-video fetches (see §Jo Van Eyck).

## Summary table

| Video | Mode | L cues | N cues | Index timing % | Time overlap % | Multi-match % |
|-------|------|--------|--------|----------------|----------------|---------------|
| `j_r93YulrUE` | tlang | 674 | 324 | ~48%† | ~48%† | low† |
| `jNQXAC9IVRw` | tlang | 6 | 6 | **100%** | **100%** | 0% |
| `dQw4w9WgXcQ` | tlang | 61 | 49 | **10%** | **80%** | 0% |
| `kCc8FmEb1nY` | tlang | 2955 | 932 | **1%** | **67%** | 0% |
| `aircAruvnKk` | human zh-TW | 286 | 231 | **0%** | **100%** | ~40%‡ |

† Jo Van Eyck: native count is **48%** of learning count — index pairing is structurally invalid for cues ≥324. Timing-aligned pairs can still be **semantically wrong** (see case study).  
‡ 3Blue1Brown: many learning cues overlap multiple human zh-TW cues; time picker often chooses a shorter overlapping segment, not the full human translation line.

Re-run analysis on fixtures: `node --experimental-transform-types scripts/analyze-spike-fixtures.ts`

## Case study: Jo Van Eyck (`j_r93YulrUE`)

**Production bug reproduced** on 2026-08-03 fetch (674 EN ASR cues, 324 `tlang` zh-Hant cues).

| cue | Learning (EN) | Index-paired native (ZH) | Verdict |
|-----|---------------|--------------------------|---------|
| 11 | `to think about context engineering and` | `考慮上下文工程，然後` | ✅ Reasonable |
| **96** | `that. That's part of context engineering` | `偷來的這句話，但有人說過，軟體設計是上下文工程…` (long paragraph) | ❌ **Wrong** — matches user screenshot |

**Time overlap at cue 96:** no native segment shares the learning interval → time-based strategy returns **empty** for this cue.

**Root cause:** `tlang` track uses **fewer, longer cues** than ASR English. Index *i* is not “the translation of English cue *i*”; it is often a unrelated merged span. Timing gate alone cannot catch semantic mismatch when windows accidentally align.

## Per-video notes

### `jNQXAC9IVRw` — Me at the zoo

Short video, equal cue counts, perfect timing alignment. **Toy example only** — not representative of ASR + `tlang` on long-form content.

### `dQw4w9WgXcQ` — Rick Astley

Cue count mismatch (61 vs 49). Index pairing maps lyrics to wrong verses (e.g. cue 12 EN vs ZH). Time overlap helps (80%) but still not lyric-accurate.

### `kCc8FmEb1nY` — Fireship

Large ASR track (2955) vs 932 `tlang` cues. Index timing **1%**. Time overlap **67%** — better, but still lossy on fast-cut content.

### `aircAruvnKk` — 3Blue1Brown (human zh-TW)

Independent human translation track — **0%** index timing. Time overlap finds *some* text for every cue, but human zh lines are often **longer** than the overlapping EN window (cue 0: EN “This is a 3.” vs ZH full sentence about 28×28 pixels). Not suitable for Funlingo-style single-line pill without smarter merging.

## Strategy C — YouTube native CC

| Pros | Cons |
|------|------|
| YouTube owns translation + segmentation | Conflicts with Semia hiding YT CC for word-click overlay |
| No Semia pairing code | Two visual systems; learning capture still needs Semia track |

**Verdict:** Prototype only. Does not solve single-pill UX.

## Failure modes

1. **Cue count mismatch (`tlang`)** — Jo Van Eyck 674→324; Rick 61→49; Fireship 2955→932.
2. **`tlang` fetch blocked** — automated runs hit Google “Sorry…” HTML; extension in-browser fetch may fare better (credentials).
3. **Semantic drift under index pairing** — timing can match while meaning does not (Jo cue 96).
4. **Human dual tracks** — different segmentation; time overlap ≠ translation equivalence.
5. **Time overlap empty** — when native cues are longer and offset, learning cue may have zero overlap.

## Recommendation

| Decision | Rationale |
|----------|-----------|
| **Defer dual-line overlay** | No automated strategy produces trustworthy EN↔ZH lines on the Jo Van Eyck case (the original failure). |
| **Do not ship index pairing** | Fails on count mismatch and semantics. |
| **Time-based is necessary but insufficient** | Better coverage on some videos, still wrong or empty on Jo cue 96. |
| **Ticket #03 prototype** | Proceed with settings UI only. |
| **Ticket #05 bilingual** | **Blocked** until a new data strategy (e.g. in-browser fetch + human QA pass, or accept YT-native CC layer). |

Optional follow-up: export paired samples from extension on Jo Van Eyck at 10 timestamps for manual QA before any reconsideration.

## Artifacts

- Fixtures: [`fixtures/`](./fixtures/) (partial native tracks when rate-limited)
- Spike script: `npm run spike:caption-pairing`
- Analysis helpers: `apps/extension/src/captionPairingAnalysis.ts`
