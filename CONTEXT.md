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
| **Translation track** | The native-language text for cues, obtained via **YouTube auto-translate** (`tlang`) from the source track. Segmentation may differ from the source track — see **matching error**. |
| **Cue** | One timed segment in a caption track: `{ text, start, duration }`. Index = `cueIndex`. |
| **Cue pair** | A learning cue and a native cue considered together at playback time. Produced by `pairNativeForLearningCue` (time overlap + gates), **not** by index alignment. |
| **Pairing confidence** | `high` \| `none`. Only `high` allows the native line in the overlay. `none` means learning-only for that cue. See ADR-0003. |
| **Native line eligibility** | Whether the overlay may render a native caption for the active learning cue. True iff bilingual fetch succeeded, native segments exist, and pairing confidence is `high`. |
| **Matching error** | Umbrella term: a native line is shown (or would be shown) but does not correctly correspond to the learning cue for that moment. Subtypes: **span mismatch** (wrong granularity — e.g. one short EN line with a long merged `tlang` paragraph), **semantic mismatch** (wrong meaning, e.g. index-pairing failures in spike #02). |
| **Bilingual overlay** | Extension UI replacing native YouTube CC. Learning line with word-click; optional native line below when **native line eligibility** passes (ADR-0003). |
| **Subtitle settings** | YouTube-page popover on the player bar: learning language, native language, bilingual on/off. Shipped per prototype variant A. Distinct from corpus **Settings** (AI, context window, Pro). |
| **Timedtext** | YouTube `/api/timedtext` JSON3 endpoint intercepted by `pageWorld.ts`. |
| **LanguageFragment** | Stored capture row in `languageFragments` (shared domain type). |
| **StoredTranscript** | Per-video caption storage in `youtubeTranscripts` (extension). Includes `segments` (learning) and optional `nativeSegments` + `nativeLanguageCode` when bilingual is on. |

## Bounded contexts (monorepo)

| Context | Path | Owns |
|---------|------|------|
| **shared** | `packages/shared` | Domain types, storage keys, pure schedule/helpers |
| **extension** | `apps/extension` | YouTube/web capture, transcripts, overlay, background |
| **corpus** | `apps/corpus` | SEMIA library UI, reads extension storage |

Dependency rule: `extension` / `corpus` → `shared` only.
