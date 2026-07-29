import { Readability } from '@mozilla/readability';

/** Return the main article container, or body when Readability cannot parse. */
export function getArticleRoot(doc: Document = document): Element {
  const parsed = new Readability(doc.cloneNode(true) as Document).parse();
  if (parsed?.content) {
    const container = doc.createElement('div');
    container.innerHTML = parsed.content;
    return container;
  }

  return doc.body ?? doc.documentElement;
}
