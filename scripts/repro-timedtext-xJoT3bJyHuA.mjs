/**
 * Repro for #51 / Lex video empty timedtext.
 * Run: node scripts/repro-timedtext-xJoT3bJyHuA.mjs
 *
 * Asserts: WEB playerResponse caption baseUrl returns empty body;
 * ANDROID InnerTube caption baseUrl returns transcript bytes.
 */
const videoId = 'xJoT3bJyHuA';

async function fetchWebPlayerTracks() {
  const resp = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',
    },
  });
  const html = await resp.text();
  const match = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\})\s*;/s);
  if (!match) throw new Error('ytInitialPlayerResponse not found');
  const player = JSON.parse(match[1]);
  return (
    player.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? []
  );
}

async function fetchAndroidTracks() {
  const version = '20.10.38';
  const resp = await fetch(
    'https://www.youtube.com/youtubei/v1/player?prettyPrint=false',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        context: {
          client: { clientName: 'ANDROID', clientVersion: version },
        },
        videoId,
      }),
    },
  );
  const data = await resp.json();
  return (
    data.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? []
  );
}

async function bodyLength(url) {
  const res = await fetch(url, { credentials: 'include' });
  const text = await res.text();
  return { status: res.status, length: text.length };
}

const webTracks = await fetchWebPlayerTracks();
const androidTracks = await fetchAndroidTracks();
const webEn = webTracks.find((t) => t.languageCode === 'en');
const androidEn = androidTracks.find((t) => t.languageCode === 'en');

if (!webEn?.baseUrl || !androidEn?.baseUrl) {
  throw new Error('Missing en caption track');
}

const webResult = await bodyLength(
  webEn.baseUrl.includes('fmt=') ? webEn.baseUrl : `${webEn.baseUrl}&fmt=srv3`,
);
const androidResult = await bodyLength(androidEn.baseUrl);

console.log('WEB playerResponse en track body length:', webResult.length);
console.log('ANDROID innertube en track body length:', androidResult.length);

if (webResult.length === 0 && androidResult.length > 0) {
  console.log('REPRO_OK: WEB template empty, ANDROID template works');
  process.exit(0);
}

console.error('REPRO_UNEXPECTED', { webResult, androidResult });
process.exit(1);
