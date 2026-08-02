import { describe, expect, it } from 'vitest';
import {
  parseLanguageCardXml,
  requiredCardSections,
} from './parseLanguageCard';

const bothIntentsXml = `
<focus>look forward to</focus>
<meaning>期待</meaning>
<scenario>當你要禮貌表達對未來某事的期盼時，可以使用此片語。</scenario>
<example kind="speaking">
  <text>I look forward to catching up this weekend!</text>
  <translation>我很期待這週末敘舊！</translation>
</example>
<example kind="writing">
  <text>I look forward to your feedback on the draft.</text>
  <translation>期待您對草稿的回饋。</translation>
</example>
`;

describe('requiredCardSections', () => {
  it('requires focus only when meaning and scenario are off', () => {
    expect(
      requiredCardSections(['speaking'], {
        includeMeaning: false,
        includeScenario: false,
      }),
    ).toEqual(['focus', 'example kind="speaking"']);
  });

  it('includes scenario when requested', () => {
    expect(
      requiredCardSections(['writing'], {
        includeMeaning: true,
        includeScenario: true,
      }),
    ).toEqual([
      'focus',
      'meaning',
      'scenario',
      'example kind="writing"',
    ]);
  });
});

describe('parseLanguageCardXml', () => {
  it('parses meaning, scenario, and bilingual examples', () => {
    const parsed = parseLanguageCardXml(bothIntentsXml, ['speaking', 'writing'], {
      includeMeaning: true,
      includeScenario: true,
    });

    expect(parsed.focus).toBe('look forward to');
    expect(parsed.meaning).toBe('期待');
    expect(parsed.scenario).toContain('期盼');
    expect(parsed.examples).toHaveLength(2);
    expect(parsed.examples[0]?.translation).toContain('期待');
  });

  it('parses fragment cards without meaning tag', () => {
    const xml = `
<focus>multiple</focus>
<scenario>當你要表達某情境有「多種」選項時，可以使用此形容詞。</scenario>
<example kind="speaking">
  <text>There are multiple options.</text>
  <translation>有多種選項。</translation>
</example>
`;

    const parsed = parseLanguageCardXml(xml, ['speaking'], {
      includeMeaning: false,
      includeScenario: true,
    });

    expect(parsed.meaning).toBeUndefined();
    expect(parsed.examples[0]?.kind).toBe('speaking');
  });

  it('throws when a required example is missing', () => {
    const xml = `
<focus>focus</focus>
<meaning>意思</meaning>
`;

    expect(() =>
      parseLanguageCardXml(xml, ['speaking'], {
        includeMeaning: true,
        includeScenario: false,
      }),
    ).toThrow(/missing <example kind="speaking">/i);
  });
});
