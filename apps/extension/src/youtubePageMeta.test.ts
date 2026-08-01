// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import {
  applyYoutubeMeta,
  buildYoutubeMetaForVideo,
  readYoutubePageMeta,
} from './youtubePageMeta';

describe('readYoutubePageMeta', () => {
  it('prefers meta title and author over document.title', () => {
    document.head.innerHTML = `
      <meta name="title" content="Organize Your Entire Knowledge Base with AI | Heptabase" />
      <meta name="author" content="Heptabase" />
    `;
    document.title = 'heptabase - YouTube';

    expect(readYoutubePageMeta(document)).toEqual({
      title: 'Organize Your Entire Knowledge Base with AI | Heptabase',
      channel: 'Heptabase',
    });
  });
});

describe('buildYoutubeMetaForVideo', () => {
  it('ignores the live page when the active video differs', () => {
    document.head.innerHTML = `
      <meta name="title" content="Andrej Karpathy: Tesla AI" />
      <meta name="author" content="Lex Fridman" />
    `;

    const result = buildYoutubeMetaForVideo(
      'heptabase-id',
      'andrej-id',
      { title: 'Heptabase title', channel: 'Heptabase' },
      document,
    );

    expect(result).toEqual({
      meta: { title: 'Heptabase title', channel: 'Heptabase' },
      authoritative: true,
    });
  });
});

describe('applyYoutubeMeta', () => {
  it('replaces polluted metadata when the refresh is authoritative', () => {
    expect(
      applyYoutubeMeta(
        {
          title: 'Andrej Karpathy: Tesla AI, Self-Driving, Optimus, Aliens, and AI | Lex Fridman Podcast #333',
          channel: 'Lex Fridman',
        },
        {
          title: 'Organize Your Entire Knowledge Base with AI | Heptabase',
          channel: 'Heptabase',
        },
        true,
      ),
    ).toEqual({
      title: 'Organize Your Entire Knowledge Base with AI | Heptabase',
      channel: 'Heptabase',
    });
  });
});
