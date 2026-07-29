import { describe, expect, it } from 'vitest';
import {
  buildYouTubeEmbedUrl,
  buildYouTubeThumbnailUrl,
  buildYouTubeTimestampUrl,
  buildYouTubeWatchUrl,
  formatTimestamp,
} from './youtubeUrl';

describe('formatTimestamp', () => {
  it('formats under an hour as mm:ss', () => {
    expect(formatTimestamp(0)).toBe('00:00');
    expect(formatTimestamp(65)).toBe('01:05');
    expect(formatTimestamp(599)).toBe('09:59');
  });

  it('adds an hours part only when needed', () => {
    expect(formatTimestamp(3599)).toBe('59:59');
    expect(formatTimestamp(3600)).toBe('1:00:00');
    expect(formatTimestamp(3661)).toBe('1:01:01');
  });

  it('floors fractional seconds and clamps negatives', () => {
    expect(formatTimestamp(65.9)).toBe('01:05');
    expect(formatTimestamp(-10)).toBe('00:00');
  });
});

describe('buildYouTubeWatchUrl', () => {
  it('builds a plain watch url', () => {
    expect(buildYouTubeWatchUrl('abc123')).toBe(
      'https://www.youtube.com/watch?v=abc123',
    );
  });

  it('adds a start time in seconds', () => {
    expect(buildYouTubeWatchUrl('abc123', 92.7)).toBe(
      'https://www.youtube.com/watch?v=abc123&t=92s',
    );
  });

  it('omits a zero start time', () => {
    expect(buildYouTubeWatchUrl('abc123', 0)).toBe(
      'https://www.youtube.com/watch?v=abc123',
    );
  });
});

describe('buildYouTubeEmbedUrl', () => {
  it('always disables related videos', () => {
    expect(buildYouTubeEmbedUrl('abc123')).toBe(
      'https://www.youtube.com/embed/abc123?rel=0',
    );
  });

  it('adds a start time in seconds', () => {
    expect(buildYouTubeEmbedUrl('abc123', 92.7)).toBe(
      'https://www.youtube.com/embed/abc123?rel=0&start=92',
    );
  });
});

describe('buildYouTubeTimestampUrl', () => {
  it('replaces an existing timestamp instead of appending one', () => {
    const url = buildYouTubeTimestampUrl(
      'https://www.youtube.com/watch?v=abc123&t=10s',
      45,
    );

    expect(url).toBe('https://www.youtube.com/watch?v=abc123&t=45s');
  });

  it('clamps negative timestamps to zero', () => {
    expect(
      buildYouTubeTimestampUrl('https://www.youtube.com/watch?v=abc123', -5),
    ).toBe('https://www.youtube.com/watch?v=abc123&t=0s');
  });
});

describe('buildYouTubeThumbnailUrl', () => {
  it('points at the hqdefault still', () => {
    expect(buildYouTubeThumbnailUrl('abc123')).toBe(
      'https://img.youtube.com/vi/abc123/hqdefault.jpg',
    );
  });
});
