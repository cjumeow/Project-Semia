import { describe, expect, it } from 'vitest';
import { buildPopoverFieldsHtml } from './subtitleSettingsPopoverMarkup';

describe('buildPopoverFieldsHtml', () => {
  it('describes gated native line instead of deferred pairing', () => {
    const html = buildPopoverFieldsHtml('en', 'zh-TW', true);
    expect(html).toContain('when translation alignment is confident');
    expect(html).not.toContain('deferred until pairing');
  });
});
