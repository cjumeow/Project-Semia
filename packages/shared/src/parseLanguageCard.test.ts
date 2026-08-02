import { describe, expect, it } from 'vitest';
import {
  parseLanguageCardXml,
  requiredCardSections,
} from './parseLanguageCard';

const bothIntentsXml = `
<focus>look forward to</focus>
<meaning>期待（某事發生）；帶有禮貌、正面的期盼</meaning>
<scenario_1>Scenario 1 — Email sign-off after a job interview.</scenario_1>
<scenario_2>Scenario 2 — Casual catch-up with a friend visiting next month.</scenario_2>
<speaking_example>"I look forward to catching up this weekend!"</speaking_example>
<writing_example>I look forward to your feedback on the draft.</writing_example>
`;

describe('requiredCardSections', () => {
  it('always requires core sections', () => {
    expect(requiredCardSections([])).toEqual([
      'focus',
      'meaning',
      'scenario_1',
      'scenario_2',
    ]);
  });

  it('adds speaking_example when speaking is selected', () => {
    expect(requiredCardSections(['speaking'])).toEqual([
      'focus',
      'meaning',
      'scenario_1',
      'scenario_2',
      'speaking_example',
    ]);
  });

  it('adds writing_example when writing is selected', () => {
    expect(requiredCardSections(['writing'])).toEqual([
      'focus',
      'meaning',
      'scenario_1',
      'scenario_2',
      'writing_example',
    ]);
  });

  it('requires both examples when both intents are selected', () => {
    expect(requiredCardSections(['speaking', 'writing'])).toEqual([
      'focus',
      'meaning',
      'scenario_1',
      'scenario_2',
      'speaking_example',
      'writing_example',
    ]);
  });
});

describe('parseLanguageCardXml', () => {
  it('parses all sections when both intents are selected', () => {
    const parsed = parseLanguageCardXml(bothIntentsXml, ['speaking', 'writing']);

    expect(parsed.focus).toBe('look forward to');
    expect(parsed.scenario1).toContain('Scenario 1');
    expect(parsed.speakingExample).toContain('catching up');
    expect(parsed.writingExample).toContain('feedback');
  });

  it('parses speaking-only cards without writing_example', () => {
    const xml = `
<focus>break a leg</focus>
<meaning>祝你好運（劇場用語）</meaning>
<scenario_1>Scenario 1 — Before a stage performance.</scenario_1>
<scenario_2>Scenario 2 — Encouraging a nervous presenter.</scenario_2>
<speaking_example>Break a leg tonight!</speaking_example>
`;

    const parsed = parseLanguageCardXml(xml, ['speaking']);

    expect(parsed.speakingExample).toBe('Break a leg tonight!');
    expect(parsed.writingExample).toBeUndefined();
  });

  it('parses writing-only cards without speaking_example', () => {
    const xml = `
<focus>hearing from you</focus>
<meaning>收到你的回覆</meaning>
<scenario_1>Scenario 1 — Follow-up email after a proposal.</scenario_1>
<scenario_2>Scenario 2 — Customer support ticket closure.</scenario_2>
<writing_example>I look forward to hearing from you.</writing_example>
`;

    const parsed = parseLanguageCardXml(xml, ['writing']);

    expect(parsed.writingExample).toContain('hearing from you');
    expect(parsed.speakingExample).toBeUndefined();
  });

  it('throws when a required section is missing', () => {
    const xml = `
<focus>focus</focus>
<meaning>meaning</meaning>
<scenario_1>one</scenario_1>
`;

    expect(() => parseLanguageCardXml(xml, ['speaking'])).toThrow(
      /missing <scenario_2>/i,
    );
  });
});
