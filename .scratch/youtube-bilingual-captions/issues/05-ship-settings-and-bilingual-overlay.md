# 05 — Ship prototype-approved settings + bilingual overlay

**What to build:** Production extension matches the **prototype-approved** subtitle settings UI on the YouTube player. If spike (02) and pairing impl (04) support it, enable the **bilingual overlay** (learning line + validated native line). If spike defers dual-line, ship settings and learning behavior only, without native line.

**Blocked by:** 02 — Caption pairing spike; 03 — Prototype: subtitle settings; 04 — Implement validated cue pairing

**Status:** ready-for-agent

- [ ] Settings panel matches approved prototype (placement, fields, bilingual toggle).
- [ ] Learning language / native language / bilingual on-off behave as specified in prototype + spike report.
- [ ] Native line appears only when pairing gate passes; no repeat of index-only blind pairing.
- [ ] LingoPanel unchanged unless a separate decision says otherwise.
- [ ] `npm run verify` passes; manual smoke on YouTube with extension reload.
