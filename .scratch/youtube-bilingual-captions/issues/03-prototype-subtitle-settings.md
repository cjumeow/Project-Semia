# 03 — Prototype: subtitle settings on YouTube bottom bar

**What to build:** A throwaway `/prototype` the user can run with one command and compare variants (e.g. bottom-bar popover). Answers: layout, placement, learning/native language controls, bilingual toggle — **before** any production extension UI ships. LingoPanel stays out of scope unless explicitly added later.

**Blocked by:** None — can start immediately (may run in parallel with 01 and 02).

**Status:** ready-for-human — prototype v3 updated 2026-08-03

- [x] One command starts the prototype (per project prototype conventions).
- [x] Variants switchable via URL param and/or floating switcher.
- [ ] User has reviewed and approved a single variant (or noted required changes) before ticket 05 starts.
- [x] Prototype marked throwaway; validated UI decisions captured in ticket Comments or spec — not merged as production code.

## Comments

**Run:** `npm run prototype:youtube-captions` → `?prototype=youtube-captions&variant=A|B|C`

**v3 changes:** Removed LingoPanel settings chip (ADR-0002). Tightened popover layout. Mock cues from Jo Van Eyck spike.

**Awaiting:** Your variant pick (A / B / C or hybrid).
