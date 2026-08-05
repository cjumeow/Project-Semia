// @vitest-environment happy-dom

import { afterEach, describe, expect, it } from 'vitest';

const FOCUS_TEXT = 'introduces like absolutely ginormous';

function mountProductionTile() {
  const listItem = document.createElement('li');
  listItem.className = 'h-[4.25rem] min-w-0';

  const button = document.createElement('button');
  button.type = 'button';
  button.className =
    'relative flex h-full w-full min-w-0 flex-col overflow-x-hidden rounded-xl border border-border bg-surface px-3 py-2.5 text-left';

  const focus = document.createElement('span');
  focus.className =
    'block min-w-0 overflow-x-hidden text-ellipsis whitespace-nowrap pr-4 font-reading text-sm font-normal leading-normal text-text';
  focus.textContent = FOCUS_TEXT;

  const meaning = document.createElement('span');
  meaning.className =
    'semia-field-zh mt-0.5 block min-w-0 overflow-x-hidden text-ellipsis whitespace-nowrap text-[11px] leading-normal text-text-secondary';
  meaning.textContent = '會帶來非常巨大的';

  button.append(focus, meaning);
  listItem.append(button);
  document.body.append(listItem);

  return {
    cleanup: () => listItem.remove(),
    focus,
    button,
  };
}

describe('LearningCardTile descender clipping', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('avoids truncate and overflow-hidden that clip descenders', () => {
    const tile = mountProductionTile();

    expect(tile.focus.className).not.toContain('truncate');
    expect(tile.button.className).not.toContain('overflow-hidden');
    expect(tile.focus.className).toContain('leading-normal');
    expect(tile.focus.className).toContain('overflow-x-hidden');
    expect(tile.focus.className).toContain('whitespace-nowrap');

    tile.cleanup();
  });
});
