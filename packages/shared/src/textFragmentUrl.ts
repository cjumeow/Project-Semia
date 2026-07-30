import type { WebAnchor } from './types';

type TextQuote = WebAnchor['textQuote'];

function encodeFragmentPart(value: string): string {
  return encodeURIComponent(value).replace(/-/g, '%2D');
}

/** Build a Chrome Text Fragment URL for jumping back to a web capture. */
export function buildTextFragmentUrl(pageUrl: string, textQuote: TextQuote): string {
  const url = new URL(pageUrl);
  url.hash = '';

  const parts: string[] = [];
  if (textQuote.prefix) {
    parts.push(`${encodeFragmentPart(textQuote.prefix)}-,`);
  }
  parts.push(encodeFragmentPart(textQuote.exact));
  if (textQuote.suffix) {
    parts.push(`,-${encodeFragmentPart(textQuote.suffix)}`);
  }

  return `${url.toString()}#:~:text=${parts.join('')}`;
}
