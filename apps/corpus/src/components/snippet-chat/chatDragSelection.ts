/** Toggle/add selection for multi-select clicks; replace selection on plain click. */
export function applyBlockClickSelection(
  selectedIds: ReadonlySet<string>,
  blockId: string,
  multiSelect: boolean,
): Set<string> {
  if (!multiSelect) {
    return new Set([blockId]);
  }

  const next = new Set(selectedIds);
  if (next.has(blockId)) {
    next.delete(blockId);
  } else {
    next.add(blockId);
  }
  return next;
}
