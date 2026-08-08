import { describe, expect, it } from 'vitest';
import {
  snippetTextFromContextSwitchNotice,
  truncateContextSwitchLabel,
} from './contextSwitchLineLabel';

describe('snippetTextFromContextSwitchNotice', () => {
  it('extracts quoted snippet text from switch notice', () => {
    expect(
      snippetTextFromContextSwitchNotice(
        'Context switched to "naval vessels". I will answer using only this capture from now on.',
      ),
    ).toBe('naval vessels');
  });

  it('returns null when pattern does not match', () => {
    expect(snippetTextFromContextSwitchNotice('Something else')).toBeNull();
  });
});

describe('truncateContextSwitchLabel', () => {
  it('truncates long labels with ellipsis', () => {
    expect(
      truncateContextSwitchLabel(
        'Context mean, you have to be careful with that word',
        24,
      ),
    ).toBe('Context mean, you have …');
  });
});
