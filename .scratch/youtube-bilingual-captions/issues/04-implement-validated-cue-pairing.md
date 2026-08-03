# 04 — Implement validated cue pairing

**What to build:** Extension code implements the pairing strategy chosen in ticket 02 (e.g. time-based lookup with tests). Overlay may still show learning-only until ticket 05; this ticket makes pairing **correct and testable** in the codebase. If spike concludes dual-line should not ship, scope this ticket to documenting that outcome and keeping learning-only path only.

**Blocked by:** 01 — Learning-only cleanup; 02 — Caption pairing spike

**Status:** resolved — spike defers dual-line; learning-only path kept

- [x] Pairing logic matches spike recommendation; unit tests cover known good and bad cases (including index mismatch fixtures).
- [x] Mismatched or low-confidence pairs do not surface misleading native text (gate or omit per spike guidance).
- [x] `npm run verify` passes.
- [x] If spike says “do not ship dual-line,” ticket is resolved with rationale in Comments and no native overlay wiring.

## Comments

Spike #02: index pairing fails on Jo Van Eyck cue 96; time-based insufficient. **No native line in overlay** until a new pairing strategy is validated. Infra (`nativeSegments` fetch/storage) retained for future work.
