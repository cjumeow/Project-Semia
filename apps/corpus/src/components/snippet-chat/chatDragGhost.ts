import { LANGUAGE_CARD_ICON_PATH } from '../LanguageCardIcon';

export function shouldUseMultiBlockDragGhost(blockCount: number): boolean {
  return blockCount > 1;
}

export function multiBlockDragLabel(blockCount: number): string {
  return `${blockCount} blocks`;
}

/** Build an off-screen drag ghost for multi-block chat drags. */
export function createMultiBlockDragGhostElement(
  doc: Document,
  blockCount: number,
): HTMLDivElement {
  const ghost = doc.createElement('div');
  ghost.setAttribute('aria-hidden', 'true');
  Object.assign(ghost.style, {
    position: 'fixed',
    top: '-1000px',
    left: '-1000px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '8px',
    background: '#1f57d1',
    color: '#ffffff',
    fontFamily: 'system-ui, sans-serif',
    fontSize: '13px',
    fontWeight: '500',
    lineHeight: '1',
    opacity: '0.92',
    boxShadow: '0 4px 12px rgba(31, 87, 209, 0.35)',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
  });

  const icon = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  icon.setAttribute('fill', 'none');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('stroke-width', '1.5');
  icon.setAttribute('stroke', 'currentColor');
  icon.setAttribute('width', '18');
  icon.setAttribute('height', '18');

  const path = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  path.setAttribute('d', LANGUAGE_CARD_ICON_PATH);
  icon.append(path);

  const label = doc.createElement('span');
  label.textContent = multiBlockDragLabel(blockCount);

  ghost.append(icon, label);
  return ghost;
}

export function applyMultiBlockDragGhost(
  event: { dataTransfer: DataTransfer | null },
  blockCount: number,
  doc: Document = document,
): void {
  if (!shouldUseMultiBlockDragGhost(blockCount) || !event.dataTransfer) {
    return;
  }

  const ghost = createMultiBlockDragGhostElement(doc, blockCount);
  doc.body.append(ghost);
  event.dataTransfer.setDragImage(ghost, 20, 16);
  requestAnimationFrame(() => {
    ghost.remove();
  });
}
