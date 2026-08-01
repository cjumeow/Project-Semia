# Chrome Extension Debugging Playbook

Quick reference for agents fixing bugs in Project Semia. For the full architecture
review and refactor history, see `docs/architecture-review-2026-08.md`.

## Execution contexts

The extension is not one program. Five runtimes cooperate:

| Context | Entry file | Role |
|---------|------------|------|
| MAIN world (YouTube only) | `apps/extension/src/pageWorld.ts` | Intercept `fetch`/XHR for timedtext URLs → `postMessage` |
| Content script (YouTube) | `apps/extension/src/contentScript.ts` | Sidebar, caption overlay, transcript capture, SPA watcher |
| Content script (web) | `apps/extension/src/webContentScript.ts` | Selection toolbar, web capture, jump-back restore |
| Service worker | `apps/extension/src/background.ts` | Thin bootstrap: listeners + message dispatch |
| Corpus UI | `apps/corpus/src/` | SEMIA library; talks to extension via `corpusRepository` |

### Service worker layout (Phase 4)

`background.ts` only registers Chrome listeners. Logic lives in:

| Module | Role |
|--------|------|
| `background/messageRouter.ts` | Dispatch `BackgroundMessage` to the right pipeline |
| `background/fragmentPipeline.ts` | Fragments, corpus notes, snippet notes, deletes, web capture |
| `background/transcriptPipeline.ts` | Transcript save/list/error; oembed enrichment bootstrap |

**Domain storage writes go through the background service worker.** Content scripts
call `submitCapture.ts` (`SAVE_FRAGMENT`); corpus calls `SAVE_CORPUS_NOTE`. The
`*Storage.ts` modules perform the actual `chrome.storage.local.set` and are only
imported from background pipelines (not from content scripts or corpus).

**Reads may still be direct** — e.g. corpus `getNotes()` reads `CORPUS_NOTES_STORAGE_KEY`
from storage without a message.

## Storage keys

Defined in `packages/shared/src/storageKeys.ts`:

| Key constant | Storage key string | Written by |
|--------------|-------------------|------------|
| `FRAGMENTS_STORAGE_KEY` | `languageFragments` | background (`fragmentPipeline` → `fragmentsStorage`) |
| `SNIPPET_NOTES_STORAGE_KEY` | `snippetNotes` | background (`fragmentPipeline` → `snippetNotesStorage`) |
| `TRANSCRIPTS_STORAGE_KEY` | `youtubeTranscripts` | background (`transcriptPipeline` → `storage.ts`) |
| `CORPUS_NOTES_STORAGE_KEY` | `corpusNotes` | background (`fragmentPipeline` → `corpusNotesStorage`) |
| `SEMIA_SETTINGS_STORAGE_KEY` | `semiaSettings` | options page (`semiaSettings.ts`) |

Content scripts **send messages** (`SAVE_FRAGMENT`, `SAVE_TRANSCRIPT`); they do not
call `appendFragment` or `saveTranscript` directly.

## Message protocol

Types: `apps/extension/src/types.ts` → `BackgroundMessage`.

Dispatched by `background/messageRouter.ts`:

| Message | Pipeline |
|---------|----------|
| `SAVE_FRAGMENT`, `SAVE_CORPUS_NOTE`, `LIST_FRAGMENTS`, `LIST_SNIPPET_NOTES`, `GENERATE_SNIPPET_NOTE`, `GENERATE_CONTEXT_WINDOW`, `OPEN_WEB_CAPTURE`, `DELETE_FRAGMENT`, `DELETE_SOURCE` | `fragmentPipeline` |
| `SAVE_TRANSCRIPT`, `SAVE_TRANSCRIPT_ERROR`, `LIST_TRANSCRIPTS` | `transcriptPipeline` |
| `OPEN_SEMIA`, `TAKE_PENDING_WEB_RESTORE` | `messageRouter` (inline) |

Corpus refresh uses **`chrome.storage.onChanged` only** — there is no
`FRAGMENTS_CHANGED` broadcast (removed in Phase 1).

All async handlers use `return true` + `sendResponse` in a promise (`background.ts`).

## Reactive side effects

One new fragment can trigger a short chain:

```
submitFragment (content) → SAVE_FRAGMENT (background)
  → appendFragment → chrome.storage.onChanged
    → fragmentPipeline.onFragmentsStorageChanged
      → ensureSnippetNote → saveSnippetNote
        → chrome.storage.onChanged (corpus subscribe) → useCorpusData.refresh()
```

Transcript oembed enrichment is a **separate background job**, not on the read path:

```
startup or TRANSCRIPTS_STORAGE_KEY change
  → transcriptPipeline → persistTranscriptOembedEnrichment
    → saveTranscript (metadata only) → onChanged → corpus refresh
```

