# ADR-0002: YouTube bilingual captions — spike-first, learning-only until pairing works

**Status:** Accepted (grilling 2026-08-03); **native-line deferral amended** by [ADR-0003](./0003-youtube-bilingual-gated-native-line.md) (2026-08-03)  
**Supersedes:** [ADR-0001](./0001-youtube-bilingual-captions-v1.md)

Real-world testing (e.g. EN learning line vs ZH native line on the same `cueIndex` showing unrelated text) proved that **index-level cue pairing is not reliable** for YouTube `tlang` auto-translate tracks. Shipping a bilingual overlay on that assumption misleads learners worse than showing learning-only captions.

We will **not rush bilingual dual-line UX**. Semia’s core value is word-click capture on the **learning track**; that must stay correct. Native-line display returns only after a validated pairing strategy and a `/prototype`-approved settings UI.

## Decisions

1. **Ship learning-only overlay** until pairing is validated. Do not render the native caption line in production, even if `nativeSegments` exist in storage.
2. **Remove the current YouTube settings panel** — the implemented popover UI is broken (layout/placement). No YouTube-page subtitle settings until `/prototype` confirms UI and behavior.
3. **Keep fetch/storage infrastructure** (dual-track fetch, `nativeSegments`, `learningLanguage` in settings) as groundwork for spike and future implementation; do not delete and re-build later.
4. **Spike pairing strategies in order:** (A) time-based overlap, (B) strict index gate with pass-rate measurement, (C) YouTube native CC as second layer. Output: per-video comparison table + written conclusion — **no fixed percentage gate upfront**; product judgment after reading the report.
5. **Workflow order:** docs → cleanup (disable native line, remove panel) → spike → `/prototype` (settings panel; may parallel spike) → `/implement` (dual-line + new panel only after spike + prototype approval).
6. **Extension Options** continues to own `nativeLanguage` for AI explanations. Learning-language and subtitle UX on the watch page are **deferred to prototype** (not decided in grilling).

## Considered options

| Option | Why not now |
|--------|-------------|
| Ship index-paired dual-line (ADR-0001) | Falsified by real video testing |
| Revert all bilingual infra | Wastes useful spike foundation |
| Patch the broken settings panel | UI quality unacceptable; prototype first |
| Fixed 80%/95% spike gate before reading data | Sample too small; risks false confidence |

## Consequences

- Positive: Avoids shipping misleading translations; process matches grill → tickets → prototype → implement.
- Negative: No Funlingo-style dual-line in the near term; spike and prototype add latency before bilingual UX.
- ADR-0001 remains as historical record of the original (incorrect) index-pairing assumption.
