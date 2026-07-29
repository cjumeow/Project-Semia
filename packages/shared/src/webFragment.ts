import type { LanguageFragment, WebAnchor } from './types';

export function isWebAnchor(
  anchor: LanguageFragment['anchor'],
): anchor is WebAnchor {
  return anchor.kind === 'web';
}

export function sourceKey(fragment: LanguageFragment): string {
  return fragment.sourceUrl;
}
