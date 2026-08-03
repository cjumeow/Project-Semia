# Semia — Domain Context

Glossary for product and extension terms. Use these names in issues, ADRs, and code comments.

## Glossary

| Term | Definition |
|------|------------|
| **Capture** | User action that saves a `LanguageFragment` (word/phrase selection + anchor) from YouTube or web. |
| **Learning language** | The language the user is studying. Drives the **primary caption line**, word-click capture, and `LanguageFragment.languageCode`. BCP-47 tag (e.g. `en`). |
| **Native language** | The language used for comprehension support. Intended for the **secondary caption line** when pairing works; also used for AI explanations via `SemiaSettings.nativeLanguage` (e.g. `zh-TW`). |
| **Caption track** | One language's timedtext payload for a video: `TranscriptSegment[]` + `languageCode`. |
| **Source track** | The learning-language caption track fetched from YouTube (`lang=<learning>`). Must exist on the video (uploaded or auto-generated). |
| **Translation track** | The native-language text for cues, obtained via **YouTube auto-translate** (`tlang`) from the source track. Pairing strategy is **not assumed** — see ADR-0002. |
| **Cue** | One timed segment in a caption track: `{ text, start, duration }`. Index = `cueIndex`. |
| **Cue pair** | A learning cue and a native cue shown together at playback time. **Pairing method TBD** (spike: time-based, index gate, or other). _Avoid:_ assuming index *i* always matches index *i*. |
| **Bilingual overlay** | Extension UI replacing native YouTube CC. **Currently learning-only** until pairing is validated (ADR-0002). Target: learning line + native line per validated cue pair. |
| **Subtitle settings** | YouTube-page preferences: learning language, native language, bilingual on/off. **Not shipped** until `/prototype` approves UI and behavior. Distinct from corpus **Settings** (AI, context window, Pro). |
| **Timedtext** | YouTube `/api/timedtext` JSON3 endpoint intercepted by `pageWorld.ts`. |
| **LanguageFragment** | Stored capture row in `languageFragments` (shared domain type). |
| **StoredTranscript** | Per-video caption storage in `youtubeTranscripts` (extension). May include optional `nativeSegments` for spike/future use — see ADR-0002. |

## Bounded contexts (monorepo)

| Context | Path | Owns |
|---------|------|------|
| **shared** | `packages/shared` | Domain types, storage keys, pure schedule/helpers |
| **extension** | `apps/extension` | YouTube/web capture, transcripts, overlay, background |
| **corpus** | `apps/corpus` | SEMIA library UI, reads extension storage |

Dependency rule: `extension` / `corpus` → `shared` only.
