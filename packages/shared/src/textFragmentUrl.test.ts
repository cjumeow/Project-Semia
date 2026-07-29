import { describe, expect, it } from 'vitest';
import { buildTextFragmentUrl } from './textFragmentUrl';

describe('buildTextFragmentUrl', () => {
  it('builds a simple text fragment link', () => {
    const url = buildTextFragmentUrl('https://example.com/article', {
      exact: 'pivot strategy',
    });

    expect(url).toBe(
      'https://example.com/article#:~:text=pivot%20strategy',
    );
  });

  it('includes prefix and suffix when provided', () => {
    const url = buildTextFragmentUrl('https://example.com/post', {
      prefix: 'team decided to',
      exact: 'pivot',
      suffix: 'the product',
    });

    expect(url).toContain('#:~:text=');
    expect(url).toContain('team%20decided%20to-,');
    expect(url).toContain('pivot');
    expect(url).toContain(',-the%20product');
  });
});
