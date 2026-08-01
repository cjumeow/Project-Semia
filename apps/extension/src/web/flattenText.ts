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

function firstTextNode(node: Node): Text | null {
  if (node.nodeType === Node.TEXT_NODE) return node as Text;
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  return walker.nextNode() as Text | null;
}

function lastTextNode(node: Node): Text | null {
  if (node.nodeType === Node.TEXT_NODE) return node as Text;
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  let last: Text | null = null;
  let current = walker.nextNode() as Text | null;
  while (current) {
    last = current;
    current = walker.nextNode() as Text | null;
  }
  return last;
}

function resolveRangeBoundary(
  container: Node,
  offset: number,
  edge: 'start' | 'end',
): { node: Text; offset: number } | null {
  if (container.nodeType === Node.TEXT_NODE) {
    return { node: container as Text, offset };
  }
  if (container.nodeType !== Node.ELEMENT_NODE) return null;

  const el = container as Element;
  if (edge === 'start') {
    for (let index = offset; index < el.childNodes.length; index++) {
      const text = firstTextNode(el.childNodes[index]!);
      if (text) return { node: text, offset: 0 };
    }
    for (let index = offset - 1; index >= 0; index--) {
      const text = lastTextNode(el.childNodes[index]!);
      if (text) return { node: text, offset: text.data.length };
    }
    return null;
  }

  for (let index = offset - 1; index >= 0; index--) {
    const text = lastTextNode(el.childNodes[index]!);
    if (text) return { node: text, offset: text.data.length };
  }
  for (let index = offset; index < el.childNodes.length; index++) {
    const text = firstTextNode(el.childNodes[index]!);
    if (text) return { node: text, offset: 0 };
  }
  return null;
}

/** Map a DOM offset inside a text node to the flattened content offset for that node. */
export function domOffsetToContentOffset(
  node: Text,
  domOffset: number,
): number {
  const raw = node.data;
  const normalized = raw.replace(/\s+/g, ' ').trim();
  if (!normalized) return 0;

  const first = raw.search(/\S/);
  if (first < 0) return 0;
  if (domOffset <= first) return 0;

  let normIdx = 0;
  let index = first;
  while (index < raw.length && index < domOffset) {
    if (/\s/.test(raw[index]!)) {
      while (index < raw.length && /\s/.test(raw[index]!)) index++;
      if (normIdx < normalized.length && normalized[normIdx] === ' ') {
        normIdx++;
      }
    } else {
      normIdx++;
      index++;
    }
  }

  return Math.min(normIdx, normalized.length);
}

/**
 * Locate a live DOM Range inside flattened page text by following the Range's
 * boundary nodes — preferred over string search, which drifts from Range.toString().
 */
export function locateRangeInFlat(
  flat: FlatText,
  range: Range,
): { start: number; end: number } | null {
  if (!range.startContainer || !range.endContainer) return null;

  const startBound = resolveRangeBoundary(
    range.startContainer,
    range.startOffset,
    'start',
  );
  const endBound = resolveRangeBoundary(
    range.endContainer,
    range.endOffset,
    'end',
  );
  if (!startBound || !endBound) return null;

  const startChunk = flat.chunks.find((chunk) => chunk.node === startBound.node);
  const endChunk = flat.chunks.find((chunk) => chunk.node === endBound.node);
  if (!startChunk || !endChunk) return null;

  const start =
    startChunk.start +
    domOffsetToContentOffset(startBound.node, startBound.offset);
  const end =
    endChunk.start + domOffsetToContentOffset(endBound.node, endBound.offset);

  if (start >= end) return null;
  return { start, end };
}
