import { describe, expect, it } from 'vitest';
import { getWordText, tokenizeCue } from './segmenter';

describe('tokenizeCue', () => {
  it('assigns dense word indices to word-like segments', () => {
    const tokens = tokenizeCue('Hello, world!');
    const words = tokens.filter((t) => t.isWord);

    expect(words.map((w) => w.text)).toEqual(['Hello', 'world']);
    expect(words.map((w) => w.wordIndex)).toEqual([0, 1]);
  });

  it('keeps punctuation and whitespace so the cue can be rebuilt', () => {
    const text = 'She said "no" — twice.';
    const tokens = tokenizeCue(text);

    expect(tokens.map((t) => t.text).join('')).toBe(text);
  });

  it('returns nothing for blank cues', () => {
    expect(tokenizeCue('')).toEqual([]);
    expect(tokenizeCue('   \n  ')).toEqual([]);
  });

  it('keeps apostrophes inside a single word', () => {
    const words = tokenizeCue("don't").filter((t) => t.isWord);

    expect(words).toHaveLength(1);
    expect(words[0]!.text).toBe("don't");
  });
});

describe('getWordText', () => {
  it('looks up a clickable word by its index', () => {
    const tokens = tokenizeCue('one two three');

    expect(getWordText(tokens, 0)).toBe('one');
    expect(getWordText(tokens, 2)).toBe('three');
  });

  it('returns undefined for an index that has no word', () => {
    expect(getWordText(tokenizeCue('one'), 5)).toBeUndefined();
  });
});