`LIST_TRANSCRIPTS` is **read-only** — it does not enrich or write (Phase 1 fix).

When debugging refresh loops, log which **storage key** changed in `onChanged`, then
trace who wrote it. Do not only inspect React `useEffect` dependencies.

### Remaining refresh triggers

| Trigger | Expected? |
|---------|-----------|
| New fragment → snippet note | Yes, one extra write per new capture |
| Transcript oembed job filling title/channel | Yes, may fire once per transcript needing metadata |
| `LIST_TRANSCRIPTS` during corpus refresh | No write — if you see writes here, regression |

## Symptom → first files to read

| Symptom | Read first | What to look for |
|---------|------------|------------------|
| SEMIA UI keeps refreshing | `useCorpusData.ts`, `corpusRepository.subscribe`, `transcriptOembedEnrichment.ts` | Oembed job writing repeatedly; duplicate enrichment; storage loop |
| Duplicate AI notes | `ensureSnippetNote.ts`, `fragmentPipeline.onFragmentsStorageChanged` | `inFlight` map; duplicate fragment ids; onChanged firing twice |
| Capture save fails | `submitCapture.ts`, `background/messageRouter.ts`, `storageError.ts` | `sendMessage` error? Quota? Background asleep? |
| YouTube captions missing | `pageWorld.ts` → `contentScript` bridge → `handleInterceptedURL` | `postMessage` received? `lastCapturedVideoId` early return? |
| Wrong data after video switch | `installSpaNavigationWatcher`, `loadTranscriptForVideo` | `currentVideoId` vs URL; 800ms poll vs navigate events |
| Web capture won't save | `buildWebFragment.ts`, `webContentScript.ts` | `locate-failed` — selection not mapped to live DOM flat text |
| Web capture saved, jump-back fails | `restoreWebSelection.ts`, `pendingWebRestore.ts`, `migrateFragment.ts` | Legacy `locateQuality: 'degraded'`? restore retry exhausted? |
| Toolbar flicker / selection lost | `webContentScript.ts` | `mouseup` / `pointerdown` / `setTimeout(removeToolbar)` race |
| `sendMessage` no response | `background.ts`, `messageRouter.ts` | Service worker asleep? Unknown message type? Missing `return true`? |
| `kQuotaBytes` / quota exceeded | `manifest.json` permissions, stored transcripts | Needs `unlimitedStorage`. User may need to reload extension after update or clear Storage in chrome://extensions. |
| Works in dev, broken in extension page | `extensionContext.ts`, `corpusRepository` factory | Fell through to `MockCorpusRepository`? |

## Polling and retries

| Location | Mechanism | Risk |
|----------|-----------|------|
| `contentScript.ts` | `setInterval(check, 800)` SPA navigation | Overlaps with `yt-navigate-finish` |
| `captionOverlay.ts` | `setInterval` 1s player mount | Re-mount when YouTube rebuilds player DOM |
| `webContentScript.ts` | restore retry 20×500ms | Race with toolbar `removeToolbar` timeout |

## Web capture locate quality

**New captures (Phase 3):** if the live DOM `Range` cannot be mapped to flat text
offsets, `buildWebFragment` returns `locate-failed` and **nothing is saved**. The
toolbar shows “Could not locate selection on this page”.

**Successful captures** get `locateQuality: 'precise'`.

**Legacy captures** without `locateQuality` are inferred on load (`migrateFragment.ts` /
`inferWebLocateQuality`). Degraded anchors show a warning in SEMIA and disable jump-back.

See `issues.md` for known web-capture limitations (`findFlatRange` first match only).

## Test coverage gap

**Tested:** pure functions (`flattenText`, `restoreWebSelection`, XML parsers, meta,
`buildWebFragment`, `youtubeOembed`).

**Not tested:** message routing, `storage.onChanged` chains, content-script lifecycle,
corpus subscribe. Integration bugs require tracing the flows above, not only unit tests.

## Agent session prompt template

```
I'm fixing Project Semia Chrome extension: [symptom].

Read first:
1. docs/agents/debugging.md
2. apps/extension/src/types.ts
3. apps/extension/src/background/messageRouter.ts
4. The relevant pipeline (fragmentPipeline or transcriptPipeline)

Assume:
- Domain storage writes go through background messages, not direct set from UI/content
- LIST_TRANSCRIPTS is read-only; oembed runs as a background job on transcript changes
- Corpus refresh is storage.onChanged only (no FRAGMENTS_CHANGED)
- Don't patch React hooks until chrome.storage.onChanged is traced

Before fix: one-sentence data-flow diagram with the loop edge marked.
After fix: npm run verify + manual smoke steps.
```

## Related docs

- `docs/architecture-review-2026-08.md` — full refactor report and phased plan
- `issues.md` — known web-capture bugs
- `docs/agents/domain.md` — domain doc layout
