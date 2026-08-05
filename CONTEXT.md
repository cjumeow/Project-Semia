# Semia — Domain Context

Glossary for product and extension terms. Use these names in issues, ADRs, and code comments.

## Glossary

| Term | Definition |
|------|------------|
| **Capture** | User action that saves a `LanguageFragment` (word/phrase selection + anchor) from YouTube or web. |
| **Learning language** | The language the user is studying. Drives the **primary caption line**, word-click capture, and `LanguageFragment.languageCode`. BCP-47 tag (e.g. `en`). |
| **Native language** | The language used for comprehension support. Drives the **secondary caption line** when eligible; also used for AI explanations via `SemiaSettings.nativeLanguage` (e.g. `zh-TW`, `zh-CN`). Maps to YouTube `tlang` via `toYoutubeTlang` (e.g. `zh-TW` → `zh-Hant`). |
| **Caption track** | One language's timedtext payload for a video: `TranscriptSegment[]` + `languageCode`. |
| **Source track** | The learning-language caption track fetched from YouTube (`lang=<learning>`). Must exist on the video (uploaded or auto-generated). |
| **Translation track** | The native-language text for cues. **v1 (shipped):** YouTube auto-translate (`tlang`) from the source track. Segmentation may differ — see **matching error**. **Candidate (spike):** MT of the **learning cue text** via GTX or BYOK LLM when `tlang` is coarse or unavailable — see **native line source**. |
| **Cue** | One timed segment in a caption track: `{ text, start, duration }`. Index = `cueIndex`. |
| **Cue pair** | A learning cue and a native cue considered together at playback time. Produced by `pairNativeForLearningCue` (time overlap + gates), **not** by index alignment. |
| **Pairing confidence** | `high` \| `none`. Only `high` allows the native line in the overlay. `none` means learning-only for that cue. See ADR-0003. |
| **Native line eligibility** | Whether the overlay may render a native caption for the active learning cue. True iff bilingual fetch succeeded, native segments exist, and pairing confidence is `high`. |
| **Matching error** | Umbrella term: a native line is shown (or would be shown) but does not correctly correspond to the learning cue for that moment. Subtypes: **span mismatch** (wrong granularity — e.g. one short EN line with a long merged `tlang` paragraph), **semantic mismatch** (wrong meaning, e.g. index-pairing failures in spike #02). |
| **Bilingual overlay** | Extension UI replacing native YouTube CC. Learning line with word-click; optional native line below when **native line eligibility** passes (ADR-0003). |
| **Subtitle settings** | YouTube-page popover on the player bar: learning language, native language, bilingual on/off. Shipped per prototype variant A. Distinct from corpus **Settings** (AI, context window, Pro). |
| **Timedtext** | YouTube `/api/timedtext` JSON3 endpoint intercepted by `pageWorld.ts`. |
| **LanguageFragment** | Stored capture row in `languageFragments` (shared domain type). |
| **Snippet** | A Capture as shown in the corpus UI: the same `LanguageFragment` row plus its `SnippetNote`. _Avoid_: Using "snippet" to mean only the selected text span. |
| **Snippet chat** | A multi-turn AI tutor conversation in the corpus UI. When a Capture is selected, grounding and message history are scoped to that Capture (or its Language card). With no Capture selected, the panel acts as a general AI text chat with no snippet context injected. Selecting a different Capture switches the visible thread. _Avoid_: One flat history mixing all Captures unless the user explicitly references another (`@`, v2). |
| **Snippet chat context** | The Capture (`LanguageFragment` + `SnippetNote` + surrounding context) injected into an AI request for the current turn. Present only when a Capture is active in corpus selection; omitted in general chat mode. |
| **Snippet chat reference** | An explicit user `@` mention of another Capture that pulls that Capture's note and surrounding context into the current turn only. _Avoid_: Loading other Captures' context automatically when switching threads. |
| **StoredTranscript** | Per-video caption storage in `youtubeTranscripts` (extension). Includes `segments` (learning) and optional `nativeSegments` + `nativeLanguageCode` when bilingual is on. |
| **Native line source** | How the secondary caption line is produced for a cue: **`tlang`** (paired translation track), **`learning-cue MT`** (translate the same cue text — Funlingo-style), or **none** (learning-only). |
| **GTX translation** | Undocumented Google Translate HTTP API (`translate.googleapis.com/translate_a/single?client=gtx`). No API key; no SLA. Semia uses it for **selection translate** (`translateSelection.ts`). Candidate for **translation prewarm** spike only until rate limits are measured. |
| **Translation prewarm** | After the learning track loads, fetching native-line translations for many or all cues and caching them (e.g. keyed by `videoId` + `cueIndex` + target language) so seek does not trigger per-cue API calls. Observed in Funlingo Network RE (#36). |

## Bounded contexts (monorepo)

| Context | Path | Owns |
|---------|------|------|
| **shared** | `packages/shared` | Domain types, storage keys, pure schedule/helpers |
| **extension** | `apps/extension` | YouTube/web capture, transcripts, overlay, background |
| **corpus** | `apps/corpus` | SEMIA library UI, reads extension storage |

Dependency rule: `extension` / `corpus` → `shared` only.
