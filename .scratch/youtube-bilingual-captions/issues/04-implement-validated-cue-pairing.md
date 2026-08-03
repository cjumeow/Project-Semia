# 04 — Implement validated cue pairing

**What to build:** Extension code implements the pairing strategy chosen in ticket 02 (e.g. time-based lookup with tests). Overlay may still show learning-only until ticket 05; this ticket makes pairing **correct and testable** in the codebase. If spike concludes dual-line should not ship, scope this ticket to documenting that outcome and keeping learning-only path only.

**Blocked by:** 01 — Learning-only cleanup; 02 — Caption pairing spike

**Status:** ready-for-agent

- [ ] Pairing logic matches spike recommendation; unit tests cover known good and bad cases (including index mismatch fixtures).
- [ ] Mismatched or low-confidence pairs do not surface misleading native text (gate or omit per spike guidance).
- [ ] `npm run verify` passes.
- [ ] If spike says “do not ship dual-line,” ticket is resolved with rationale in Comments and no native overlay wiring.
