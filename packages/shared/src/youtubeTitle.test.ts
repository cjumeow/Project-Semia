import { describe, expect, it } from 'vitest';
import {
  isPlaceholderYoutubeTitle,
  parseYoutubeDocumentTitle,
  pickRicherYoutubeTitle,
  placeholderYoutubeTitle,
  resolveYoutubeTitle,
  shouldRefreshYoutubeMeta,
} from './youtubeTitle';

describe('parseYoutubeDocumentTitle', () => {
  it('removes the trailing YouTube suffix', () => {
    expect(parseYoutubeDocumentTitle('Rick Astley - Never Gonna Give You Up - YouTube')).toBe(
      'Rick Astley - Never Gonna Give You Up',
    );
  });

  it('returns the raw title when no suffix is present', () => {
    expect(parseYoutubeDocumentTitle('Plain title')).toBe('Plain title');
  });
});

describe('isPlaceholderYoutubeTitle', () => {
  it('detects the legacy video-id placeholder', () => {
    expect(isPlaceholderYoutubeTitle('YouTube · abc123', 'abc123')).toBe(true);
    expect(isPlaceholderYoutubeTitle('Real Title', 'abc123')).toBe(false);
  });
});

describe('resolveYoutubeTitle', () => {
  it('prefers transcript metadata over the stored fragment title', () => {
    expect(
      resolveYoutubeTitle({
        videoId: 'abc123',
        sourceTitle: 'heptabase',
        metaTitle: 'Organize Your Entire Knowledge Base with AI | Heptabase',
      }),
    ).toBe('Organize Your Entire Knowledge Base with AI | Heptabase');
  });

  it('keeps a non-placeholder fragment title', () => {
    expect(
      resolveYoutubeTitle({
        videoId: 'abc123',
        sourceTitle: 'Captured Title',
      }),
    ).toBe('Captured Title');
  });

  it('falls back to the placeholder when nothing better is known', () => {
    expect(
      resolveYoutubeTitle({
        videoId: 'abc123',
        sourceTitle: placeholderYoutubeTitle('abc123'),
      }),
    ).toBe(placeholderYoutubeTitle('abc123'));
  });
});

describe('pickRicherYoutubeTitle', () => {
  it('prefers the longer, more descriptive title', () => {
    expect(
      pickRicherYoutubeTitle('heptabase', 'Organize Your Entire Knowledge Base with AI | Heptabase'),
    ).toBe('Organize Your Entire Knowledge Base with AI | Heptabase');
  });
});

describe('shouldRefreshYoutubeMeta', () => {
  it('refreshes when a better title or missing channel arrives', () => {
    expect(
      shouldRefreshYoutubeMeta(
        { title: 'heptabase' },
        { title: 'Organize Your Entire Knowledge Base with AI | Heptabase', channel: 'Heptabase' },
      ),
    ).toBe(true);

    expect(
      shouldRefreshYoutubeMeta(
        { title: 'Full Title', channel: 'Unknown channel' },
        { title: 'Full Title', channel: 'Heptabase' },
      ),
    ).toBe(true);
  });
});
