# Spec: Hybrid native line (tlang + GTX batch prewarm)

**Status:** Ready for implementation  
**GitHub:** [#44](https://github.com/cjumeow/Project-Semia/issues/44)  
**Parent research:** [#36](https://github.com/cjumeow/Project-Semia/issues/36) Funlingo parity  
**Grilling:** [gtx-prewarm-grilling.md](./gtx-prewarm-grilling.md)  
**ADR context:** [ADR-0003](../../docs/adr/0003-youtube-bilingual-gated-native-line.md) (amend with ADR-0004 after spike metrics)

## Problem Statement

On long YouTube videos (e.g. Lex #434, Jo Van Eyck), YouTube's `tlang` auto-translate track is **coarse** — far fewer native cues than learning cues, with different segmentation. Semia v3 correctly hides the native line on these videos (**learning-only**) to avoid **matching errors**, but learners lose dual-subtitle support where competitors (Funlingo) still show aligned Chinese.

Funlingo achieves alignment by **translating the same learning cue text** via Google's free `gtx` endpoint, with full-video **translation prewarm** on load. Network RE confirmed: no `tlang`, per-cue/batch `gtx`, local cache, instant seek after load.

Semia users watching long-form English content with Traditional/Simplified Chinese as **native language** need a native caption line that matches the learning cue without wrong `tlang` pairings — without paying for Cloud Translation API or requiring an AI API key for basic dual subtitles.

## Solution

Ship a **hybrid native line**:

1. When the `tlang` track is **not coarse** and pairing confidence is **high**, keep the current `tlang` path (free, no extra requests).
2. When the track **is coarse** (or `tlang` is missing / pairing fails), **prewarm** translations of learning cues via **`gtx` in batches of 10 cues**, cache by `(videoId, cueIndex, nativeLanguage)`, and show the cached text as the native line.
3. While prewarm is in progress for the active cue, show **「翻譯載入中」** in the native slot; learning line and word-click remain unchanged.
4. If both `tlang` and MT fail for a cue (or the whole prewarm fails), show **learning-only** — no error banner.

This is a **spike-first** delivery: measure load time, 429 rate, and failure % before committing to `gtx` as a long-term backend. Plan B: BYOK LLM batch.

## User Stories

1. As a learner watching a long English interview with bilingual mode on, I want a Chinese native line aligned to each English cue, so that I can follow content without misleading translations from mismatched `tlang` segmentation.
2. As a learner on a short video where `tlang` pairs well, I want Semia to keep using YouTube's free translation track, so that I don't wait for unnecessary MT prewarm.
3. As a learner opening a coarse-track video, I want to see「翻譯載入中」briefly in the native slot, so that I know translation is loading rather than missing.
4. As a learner, I want the English learning line and word-click capture to work immediately, so that prewarm never blocks my primary study workflow.
5. As a learner who seeks to an unplayed section after load, I want the native line to appear instantly, so that navigation feels like Funlingo.
6. As a learner revisiting a video I watched before, I want cached translations reused, so that I don't trigger another full prewarm burst.
7. As a learner on a cue where translation failed, I want learning-only for that cue, so that I never see a confidently wrong native line.
8. As a learner when the entire prewarm fails (e.g. rate limit), I want the whole video to fall back to learning-only without a scary error, so that I can still use Semia.
9. As a learner with native language set to zh-TW, I want GTX target language to match my setting, so that translations match my subtitle settings.
10. As a learner switching native language (zh-CN ↔ zh-TW), I want prewarm to restart for the new target language, so that native text matches my choice.
11. As a learner using text selection translate in the sidebar, I want the same GTX client and cache as subtitles, so that duplicate requests are avoided.
12. As a learner on a video without coarse `tlang`, I want zero additional `gtx` subtitle requests, so that Semia stays lightweight on videos that already work.
13. As a developer, I want one resolution seam for "what native text shows for this cue", so that overlay logic stays testable.
14. As a developer, I want batch split and GTX parsing covered by unit tests, so that API format changes are caught in CI.
15. As a maintainer, I want spike metrics (duration, 429, fail %) recorded in scratch notes, so that we can decide ADR-0004 and plan B.

## Implementation Decisions

### Single seam (native line resolution)

Extend **`resolveNativeCaptionLine`** (or equivalent pure resolver) as the **only** place that decides native overlay output. Inputs include: learning cue, optional `tlang` segments, coarse-track flag, optional MT cache map, prewarm status for cue/video, suppression flag.

Return a discriminated result (conceptual):

```
NativeLineResult =
  | { status: 'text'; text: string }      // tlang high or MT cache hit
  | { status: 'loading' }                 // coarse + prewarm in flight
  | { status: 'none' }                    // learning-only
```

Resolution order (matches grilling):

1. Suppressed → `none`
2. Not coarse + `tlang` pairing `high` → `text` from paired native
3. Coarse (or no usable `tlang`) → MT cache hit → `text`; prewarm pending → `loading`; miss/fail → `none`

Overlay consumes this result; no pairing or MT logic in the overlay component.

### GTX translation module

- Extract shared **`translateGtx`** from current selection-translate behavior: fetch, parse nested-array response, **in-flight dedup** by cache key, memory cache.
- **`translateCueBatch`**: accept up to 10 learning cue texts + source/target language; join with delimiter for `q=`; parse response back into per-cue strings (delimiter discipline + fallback if split ambiguous).
- Map `nativeLanguage` setting to GTX `tl=` parameter (align with existing zh-TW / zh-CN handling).
- Concurrency cap **8–16** parallel batch requests; exponential backoff on 429; do not fire unbounded parallel requests.

### Translation prewarm orchestration

- Trigger prewarm when bilingual is on and `isCoarseNativeTrack(learningCount, nativeCount)` is true (or when `tlang` fetch fails — product choice: same path).
- Orchestration in **background** (thin handler); content script / overlay requests status via existing message pattern.
- Persist cache in extension storage keyed by video + cue index + native language; check cache before network.
- Batch size **10** cues; tunable down to **5** if p95 prewarm latency exceeds threshold (config constant, not user-facing in spike).

### UI

- Native slot renders: translated text |「翻譯載入中」| hidden (learning-only).
- Learning line unchanged; word-click unchanged.
- No modal or toast on total prewarm failure.

### Code cleanup (in scope for this issue)

- Unify selection translate and subtitle MT behind **`translateGtx`** (remove duplicate fetch/parse).
- Update **`resolveNativeCaptionLine` tests**: coarse track + populated MT cache → `text`; coarse + loading → `loading`; coarse + empty cache + not loading → `none` (replaces today's always-`none` on coarse).
- Update **Lex/Jo repro tests** to assert MT path when cache fixture provided.
- Fix scratch ticket numbering collision (`07-gtx` vs `07-gated` → use GitHub issue number).
- Update grilling doc status from "under debate" to "approved".

### Code cleanup (out of scope — separate PRs)

- Corpus prototype variants M–Q, palette experiments, unrelated subtitle CSS/icon WIP on branch.
- Removing `it.fails` diagnostic tests unless explicitly decided after MT path ships.
- ADR-0004 formal write until spike metrics collected.

### Storage / types

- Extend stored transcript or separate storage namespace for MT-native cache entries (videoId, cueIndex, nativeLanguageCode → translated text).
- No changes to `LanguageFragment` or corpus domain types.

## Testing Decisions

**Principle:** Test external behavior at the **highest pure seam** — `resolveNativeCaptionLine` / `NativeLineResult` and batch parse helpers. Do not test Chrome storage or network in unit tests.

| Module / behavior | What to test | Prior art |
|-------------------|--------------|-----------|
| `resolveNativeCaptionLine` + MT inputs | coarse + cache → text; loading state; hybrid prefers tlang when not coarse | `captionNativeLine.test.ts`, `lexPairingRepro.test.ts` |
| `parseGtxBatchResponse` / cue split | 10 lines in → 10 strings out; empty; malformed → partial failure | `translateSelection` parser pattern |
| `isCoarseNativeTrack` trigger | unchanged; integration via resolver tests | `cuePairing.ts` tests |
| In-flight dedup | same key concurrent → one fetch (mock fetch) | new; keep minimal |

**Manual smoke:** Lex `e-gwvmhyU7A` + Jo `j_r93YulrUE` — native line at known timestamps; Network shows `gtx` batches only on coarse videos; seek after load = no new requests.

**Spike metrics:** Record in `.scratch/youtube-bilingual-captions/gtx-spike-results.md` (not CI).

## Out of Scope

- Per-word `gtx` / `inputtools` prewarm (Funlingo hover flood)
- BYOK LLM / DeepSeek batch (plan B ticket)
- Replacing `tlang` on non-coarse videos
- Funlingo-style inline `(word, 翻译)` gloss on EN line
- Corpus UI changes
- Paid Google Cloud Translation API
- Production commitment to `gtx` without spike metrics

## Further Notes

- **Funlingo reference:** [funlingo-parity-report.md](./funlingo-parity-report.md)
- **Seam check:** Native resolution stays in one pure function; prewarm is orchestration only. Confirm this matches intent before implementation.
- **Open GitHub issues #40–#43** may overlap with pairing v3 work on branch — implement GTX hybrid **after** or **on top of** merged pairing fixes; resolver extension should compose, not fork pairing logic.
- **Risk:** `gtx` is undocumented; spike must document 429 behavior. Do not assume Funlingo's ~2000 req/video proves scale.
