# 14 — GTX hybrid native line spike

**GitHub:** [#44](https://github.com/cjumeow/Project-Semia/issues/44)  
**Spec:** [spec-gtx-hybrid-native-line.md](../spec-gtx-hybrid-native-line.md)  
**Grilling:** [gtx-prewarm-grilling.md](../gtx-prewarm-grilling.md)  
**Blocked by:** Pairing v3 (#40–#43) should merge/compose first  
**Label:** `ready-for-agent`

## What to build

Hybrid native line: `tlang` when not coarse; else gtx batch prewarm (10 cues/request). UI:「翻譯載入中」; failure → learning-only.

## In-scope cleanup

- Unify `translateGtx` (selection + subtitle MT)
- Update `resolveNativeCaptionLine` tests for MT path on coarse tracks

## Out of scope

- Prototype variants M–Q, subtitle icon/CSS WIP, `forMe/`
- ADR-0004 until spike metrics
