# Funlingo parity spike report

**Date:** 2026-08-03  
**Ticket:** [#36](https://github.com/cjumeow/Project-Semia/issues/36) · [issues/06-funlingo-parity-spike.md](./issues/06-funlingo-parity-spike.md)  
**Scope:** Research only — no production code changes.

## Executive summary

| Question | Answer |
|----------|--------|
| Does Funlingo use YouTube `tlang` like Semia? | **Unlikely on YouTube** — Funlingo engineering blog describes intercepting the **learning subtitle track** and running a **batched MT pipeline** on the same cue boundaries, not pairing against a separate `tlang` track. |
| Why does Funlingo "feel" better on long videos? | **1:1 cue alignment by construction** — native line is a translation of the *same* timed cue Semia already shows for word-click. |
| Can Semia match Funlingo while keeping `tlang` only? | **Not reliably** on coarse ASR+`tlang` pairs (Jo, Lex). Count/timing/semantic drift are structural. |
| Semia v3 mitigation (shipped) | Coarse `tlang` track → **learning-only** overlay — avoids wrong native, does not restore Funlingo-style dual line. |

## Funlingo architecture (public sources)

Sources: [Funlingo engineering blog — dual subtitles](https://engineeringgetfunlingo.hashnode.dev/how-we-built-real-time-dual-subtitles-for-youtube-and-netflix-and-what-we-got-wrong-first), [subtitle platform adapters](https://engineeringgetfunlingo.hashnode.dev/the-hardest-part-of-building-a-language-learning-extension-isn-t-translation-it-s-subtitles).

| Layer | Funlingo (described) | Semia (shipped) |
|-------|----------------------|-----------------|
| Learning line source | Intercept platform timedtext / VTT **before** player render | Intercept ASR `lang=en` timedtext (same) |
| Native line source | **MT batch translate** of upcoming ~90s of **same cues** | YouTube `&tlang=` auto-translate (**separate** segmentation) |
| Alignment | Same cue index / same timestamps | Time overlap + gates between mismatched tracks |
| Native CC | Suppress platform CC; own renderer | Hide YT CC; Semia pill overlay |
| Failure on zh-Hans vs zh-Hant | Blog: "bug in some languages but not others" — likely **MT/locale**, not `tlang` drift | Observed: **different `tlang` shapes** per locale |

**Hypothesis (primary):** Funlingo parity is not a smarter pairing function on `tlang` — it is a **different data source** (translate learning cues, not pair learning ↔ `tlang`).

**Hypothesis (secondary):** Extensions that *do* use `tlang` (e.g. yt-dual-subs) still suffer when cue counts differ; they may hide errors on short/equal-count videos only.

## Semia automated comparison (fixtures)

Strategies per row:

- **Index native** — `native[i]` (Funlingo-like only when counts + timing match)
- **Time-overlap native** — max interval overlap (Semia v1 spike strategy A)
- **Semia gate** — `pairNativeForLearningCue` (v2/v3 gates)
- **Semia overlay** — `resolveNativeCaptionLine` (v3: **hide all** on coarse track)

### Jo Van Eyck (`j_r93YulrUE`) — long ASR + `tlang` zh-Hant

- Learning cues: **674** · Native cues: **324** (48%) · Coarse: **true**
- Semia overlay policy: **learning-only** (coarse)

| # | time | EN (learning) | Index native | Time-overlap native | Semia gate | Semia overlay |
|---|------|---------------|--------------|---------------------|------------|---------------|
| 0 | 1.7s | Hey folks, I&#39;ve been coding with AI for | 大家好，我從事人工智慧程式設計工作已經 | 大家好，我從事人工智慧程式設計工作已經 | high | hide |
| 11 | 32.1s | to think about context engineering and | 考慮上下文工程，然後 | 考慮上下文工程，然後 | high | hide |
| 50 | 123.7s | shop engineering uh spew prompting sorry | 一年前所有需要的東西 | 商店工程之類的東西會引發抱歉 | high | hide |
| 96 | 236.1s | that. That&#39;s part of context engineering | 偷來的這句話，但有人說過，軟體設計是上下文工程，因為是的，程式碼庫和所有這些工具，呃，它們可以隨意瀏覽程式碼庫，你不需要給東西起描述性的名字，你也不需要考慮模組 | 等等。對我來說，這是情境工程的一部分， | high | hide |
| 100 | 245.4s | this quote from but someone said uh | 且高度內聚的。 | 設計，甚至呃，我不知道我從誰那裡 | none (no_overlap) | hide |
| 150 | 368.1s | without engineers having to babysit | 非常活躍的 | 無需工程師監督 | high | hide |
| 200 | 489.8s | that. Not at least not in the cloud code | 模型寫的，但是它們的內容，例如文字背後所傳達的訊息，是真實而有趣的。所以，是的，我確實認為你應該看看。  抱歉。不得不重拍一次。相機過熱了。我想，這應該是我們今 | 如果你是軟體工程師之類的專業人士，就不應該對此進行 | none (no_overlap) | hide |
| 250 | 608.4s | scale a bit more than than we before but | 上下文視窗等等，是的， | — | none (no_overlap) | hide |
| 300 | 727.7s | window | 如果你是軟體工程師，並且已經使用這些編碼代理程式一段時間了，這或許可以作為我的建議。我覺得現在是時候開始研究一下循環圖了，呃，也許還不是時候。雖然成本非常高昂， | — | none (no_overlap) | hide |
| 320 | 774.2s | articles called loop crafting. I think | 想法，整個 | — | none (no_overlap) | hide |

**Cue 96** (known production bug): index native is semantically wrong; time-overlap finds the aligned native (`等等。對我來說，這是情境工程的一部分`); Semia gate → `high` (correct pair) but overlay → **hide** (coarse track policy).

### Me at the zoo (`jNQXAC9IVRw`) — toy control (equal cue counts)

- Learning cues: **6** · Native cues: **0** · Coarse: **false**

> **Note:** Fixture native track empty (YouTube rate-limit on batch fetch). Re-fetch with `npm run spike:caption-pairing` for paired zoo data. Spike #02 reported 6×6 cues with 100% index/time alignment.


| # | time | EN (learning) | Index native | Time-overlap native | Semia gate | Semia overlay |
|---|------|---------------|--------------|---------------------|------------|---------------|
| 0 | 1.2s | All right, so here we are, in front of the
elephants | — | — | none (missing_track) | hide |
| 1 | 5.3s | the cool thing about these guys is that they
have really... | — | — | none (missing_track) | hide |
| 2 | 8.0s | really really long trunks | — | — | none (missing_track) | hide |
| 3 | 12.6s | and that&#39;s cool | — | — | none (missing_track) | hide |
| 4 | 14.4s | (baaaaaaaaaaahhh!!) | — | — | none (missing_track) | hide |
| 5 | 16.9s | and that&#39;s pretty much all there is to
say | — | — | none (missing_track) | hide |

Equal counts (when native track present): index ≈ time-overlap; Semia shows native on every cue. **Not representative** of long-form ASR + `tlang`.

### Rick Astley (`dQw4w9WgXcQ`) — lyrics, moderate mismatch

- Learning cues: **61** · Native cues: **0** (0%) · Coarse: **false**

| # | time | EN (learning) | Index native | Time-overlap native | Semia gate | Semia overlay |
|---|------|---------------|--------------|---------------------|------------|---------------|
| 0 | 1.4s | [♪♪♪] | — | — | none (missing_track) | hide |
| 5 | 35.2s | ♪ I just wanna tell you
how I&#39;m feeling ♪ | — | — | none (missing_track) | hide |
| 10 | 51.5s | ♪ Never gonna make you cry ♪ | — | — | none (missing_track) | hide |
| 12 | 55.7s | ♪ Never gonna tell a lie
and hurt you ♪ | — | — | none (missing_track) | hide |
| 15 | 69.1s | ♪ Inside we both know
what&#39;s been going ♪ | — | — | none (missing_track) | hide |
| 20 | 87.4s | ♪ Never gonna let you down ♪ | — | — | none (missing_track) | hide |
| 25 | 102.2s | ♪ Never gonna give you up ♪ | — | — | none (missing_track) | hide |
| 30 | 115.0s | ♪ Never gonna tell a lie
and hurt you ♪ | — | — | none (missing_track) | hide |
| 35 | 132.5s | ♪ Never gonna give,
never gonna give ♪ | — | — | none (missing_track) | hide |
| 40 | 149.5s | ♪ We know the game
and we&#39;re gonna play it ♪ | — | — | none (missing_track) | hide |

## Manual HITL: Funlingo side-by-side (required for full parity)

Automated run cannot install Funlingo. To complete the comparison on **Lex #434** (`e-gwvmhyU7A`) and Jo:

1. Install [Funlingo](https://chromewebstore.google.com/detail/funlingo-dual-subtitles-f/gjdpaicenfffjkgofmcjikilokigkonj) alongside Semia (separate profile or disable one extension at a time).
2. Open video → enable captions → Funlingo: learning **en**, native **zh-TW** (or zh-CN).
3. At each timestamp, record Funlingo native line vs Semia overlay:

| Video | Timestamp | EN (both) | Funlingo ZH | Semia ZH (v3) |
|-------|-----------|-----------|-------------|---------------|
| Jo `j_r93YulrUE` | 3:56 (cue 96) | *That's part of context engineering* | _fill_ | learning-only |
| Lex `e-gwvmhyU7A` | 1:57:41 | *you wanna really stick* | _fill_ | learning-only |
| Lex `e-gwvmhyU7A` | ~56:13 | *405B that's not released yet* | _fill_ | learning-only |

**Prediction:** Funlingo shows a **short, same-span** zh line aligned to the EN cue; Semia v3 shows **no** native line on Lex/Jo (coarse track).

## Recommendations for Semia

| Option | Effort | Funlingo parity? | Trade-off |
|--------|--------|------------------|-----------|
| **A. Keep coarse → learning-only** | Done | No dual line on long videos | Safe, no wrong native |
| **B. MT translate learning cues** (Funlingo-like) | High | **Yes** — 1:1 alignment | API cost, latency, cache; new `ai/` or translate module |
| **C. Hybrid** — `tlang` when counts match; else MT | Medium | Partial | Complexity |
| **D. Show YouTube native CC layer** | Low–med | Variable | Fights word-click UX (ADR-0003 strategy C) |

**Recommendation:** If product requires Funlingo-quality dual line on Lex/Jo-class videos, spike **Option B** next (translate learning `segments[i]` per cue or batched window) — not more `tlang` pairing gates.

## Reproduction

```bash
node --experimental-transform-types scripts/funlingo-parity-spike.ts
node --experimental-transform-types scripts/analyze-spike-fixtures.ts
npm test -- apps/extension/src/lexPairingRepro.test.ts
```

## References

- Semia spike #02: [spike-report.md](./spike-report.md)
- ADR-0003 gated native line: [docs/adr/0003-youtube-bilingual-gated-native-line.md](../../docs/adr/0003-youtube-bilingual-gated-native-line.md)
- Funlingo Chrome Web Store: [Funlingo dual subtitles](https://chromewebstore.google.com/detail/funlingo-dual-subtitles-f/gjdpaicenfffjkgofmcjikilokigkonj)
