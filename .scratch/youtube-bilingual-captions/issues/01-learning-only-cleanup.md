# 01 — Learning-only cleanup (remove broken bilingual UX)

**What to build:** On YouTube, the user sees a **learning-only** caption overlay with working word-click capture. The broken subtitle settings panel is gone; the native caption line is not shown. Dual-track fetch and `nativeSegments` storage remain for the pairing spike — not removed.

**Blocked by:** None — can start immediately.

**Status:** resolved

- [x] Subtitle settings control is removed from the YouTube player (no popover / bottom-bar Semia settings button).
- [x] Caption overlay shows only the learning line; native line and “translation unavailable” hints are not rendered.
- [x] Learning-track intercept, storage, and capture (LingoPanel / shortcuts) behave as before the bilingual experiment.
- [x] `npm run verify` passes.
