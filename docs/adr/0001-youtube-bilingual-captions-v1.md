# ADR-0001: YouTube bilingual captions (v1) via auto-translate

**Status:** Superseded by [ADR-0002](./0002-youtube-bilingual-captions-spike-first.md) (2026-08-03)  
**Date:** 2026-08-03

## Context

Users want dual subtitles on YouTube (learning + native) similar to Funlingo, using **YouTube's own translation** rather than a third-party MT API. Semia already intercepts one `timedtext` track per `videoId` and renders a word-clickable overlay for capture.

Prior discussion established:

- Auto-translate tracks share **the same cue timing** as the source track → index-level pairing is reliable for v1.
- Human-uploaded dual-language tracks or independent per-language ASR are **out of scope** for v1.
- Semia today stores only the **first** intercepted language per video and does not pair cues.

## Decision

### v1 scope

1. **Fetch two tracks programmatically** per video:
   - **Source track:** `lang = learningLanguage` (must be available on the video).
   - **Translation track:** YouTube auto-translate from source → `nativeLanguage` (exact timedtext query params to be confirmed in a short spike; likely `tlang` or equivalent on the same base URL).
2. **Pair cues by index** (`cueIndex` identical on both tracks). Assert matching `start`/`duration`; log/warn on mismatch, do not silently remap in v1.
3. **Bilingual overlay:** show learning line (primary, larger) + native line (secondary) for the active cue. Hide native YouTube CC (existing behavior).
4. **Capture unchanged in anchor shape:** word clicks still use **learning track** `cueIndex` / `wordIndex`; `LanguageFragment.languageCode = learningLanguage`. Native line is display-only in v1 (not stored on fragment).
5. **Subtitle settings (new, lightweight):** user picks `learningLanguage` + `nativeLanguage` (default native from `SemiaSettings.nativeLanguage`). Persist in `SemiaSettings` or a nested `subtitle` object on the same storage key.
6. **Do not** require the user to manually switch YouTube CC language twice; extension requests both tracks after learning language is known.

### Out of scope (v1)

- Pairing human-uploaded tracks with different cue counts.
- Word-level alignment across languages within a cue.
- Netflix or non-YouTube video.
- Corpus UI changes (library still shows single-language capture context unless a later ADR adds paired text to notes).
- Custom MT / DeepSeek translation for subtitles.

### Storage (breaking change for transcripts map)

Replace `youtubeTranscripts[videoId]: StoredTranscript` with a bundle, e.g.:

```ts
type StoredTranscriptBundle = {
  videoId: string;
  videoUrl: string;
  learningLanguage: string;
  nativeLanguage: string;
  source: StoredTranscript['source'];
  capturedAt: string;
  title?: string;
  channel?: string;
  learningTrack: TranscriptSegment[];
  nativeTrack: TranscriptSegment[]; // auto-translate
};
```

Migrate: existing single-track entries → `learningTrack` only, `nativeTrack: []`, infer `learningLanguage` from old `languageCode`.

### Failure modes (UX)

| Condition | Behavior |
|-----------|----------|
| No learning track | Overlay off; subtitle bar message: enable CC / language unavailable. |
| Learning track OK, translate fails | Show learning line only + subtle "translation unavailable". |
| Cue count mismatch | Show learning line; skip native for that cue; dev console warning. |
| User changes subtitle languages | Re-fetch both tracks; replace bundle for videoId. |

## Consequences

- **Positive:** Reuses YouTube infra; no MT API cost; aligns with Funlingo-quality UX on common EN→ZH videos.
- **Negative:** Fragile to YouTube timedtext URL changes; only works where auto-translate exists; index pairing wrong if YouTube changes translate segmentation.
- **Extension:** `contentScript`, `captionOverlay`, `storage`, `pageWorld` (may need explicit fetch, not only intercept). `SemiaSettings` + small subtitle settings UI on YouTube (sidebar or overlay gear).
- **Tests:** Pure functions for cue pairing validation; fixture JSON3 pairs with matching/mismatched lengths.

## Product decisions (resolved 2026-08-03)

1. **Layout:** Learning line on top.
2. **Settings:** YouTube capture sidebar only (not corpus library).
3. **Language list:** Fixed preset; remember last learning language.
4. **Bilingual toggle:** Required (learning-only allowed).
5. **Failures (Q6–Q8):** Explicit missing-track errors; native-only fallback when translate fails; proactive dual-track fetch (not intercept-first).
6. **Capture:** Native line display-only in v1 (Q9).
7. **Delivery:** Two-phase PR; corpus library unchanged (Q10–Q11).

## References

- Extension: `pageWorld.ts`, `youtubeTranscript.ts`, `captionOverlay.ts`, `contentScript.ts`
- Shared: `StoredTranscript`, `SemiaSettings.nativeLanguage`
