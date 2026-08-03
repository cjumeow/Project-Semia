# Funlingo parity spike report

**Date:** 2026-08-03 (network RE finalized same day)  
**Ticket:** [#36](https://github.com/cjumeow/Project-Semia/issues/36) · [issues/06-funlingo-parity-spike.md](./issues/06-funlingo-parity-spike.md)  
**Scope:** Research only — no production code changes.

## Executive summary

| Question | Answer |
|----------|--------|
| Does Funlingo use YouTube `tlang` like Semia? | **No (confirmed).** Network filter `tlang` → 0 hits on long-form YouTube videos. |
| Where does the native (ZH) line come from? | **Google `client=gtx` MT** on the **same learning cue text** — not a separate YouTube translate track. |
| Why does Funlingo feel better on long videos? | **1:1 cue alignment by construction** — native line is a translation of the *same* timed cue Semia already shows for word-click. |
| Why is seek instant after initial load? | **Full-video prewarm** — thousands of `gtx` / `inputtools` requests in the first few seconds; results cached locally. |
| OpenAI / Cloud Translation API? | **Not observed.** No `api.openai.com`, no paid Google Cloud Translation endpoints. |
| Blog claim of “90s batch MT”? | **Not what we observed on YouTube.** Implementation looks like **per-cue full-sentence `gtx`** plus **per-word** requests for hover gloss. |
| Can Semia match Funlingo while keeping `tlang` only? | **Not reliably** on coarse ASR+`tlang` pairs (Jo, Lex). Count/timing/semantic drift are structural. |
| Semia v3 mitigation (shipped) | Coarse `tlang` track → **learning-only** overlay — avoids wrong native, does not restore Funlingo-style dual line. |

## Funlingo architecture (confirmed — Network RE)

**Method:** Clean Chrome profile, Funlingo only, DevTools Network (`Preserve log`, `Disable cache`). Test videos: ~2hr interview (Lex-class) and Civil War clip. Initiator for extension calls: `youtube_content.js`.

### Data flow

```
YouTube timedtext (~40 req/video)
        │
        ▼
   EN cues (learning track)
        │
        ├─► gtx  sl=en  tl=zh  q=<full cue>     → ZH subtitle line (bottom)
        ├─► gtx  sl=auto tl=en q=<full cue>     → aux (language detect / JSON metadata; echoes EN)
        ├─► gtx  sl=en  tl=zh  q=<single word>  → hover gloss, e.g. (economic, 经济)
        └─► inputtools  text=<word> itc=zh-t-i0-und → hover IME suggestions / pronunciation

All results cached after ~few seconds loading burst → seek anywhere = 0 latency, no new API calls
```

### Three request types observed

| # | Endpoint | Example | Purpose |
|---|----------|---------|---------|
| **1** | `translate.googleapis.com/translate_a/single?client=gtx` | `sl=en&tl=zh&q=president` | Single-word EN→ZH (hover / vocabulary prewarm) |
| **2** | `inputtools.google.com/request` | `text=presidential&itc=zh-t-i0-und` | Single-word Input Tools (hover gloss; **Funlingo extension**, not YouTube) |
| **3** | `translate.googleapis.com/translate_a/single?client=gtx` | `sl=en&tl=zh&q=<full cue sentence>` | **Native subtitle line** (per cue) |
| **3b** | same as 3 | `sl=auto&tl=en&q=<full cue sentence>` | Auxiliary; response echoes EN + `"en"` lang tag — not the ZH line |

**Not observed:** `&tlang=` on any `timedtext` request. **Not observed:** `api.openai.com`, DeepL, or Google Cloud Translation API.

### Load behavior (~2hr video)

| Metric | Observed |
|--------|----------|
| `timedtext` requests | ~40 |
| `gtx` + `inputtools` burst | ~2000+ in first few seconds after video load |
| Per-cue pattern | At least one full-sentence `gtx` (en→zh); often a second identical or paired `gtx` (auto→en) |
| Per-word pattern | Separate `gtx` (word) + `inputtools` (word) for hover feature |
| After load | Arbitrary seek → **0 new requests**, ZH line appears instantly |
| Offline after load | ZH still available (local cache) |

### Duplicate identical requests (confirmed)

For the same cue, **two identical** `gtx` URLs sometimes appear (same `sl`, `tl`, `q`), both **200 OK**, initiated by `youtube_content.js`.

**Root cause (confirmed):** prewarm on load + **hover module fires the same request again** without sharing an in-flight / result cache across subsystems. This is **not** retry-on-failure (both succeed in parallel).

Example duplicate:

```
client=gtx&sl=auto&tl=en&q=They're rebels and traitors who almost destroyed the nation.
× 2  (331ms, 244ms — parallel)
```

### Blog vs observed (YouTube)

| Claim ([engineering blog](https://engineeringgetfunlingo.hashnode.dev/how-we-built-real-time-dual-subtitles-for-youtube-and-netflix-and-what-we-got-wrong-first)) | Observed on YouTube |
|--------|----------|
| Batch upcoming **90 seconds** of cues | **Per-cue** full-sentence `gtx` + full-vocabulary word prewarm |
| MT pipeline (unspecified vendor) | **`client=gtx`** free endpoint (same family as Semia `translateSelection.ts`) |
| Translation cache on replay | **Yes** — plus full-video prewarm on first open |
| Intercept learning VTT, not platform translate | **Consistent** — no `tlang` |

Treat the blog as directionally correct (MT learning cues, not `tlang` pairing) but **implementation details differ** on YouTube.

### Cost / stability implications

- **Free to user** because `gtx` / `inputtools` have no API key billing — not because MT is cheap at scale.
- **Unstable by design** — no SLA, rate limits, ToS risk; ~2000+ requests/video makes throttling likely at growth.
- Funlingo trades **engineering simplicity + free endpoints** for **request volume and duplicate calls**.

## Funlingo vs Semia

| Layer | Funlingo (confirmed) | Semia (shipped) |
|-------|----------------------|-----------------|
| Learning line | YouTube `timedtext` `lang=en` | Same |
| Native line | `gtx` MT of **same cue text** | YouTube `tlang` track + pairing gates |
| Alignment | Same cue index / timestamps | Overlap + gates; coarse → learning-only |
| Word hover | `gtx` word + `inputtools` | `translateSelection.ts` (`gtx`) on selection only |
| Seek latency | 0 after prewarm | Native from `tlang` when shown; hidden on coarse |
| API cost | Absorbed via free `gtx` (risk) | $0 (`tlang`); no full-video MT |

<!-- SPIKE:FIXTURES_START -->
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
<!-- SPIKE:FIXTURES_END -->

## Network RE reproduction checklist

Use a **new Chrome profile** with only Funlingo installed (incognito works if “Allow in incognito” is enabled on the extension).

1. Open long YouTube video with CC → wait for dual subtitles.
2. Network: filter `timedtext` — confirm ~O(10–40) requests, **no `tlang`** param.
3. Network: filter `client=gtx` — observe burst of ~1000–3000 requests in first few seconds.
4. Inspect payloads:
   - Full cue: `sl=en&tl=zh&q=<sentence>`
   - Single word: `sl=en&tl=zh&q=<word>`
   - Aux: `sl=auto&tl=en&q=<sentence>`
5. Filter `inputtools` — single-word hover (`itc=zh-t-i0-und`); initiator `youtube_content.js`.
6. Clear Network → seek to unplayed timestamp → confirm **no new** `gtx` requests.
7. Optional: go Offline after load → seek → ZH line still shows.
8. Hover a word → confirm duplicate `gtx` URL (prewarm cache not shared with hover module).

## Recommendations for Semia

| Option | Effort | Funlingo parity? | Trade-off |
|--------|--------|------------------|-----------|
| **A. Keep coarse → learning-only** | Done | No dual line on long videos | Safe, no wrong native |
| **B. MT translate learning cues** (Funlingo-like) | High | **Yes** — 1:1 alignment | Pick backend: BYOK LLM (quality) vs `gtx` spike only (ToS/rate-limit risk) |
| **C. Hybrid** — `tlang` when counts match; else MT | Medium | Partial | Best cost/quality balance |
| **D. Copy Funlingo `gtx` flood** | Med | Yes | **Not recommended** — ~2000 req/video, duplicates, no SLA |

**Recommendation:** For Funlingo-quality dual line on Lex/Jo-class videos, spike **hybrid + gtx batch prewarm** (approved 2026-08-03 grilling):

- `tlang` when not coarse; else **10 cues/batch** `gtx` prewarm on load
- UI:「翻譯載入中」during prewarm; both paths fail → learning-only
- See [gtx-prewarm-grilling.md](./gtx-prewarm-grilling.md) · [issues/07-gtx-hybrid-native-line-spike.md](./issues/07-gtx-hybrid-native-line-spike.md)
- Plan B if 429: BYOK DeepSeek batch (not Funlingo word flood)

## Reproduction

```bash
npm run spike:funlingo-parity
node --experimental-transform-types scripts/analyze-spike-fixtures.ts
npm test -- apps/extension/src/lexPairingRepro.test.ts
```

> **Note:** `spike:funlingo-parity` regenerates fixture tables only. The **Network RE section** above is maintained manually; re-running the script will not remove it if the script template is kept in sync (see `scripts/funlingo-parity-spike.ts`).

## References

- Semia spike #02: [spike-report.md](./spike-report.md)
- ADR-0003 gated native line: [docs/adr/0003-youtube-bilingual-gated-native-line.md](../../docs/adr/0003-youtube-bilingual-gated-native-line.md)
- Funlingo engineering blog: [dual subtitles](https://engineeringgetfunlingo.hashnode.dev/how-we-built-real-time-dual-subtitles-for-youtube-and-netflix-and-what-we-got-wrong-first), [subtitle adapters](https://engineeringgetfunlingo.hashnode.dev/the-hardest-part-of-building-a-language-learning-extension-isn-t-translation-it-s-subtitles)
- Funlingo Chrome Web Store: [Funlingo dual subtitles](https://chromewebstore.google.com/detail/funlingo-dual-subtitles-f/gjdpaicenfffjkgofmcjikilokigkonj)
