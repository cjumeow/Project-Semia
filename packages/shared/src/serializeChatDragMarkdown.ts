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

function serializeListItem(li: HTMLLIElement): string {
  const depth = listDepth(li);
  const indent = '  '.repeat(Math.max(0, depth - 1));
  const clone = li.cloneNode(true) as HTMLLIElement;
  for (const nested of Array.from(clone.querySelectorAll('ul, ol'))) {
    nested.remove();
  }
  const text = clone.textContent?.trim() ?? '';
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

/** Serialize a draggable chat root element (`<p>` or `<li>`) to markdown for slot drop. */
export function serializeDragRootElement(root: HTMLElement | null): string {
  if (!root) {
    return '';
  }

  if (root.tagName === 'P') {
    return root.textContent?.trim() ?? '';
  }

  if (root.tagName === 'LI') {
    return serializeListItem(root as HTMLLIElement);
  }

  return root.textContent?.trim() ?? '';
}

/** Serialize multiple draggable roots into one markdown payload (document order). */
export function serializeDragElements(
  roots: Array<HTMLElement | null | undefined>,
): string {
  return roots
    .map((root) => (root ? serializeDragRootElement(root) : ''))
    .filter((markdown) => markdown.length > 0)
    .join('\n\n');
}
