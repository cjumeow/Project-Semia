# Grilling: GTX full-video cue prewarm (Funlingo parity)

**Date:** 2026-08-03  
**Trigger:** Network RE on Funlingo (#36) — per-cue `client=gtx` prewarm on video load  
**Status:** Approved for spike (2026-08-03 grilling)

## Proposal (restated)

On each video load, Semia fires **one `gtx` request per learning cue** (entire cue text in `q=`), caches results, and uses them as the **native line** (replacing or supplementing `tlang` on coarse tracks).

**Assumption under test:** Google only limits **per-request payload size**, not **request count per IP per minute**. Therefore ~2000 small requests in a few seconds is acceptable and will not be blocked.

## What Funlingo actually did (evidence)

| Fact | Implication |
|------|-------------|
| ~40 `timedtext`, ~2000+ `gtx`/inputtools burst | Not “90s batch” on YouTube — per-cue + per-word |
| No `tlang` | Native line ≠ YouTube translate track |
| Seek 0 latency after load | Full prewarm + local cache |
| Duplicate identical URL on hover | Poor dedup — we should not copy |
| ~2000 users, still works | **Survivorship bias** — not proof at 10× scale |

Funlingo’s ~2000 requests include **per-word** `gtx` + `inputtools`, not only per-cue. A cue-only Semia implementation might be **~500–2000** requests for a 2hr video (cue count), fewer than Funlingo if we skip word prewarm.

## Assumptions grill

| # | Assumption | Verdict | Notes |
|---|------------|---------|-------|
| A1 | Google won’t rate-limit ~2000 small `gtx`/IP/min | **Unproven** | Funlingo anecdote only; no SLA; Google can change anytime |
| A2 | Per-cue `q=` always under URL length limit | **Mostly true** | Rare long merged cues may fail (~2k–8k char limits vary) |
| A3 | `gtx` response shape stable | **False long-term** | Semia already parses nested arrays; breaks silently |
| A4 | Using `gtx` for core subtitles is acceptable for Semia | **Product risk** | Undocumented API, ToS gray area; OK for **spike**, risky as **only** backend |
| A5 | Per-cue is optimal vs batching 10 cues/request | **Open** | Batching reduces count 10× with minimal latency cost |
| A6 | Users accept 3–10s loading burst | **Likely yes** | Funlingo trains this expectation |
| A7 | Cached translations persist across sessions | **Required** | Otherwise every revisit pays 2000 requests again |

## Grilling Q&A

### Q1: Spike or ship?

**If spike** — reasonable, low code cost (extend `translateSelection` pattern), validates Funlingo parity on Lex/Jo.  
**If ship as default** — need degradation story (429 → learning-only), persistent cache, and legal/ToS acknowledgment.

**Decision needed:** Spike-only first, or product commitment?

### Q2: Replace `tlang` entirely or hybrid?

| Strategy | Pros | Cons |
|----------|------|------|
| **Hybrid (recommended)** | $0 on good videos; MT only on coarse | Two code paths |
| **GTX-only native** | Simple mental model | Throws away free YouTube translate when it works |
| **`tlang` only (current)** | $0, no ToS risk | Lex/Jo learning-only after coarse gate |

ADR-0003 gate stays: **never show wrong native**. GTX prewarm should **only fill native when `tlang` is coarse or missing**, not replace high-confidence `tlang` pairs.

### Q3: What if 10% of cues return 429 mid-prewarm?

Funlingo may silently skip. Semia must not show partial wrong lines.

**Required behavior:**

- Prewarm progress indicator (optional)
- Per-cue: success → cache; failure → `nativeText = null` for that cue (learning-only)
- Exponential backoff + **concurrency cap** (e.g. 8–16), not 2000 parallel
- Do **not** block playback on prewarm completion

### Q4: Is per-cue better than batching?

**Per-cue (your proposal):**

- 1:1 cue index map — trivial
- ~2000 HTTP round-trips

**Batch 10–15 cues per `q=` (newline-separated):**

- ~200 requests for 2hr video
- Split response — need delimiter discipline
- Closer to Funlingo blog “90s batch” spirit

**Grill:** Per-cue is simpler to spike; batching is smarter if A1 is false.

### Q5: Does “Google allows 2000 requests” follow from Funlingo?

**No.** It only shows **one extension at modest scale hasn’t been blocked yet**.

Counter-evidence we don’t have:

- Semia + Funlingo + other extensions on same IP
- Google rolling out stricter extension throttling
- Corporate/school networks with transparent proxies

**Design as if rate limits exist** even if we hope they don’t.

### Q6: How does this interact with `translateSelection.ts`?

Same endpoint, same parser — good reuse.

**Must unify:**

- Shared `gtx` client module (`translateGtx.ts`)
- Shared cache: memory + `chrome.storage` keyed `(videoId, cueIndex, targetLang)` for cues; `(text, targetLang)` for selection
- **In-flight dedup** — Funlingo’s hover duplicate is a negative example

### Q7: `tl=zh` vs `tl=zh-TW`?

Funlingo uses `tl=zh`. Semia `translateSelection` uses `zh-TW`. Align with `SemiaSettings.nativeLanguage` and `toYoutubeTlang` mapping.

## Recommendation (grilling outcome)

| Phase | Action |
|-------|--------|
| **Now** | Approve **spike**: hybrid native line — `tlang` when not coarse; else **gtx per-cue prewarm** with concurrency cap + persistent cache |
| **Spike success criteria** | Lex #434 + Jo: native line on timestamps where Semia today shows learning-only; no semantic mismatch vs Funlingo spot-check |
| **Spike failure modes** | Document 429 rate, % cues failed, load time |
| **Not now** | Commit to gtx as sole production backend; copy Funlingo word-level flood |
| **Later** | If spike hits rate limits → BYOK DeepSeek batch; if stable → optional “use free translate” toggle with disclaimer |

## Open decisions (need product owner)

1. [x] **Spike first** — batch-based `gtx` prewarm; production path TBD after metrics  
2. [x] **Hybrid** — `tlang` when not coarse + pairing `high`; else learning-cue MT prewarm  
3. [x] **Batch 10 cues/request** — reduce if prewarm latency too high (tune down)  
4. [x] **UI** — show「翻譯載入中」during prewarm; if both `tlang` and MT fail → learning-only (no error banner)

**Decided:** 2026-08-03 (grilling follow-up)

## Spike spec (approved)

### Native line resolution order

```
1. Bilingual off → learning only
2. Fetch learning track (required)
3. If NOT coarse native track:
     pair tlang via pairNativeForLearningCue
     confidence high → show tlang native
4. If coarse OR tlang missing OR pairing none:
     start gtx prewarm (10 cues/batch)
     while prewarming → show「翻譯載入中」on native slot (learning line unchanged)
     per-cue MT success → show cached translation
     per-cue MT fail → learning-only for that cue
5. If entire prewarm fails (e.g. sustained 429) → learning-only for whole video
```

### GTX prewarm implementation notes

| Parameter | Value |
|-----------|-------|
| Batch size | **10 cues** per `q=` (newline-separated EN text) |
| Concurrency | **8–16** parallel batch requests (not unbounded) |
| Endpoint | `client=gtx`, `sl=en`, `tl=` from `nativeLanguage` (`zh-TW` etc.) |
| Cache key | `(videoId, cueIndex, nativeLanguage)` → `chrome.storage` |
| In-flight dedup | Shared with `translateSelection` via unified `translateGtx` module |
| Tune-down | If p95 prewarm time > threshold (e.g. 15s on 2hr video), try batch 5 |

### Spike success criteria

- Lex `e-gwvmhyU7A` + Jo `j_r93YulrUE`: native line at timestamps where Semia v3 is learning-only
- Document: load time, 429 count, % cues failed, batch size used
- Spot-check 3 cues vs Funlingo (semantic alignment, not identical wording)

### Out of scope (spike)

- Per-word `gtx` / `inputtools` prewarm (Funlingo hover flood)
- BYOK LLM batch (plan B if spike hits rate limits)
- Replacing `tlang` on non-coarse videos

## Proposed ADR (draft — pending spike metrics)

**Working title:** ADR-0004: Hybrid native line — `tlang` + gtx batch prewarm on coarse tracks

1. Native line source: paired `tlang` **or** MT of learning cue text — never misleading index-paired `tlang` on coarse tracks.
2. GTX prewarm: 10 cues/batch, concurrency-capped; persistent cache; learning-only on failure.
3. UI: native slot shows loading during prewarm; no error banner on total failure.
4. Spike metrics required before production commitment; plan B = BYOK LLM batch.
