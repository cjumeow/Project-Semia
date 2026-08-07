function listDepth(element: Element): number {
  let depth = 0;
  let parent = element.parentElement;
  while (parent) {
    if (parent.tagName === 'UL' || parent.tagName === 'OL') {
      depth += 1;
    }
    parent = parent.parentElement;
  }
  return depth;
}

function listItemTextWithoutNestedLists(li: HTMLLIElement): string {
  const clone = li.cloneNode(true) as HTMLLIElement;
  for (const nested of Array.from(clone.querySelectorAll('ul, ol'))) {
    nested.remove();
  }
  return clone.textContent?.trim() ?? '';
}

function serializeListItem(li: HTMLLIElement): string {
  const depth = listDepth(li);
  const indent = '  '.repeat(Math.max(0, depth - 1));
  const text = listItemTextWithoutNestedLists(li);
  if (!text) {
    return '';
  }

  const line = `${indent}- ${text}`;
  const nestedLines: string[] = [];
  for (const child of Array.from(li.children)) {
    if (child.tagName === 'UL' || child.tagName === 'OL') {
      for (const nestedLi of Array.from(child.querySelectorAll(':scope > li'))) {
        const nestedLine = serializeListItem(nestedLi as HTMLLIElement);
        if (nestedLine) {
          nestedLines.push(nestedLine);
        }
      }
    }
  }

  return nestedLines.length > 0
    ? [line, ...nestedLines].join('\n')
    : line;
}

/** Shallow list item for drag — one block only, no nested list children. */
function serializeShallowListItem(li: HTMLLIElement): string {
  const text = listItemTextWithoutNestedLists(li);
  if (!text) {
    return '';
  }
  return `- ${text}`;
}

function listItemHasNestedList(li: HTMLLIElement): boolean {
  return Array.from(li.children).some(
    (child) => child.tagName === 'UL' || child.tagName === 'OL',
  );
}

/**
 * GFM often renders sub-bullets after a numbered item as a sibling `<ul>`,
 * not nested inside the `<ol><li>`. Absorb that list when dragging the
 * last item of an ordered list.
 */
function followingSiblingSublist(
  li: HTMLLIElement,
): HTMLUListElement | HTMLOListElement | null {
  const parentList = li.parentElement;
  if (!parentList || parentList.tagName !== 'OL' || li !== parentList.lastElementChild) {
    return null;
  }

  let sibling = parentList.nextElementSibling;
  while (sibling) {
    if (sibling.tagName === 'UL' || sibling.tagName === 'OL') {
      return sibling as HTMLUListElement | HTMLOListElement;
    }
    if (
      sibling.tagName === 'P' ||
      sibling.tagName === 'H1' ||
      sibling.tagName === 'H2' ||
      sibling.tagName === 'H3' ||
      sibling.tagName === 'H4' ||
      sibling.tagName === 'H5' ||
      sibling.tagName === 'H6' ||
      sibling.tagName === 'TABLE'
    ) {
      return null;
    }
    sibling = sibling.nextElementSibling;
  }

  return null;
}

/** List item that semantically groups sub-bullets (nested DOM or flat ol→ul). */
export function isListContainerLi(li: HTMLLIElement): boolean {
  return listItemHasNestedList(li) || followingSiblingSublist(li) != null;
}

function indentMarkdownLines(markdown: string, spaces: number): string {
  const prefix = ' '.repeat(spaces);
  return markdown
    .split('\n')
    .map((line) => (line.length > 0 ? `${prefix}${line}` : line))
    .join('\n');
}

function serializeListItemWithFollowingSiblingList(li: HTMLLIElement): string | null {
  const subList = followingSiblingSublist(li);
  if (!subList) {
    return null;
  }

  const text = listItemTextWithoutNestedLists(li);
  if (!text) {
    return null;
  }

  const depth = listDepth(li);
  const indent = '  '.repeat(Math.max(0, depth - 1));
  const line = `${indent}- ${text}`;
  const nestedLines: string[] = [];

  for (const child of Array.from(subList.children)) {
    if (child.tagName !== 'LI') {
      continue;
    }
    const nestedMarkdown = serializeDragRootElement(child as HTMLLIElement);
    if (nestedMarkdown) {
      nestedLines.push(indentMarkdownLines(nestedMarkdown, 2));
    }
  }

  if (nestedLines.length === 0) {
    return null;
  }

  return [line, ...nestedLines].join('\n');
}

function isLiAbsorbedByFollowingSiblingList(
  li: HTMLLIElement,
  absorber: HTMLLIElement,
): boolean {
  const subList = followingSiblingSublist(absorber);
  return subList != null && subList.contains(li);
}

/** Drop list items already included via a preceding ordered-list absorber. */
function filterOutSiblingAbsorbedDragRoots(roots: HTMLElement[]): HTMLElement[] {
  return roots.filter((root) => {
    if (root.tagName !== 'LI') {
      return true;
    }

    return !roots.some(
      (other) =>
        other !== root &&
        other.tagName === 'LI' &&
        isLiAbsorbedByFollowingSiblingList(root as HTMLLIElement, other as HTMLLIElement),
    );
  });
}

/** Drop descendant roots when an ancestor is already in the drag set. */
function filterOutNestedDragRoots(roots: HTMLElement[]): HTMLElement[] {
  return roots.filter(
    (root) =>
      !roots.some((other) => other !== root && other.contains(root)),
  );
}

function joinDragMarkdownBlocks(blocks: string[]): string {
  return blocks.reduce((result, block) => {
    if (!result) {
      return block;
    }

    const continuesList =
      /^- /.test(result.split('\n').at(-1) ?? '') && block.startsWith('- ');
    return continuesList ? `${result}\n${block}` : `${result}\n\n${block}`;
  }, '');
}

/** Serialize a draggable chat root element (`<p>` or `<li>`) to markdown for slot drop. */
export function serializeDragRootElement(root: HTMLElement | null): string {
  if (!root) {
    return '';
  }

  if (root.tagName === 'P') {
    return root.textContent?.trim() ?? '';
  }

  if (root.tagName === 'LI') {
    const li = root as HTMLLIElement;
    if (listItemHasNestedList(li)) {
      return serializeListItem(li);
    }

    const withFollowingSiblingList = serializeListItemWithFollowingSiblingList(li);
    if (withFollowingSiblingList) {
      return withFollowingSiblingList;
    }

    return serializeShallowListItem(li);
  }

  return root.textContent?.trim() ?? '';
}

/** Serialize multiple draggable roots into one markdown payload (document order). */
export function serializeDragElements(
  roots: Array<HTMLElement | null | undefined>,
): string {
  const filtered = filterOutSiblingAbsorbedDragRoots(
    filterOutNestedDragRoots(
      roots.filter((root): root is HTMLElement => root != null),
    ),
  );
  const blocks = filtered
    .map((root) => serializeDragRootElement(root))
    .filter((markdown) => markdown.length > 0);

  return joinDragMarkdownBlocks(blocks);
}

/** @internal Exported for tests that assert full nested list serialization. */
export function serializeListItemForTest(li: HTMLLIElement): string {
  return serializeListItem(li);
}
