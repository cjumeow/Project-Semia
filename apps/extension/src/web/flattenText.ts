export type FlatTextChunk = {
  node: Text;
  start: number;
};

export type FlatText = {
  text: string;
  chunks: FlatTextChunk[];
};

const BLOCK_TAGS = new Set([
  'ADDRESS',
  'ARTICLE',
  'ASIDE',
  'BLOCKQUOTE',
  'BODY',
  'DD',
  'DIV',
  'DL',
  'DT',
  'FIELDSET',
  'FIGCAPTION',
  'FIGURE',
  'FOOTER',
  'FORM',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'HEADER',
  'HR',
  'LI',
  'MAIN',
  'NAV',
  'OL',
  'P',
  'PRE',
  'SECTION',
  'TABLE',
  'TD',
  'TH',
  'TR',
  'UL',
]);

const SKIP_ANCESTOR_SELECTOR =
  'script, style, noscript, svg, template, [hidden], [aria-hidden="true"]';

function isHiddenElement(element: Element, cache: Map<Element, boolean>): boolean {
  const cached = cache.get(element);
  if (cached !== undefined) return cached;

  let hidden = false;
  if (element.matches(SKIP_ANCESTOR_SELECTOR)) {
    hidden = true;
  } else {
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') {
      hidden = true;
    } else {
      const parent = element.parentElement;
      hidden = parent ? isHiddenElement(parent, cache) : false;
    }
  }

  cache.set(element, hidden);
  return hidden;
}

function isBlockElement(element: Element): boolean {
  if (BLOCK_TAGS.has(element.tagName)) return true;
  const display = window.getComputedStyle(element).display;
  return display === 'block' || display === 'list-item' || display === 'flex';
}

function nearestBlockAncestor(node: Text): Element | null {
  let element = node.parentElement;
  while (element) {
    if (isBlockElement(element)) return element;
    element = element.parentElement;
  }
  return null;
}

/**
 * Flatten visible text under a root into one searchable string.
 *
 * Inline markup stays on one line so that a selection spanning `<em>` or `<a>`
 * still matches the source text; only block boundaries introduce a newline.
 */
export function flattenText(root: Element): FlatText {
  const chunks: FlatTextChunk[] = [];
  const hiddenCache = new Map<Element, boolean>();
  let text = '';
  let previousBlock: Element | null = null;
  let sawFirstChunk = false;
  let pendingSpace = false;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = (node as Text).parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      return isHiddenElement(parent, hiddenCache)
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT;
    },
  });

  let current = walker.nextNode() as Text | null;
  while (current) {
    const raw = current.data.replace(/\s+/g, ' ');
    const content = raw.trim();

    if (!content) {
      // A whitespace-only node still separates the words around it.
      if (raw) pendingSpace = true;
      current = walker.nextNode() as Text | null;
      continue;
    }

    const block = nearestBlockAncestor(current);

    if (sawFirstChunk) {
      if (block !== previousBlock) {
        if (!text.endsWith('\n')) text += '\n';
      } else if ((pendingSpace || raw.startsWith(' ')) && !/\s$/.test(text)) {
        text += ' ';
      }
    }

    chunks.push({ node: current, start: text.length });
    text += content;

    pendingSpace = raw.endsWith(' ');
    previousBlock = block;
    sawFirstChunk = true;

    current = walker.nextNode() as Text | null;
  }

  return { text: text.trim(), chunks };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Locate a selection inside flattened text, tolerating whitespace differences
 * between `Range.toString()` and the flattened block separators.
 */
export function findFlatRange(
  flat: FlatText,
  selectedText: string,
): { start: number; end: number } | null {
  const needle = selectedText.replace(/\s+/g, ' ').trim();
  if (!needle) return null;

  const pattern = needle.split(' ').map(escapeRegExp).join('\\s+');
  const match = new RegExp(pattern).exec(flat.text);
  if (!match) return null;

  return { start: match.index, end: match.index + match[0].length };
}
