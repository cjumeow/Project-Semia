# Post-mortem: GTX POST batch → CORS → fallback flood → `/sorry/` rate limit

**Date:** 2026-08-03  
**Issues:** [#53](https://github.com/cjumeow/Project-Semia/issues/53) (batch transport), user report (302 → `google.com/sorry/`)  
**Branch:** `feat/gtx-multi-q-batch`  
**Fix commits:** `d6ddb5b` (GET batch + narrow fallback); earlier `2a49ae2` introduced POST batch

## Symptom

- YouTube + Semia GTX prewarm: hundreds of red `translate_a/single?client=gtx` requests
- Subtitles stuck on loading text (e.g. 翻訳を読み込中 / 翻譯載入中)
- DevTools: **302** with `Location: https://www.google.com/sorry/index?continue=...`
- Later requests: correct **GET** batch shape (`q` with `%0A` newlines) still fail while IP is hot

## Timeline

| Step | What we shipped | What happened |
|------|-----------------|---------------|
| 1 | #53: batch via **POST** + `parseGtxBatchResponse` | Content script POST to `translate.googleapis.com` → **CORS / Failed to fetch** from YouTube page |
| 2 | `translateCueBatch` **catch-all** on any batch error | Each failed 10-cue batch → **10 individual GET** (`translateGtxText`) |
| 3 | Prewarm **concurrency 12** (`MT_PREWARM_CONCURRENCY`) | Up to ~120 GTX requests in a short burst per failure wave |
| 4 | Debug reloads / long videos | **500+** requests; Google **302 sorry** / rate limit on IP |
| 5 | Fix `d6ddb5b`: GET batch + fallback only on `GtxBatchUnhealthyError` | Stops fan-out; IP still needs cooldown before recovery |

## Root causes (ranked)

1. **Wrong transport for extension context** — POST batch from YouTube **content script** is not equivalent to curl/Node spike. GET newline batch worked before #53.
2. **Failure amplification** — `catch { translateCueBatchIndividually }` turned **one** batch failure into **N** requests. Worst case worse than pre-batch Semia.
3. **No global circuit breaker** — 302/429/sorry did not stop prewarm; workers kept issuing requests.
4. **Spike gap** — #53 validated multi-`q` and POST in Node/curl, not in **Chrome extension content script** on `youtube.com`.
5. **Funlingo comparison trap** — Funlingo also floods `gtx`, but without our **×10 fallback** and with different burst shape; “they do it so we’re safe” is false without rate-limit metrics.

## What we learned (not guesses)

| Claim | Evidence |
|-------|----------|
| Multi `q` params with `client=gtx` only translate **first** string | Live spike during #53 (GET/POST) |
| Newline in **single** `q` batch works in GET | curl + extension payload with `%0A` |
| POST batch from content script triggers CORS | User Network + local repro pattern |
| Google responds with **302 → /sorry/** under abuse | User screenshot `Location` header |
| Catch-all fallback caused single-cue flood | Code path + 523 requests vs ~N/10 expected batches |

## Fixes applied

- Batch fetch: **GET** `buildGtxBatchUrl` (newline-joined `q`), keep structured parser + per-cue cache
- Fallback: only `GtxBatchUnhealthyError` → per-cue; network/CORS/429 **rethrow**
- Tests: `translateGtx.test.ts` asserts GET not POST; `translateCueBatch.test.ts` asserts no fan-out on `Failed to fetch`

## Still open (product / follow-up)

- [ ] **Circuit breaker** on 302/429/sorry — pause prewarm for session (or exponential backoff)
- [ ] **Lower concurrency** default (12 → 3–4) or adaptive throttle
- [ ] **Detect sorry HTML/302** in `translateGtx` and surface learning-only instead of retry storm
- [ ] Optional: route GTX through **background** service worker (host_permissions, no page CORS)
- [ ] Do not reintroduce POST batch without proving extension-context fetch in manual smoke

## Checklist before changing GTX transport again

1. **Spike in Chrome extension** on `youtube.com/watch`, not only Node/curl.
2. **Count requests** in DevTools for one video load; compare to `ceil(cueCount / batchSize)`.
3. **Never catch-all fallback** to N× single-cue without explicit product approval.
4. On batch failure, ask: does this **increase** request count? If yes, reject or add circuit breaker.
5. After local testing burst, **wait / switch network** if you see 302 sorry — do not keep reloading extension.
6. Read `gtx-prewarm-grilling.md` assumption **A1** (rate limit unproven).

## Regression tests to keep green

```bash
npx vitest run apps/extension/src/translateGtx.test.ts apps/extension/src/translateCueBatch.test.ts
```

Key behaviors:

- `translateGtxBatchTexts` uses GET, empty body
- `translateCueBatch` does not call `translateGtxText` on `TypeError('Failed to fetch')`

## Related docs

- [gtx-prewarm-grilling.md](./gtx-prewarm-grilling.md) — A1/A5 assumptions
- [funlingo-parity-report.md](./funlingo-parity-report.md) — Funlingo volume, not Semia-safe guarantee
- [spec-gtx-hybrid-native-line.md](./spec-gtx-hybrid-native-line.md)
- `docs/agents/debugging.md` — symptom row: GTX sorry / rate limit
