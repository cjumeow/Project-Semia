// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { eventTargetsSubtitleSettingsUi } from './subtitleSettingsInteraction';

describe('eventTargetsSubtitleSettingsUi', () => {
  it('detects clicks inside an open shadow root host', () => {
    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'open' });
    const button = document.createElement('button');
    shadow.appendChild(button);
    document.body.appendChild(host);

    const event = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(event, 'composedPath', {
      value: () => [button, shadow, host, document.body, document],
    });
    Object.defineProperty(event, 'target', { value: host });

    expect(eventTargetsSubtitleSettingsUi(event, [host])).toBe(true);
    host.remove();
  });
});
