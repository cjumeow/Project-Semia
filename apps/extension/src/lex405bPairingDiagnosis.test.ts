import { describe, expect, it } from 'vitest';
import {
  overlapSeconds,
  pairNativeForLearningCue,
} from './cuePairing';
import { resolveNativeCaptionLine } from './captionNativeLine';
import FIXTURE from './fixtures/lex-e-gwvmhyU7A-405b-repro.json';

/**
 * Diagnosing-bugs Phase 1 loop for Lex #434 405B matching error.
 * Run: npx vitest run apps/extension/src/lex405bPairingDiagnosis.test.ts
 */
describe('Lex #434 405B diagnosis (e-gwvmhyU7A @ ~56:13)', () => {
  const { symptom, fetched } = FIXTURE;
  const coarse = { coarseNativeTrack: true };

  describe('Phase 1 — user screenshot symptom (short wrong zh-Hant)', () => {
    it.fails('pairNativeForLearningCue still returns high for aligned short wrong zh-Hant', () => {
      const result = pairNativeForLearningCue(
        symptom.learning,
        [symptom.nativeZhHantWrong],
        coarse,
      );

      expect(result.confidence).toBe('none');
      expect(result.nativeText).toBeNull();
    });

    it('overlay is learning-only on coarse Lex track without MT cache', () => {
      expect(
        resolveNativeCaptionLine(symptom.learning, [symptom.nativeZhHantWrong], {
          learningSegmentCount: fetched.trackStats.learningCount,
        }),
      ).toEqual({ status: 'none' });
    });
  });

  describe('Phase 2 — fetched YouTube track shape @ 3413s', () => {
    it('correct 405b zh-Hant segment is ~87s earlier than EN cue (track drift)', () => {
      const delta =
        fetched.nativeZhHantCorrectButMisaligned.start -
        fetched.learning.start;
      expect(delta).toBeLessThan(-80);
      expect(fetched.nativeZhHantCorrectButMisaligned.text).toContain('405b');
    });

    it('full-track pairing for fetched EN cue rejects timing (current code)', () => {
      const neighbors = [
        fetched.nativeZhHantOverlapCandidate,
        fetched.nativeZhHantCorrectButMisaligned,
      ];
      const result = pairNativeForLearningCue(fetched.learning, neighbors, coarse);

      expect(result.confidence).toBe('none');
      expect(result.reason).toBe('timing');
    });

    it('overlap candidate at 3408s is wrong content (RL / 2016), not 405b', () => {
      const overlap = overlapSeconds(
        fetched.learning,
        fetched.nativeZhHantOverlapCandidate,
      );
      expect(overlap).toBeGreaterThan(2);
      expect(fetched.nativeZhHantOverlapCandidate.text).not.toContain('405b');
    });
  });
});
