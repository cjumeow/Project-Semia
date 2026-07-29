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

function isHiddenTextNode(node: Text): boolean {
  const parent = node.parentElement;
  if (!parent) return true;
  if (parent.closest(SKIP_ANCESTOR_SELECTOR)) return true;

  let element: Element | null = parent;
  while (element) {
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return true;
    }
    element = element.parentElement;
  }

  return false;
}

function isBlockElement(element: Element | null): boolean {
  if (!element) return false;
  if (BLOCK_TAGS.has(element.tagName)) return true;
  const style = window.getComputedStyle(element);
  return style.display === 'block' || style.display === 'list-item';
}

function needsLeadingBreak(
  chunks: FlatTextChunk[],
  text: string,
  node: Text,
): boolean {
  if (chunks.length === 0 || text.endsWith('\n')) return false;
  let element: Element | null = node.parentElement;
  while (element) {
    if (isBlockElement(element)) return true;
    element = element.parentElement;
  }
  return false;
}

/** Flatten visible text under a root element into one searchable string. */
export function flattenText(root: Element): FlatText {
  const chunks: FlatTextChunk[] = [];
  let text = '';

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return isHiddenTextNode(node as Text)
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT;
    },
  });

  let current = walker.nextNode() as Text | null;
  while (current) {
    const raw = current.data.replace(/\s+/g, ' ');
    if (!raw.trim()) {
      current = walker.nextNode() as Text | null;
      continue;
    }

    if (needsLeadingBreak(chunks, text, current)) {
      text += '\n';
    }

    const normalized = raw.trim();
    chunks.push({ node: current, start: text.length });
    text += normalized;
    if (isBlockElement(current.parentElement)) {
      text += '\n';
    }

    current = walker.nextNode() as Text | null;
  }

  return { text: text.trim(), chunks };
}

export function rangeToFlatOffsets(
  flat: FlatText,
  range: Range,
): { start: number; end: number } | null {
  const selected = range.toString().replace(/\s+/g, ' ').trim();
  if (!selected) return null;

  const start = flat.text.indexOf(selected);
  if (start < 0) return null;

  return { start, end: start + selected.length };
}
