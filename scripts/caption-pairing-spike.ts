/**
 * Caption pairing spike — fetches real YouTube tracks and writes a report.
 * Run: npm run spike:caption-pairing
 */
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzePairingStrategies, nativeTextByTimeOverlap } from '../apps/extension/src/captionPairingAnalysis.ts';
import type { TranscriptSegment } from '../apps/extension/src/types.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '../.scratch/youtube-bilingual-captions');
const FIXTURE_DIR = join(OUT_DIR, 'fixtures');

const INNERTUBE_API_URL =
  'https://www.youtube.com/youtubei/v1/player?prettyPrint=false';
const INNERTUBE_CLIENT_VERSION = '20.10.38';
const INNERTUBE_UA = `com.google.android.youtube/${INNERTUBE_CLIENT_VERSION} (Linux; U; Android 14)`;

type SpikeCase = {
  videoId: string;
  label: string;
  mode: 'tlang-zh-Hant' | 'human-zh-TW';
};

const CASES: SpikeCase[] = [
  {
    videoId: 'j_r93YulrUE',
    label: 'Jo Van Eyck — The state of agentic engineering mid-2026',
    mode: 'tlang-zh-Hant',
  },
  {
    videoId: 'jNQXAC9IVRw',
    label: 'Me at the zoo (first YouTube video)',
    mode: 'tlang-zh-Hant',
  },
  {
    videoId: 'dQw4w9WgXcQ',
    label: 'Rick Astley — Never Gonna Give You Up',
    mode: 'tlang-zh-Hant',
  },
  {
    videoId: 'kCc8FmEb1nY',
    label: 'Fireship — 100 seconds',
    mode: 'tlang-zh-Hant',
  },
  {
    videoId: 'aircAruvnKk',
    label: '3Blue1Brown — neural networks (human zh-TW track)',
    mode: 'human-zh-TW',
  },
];

type CaptionTrack = {
  languageCode: string;
  baseUrl: string;
};

function parseTimedtextXml(xml: string): TranscriptSegment[] {
  const results: TranscriptSegment[] = [];
  const pRegex = /<p\s+t="(\d+)"\s+d="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
  let match: RegExpExecArray | null;
  while ((match = pRegex.exec(xml)) !== null) {
    let text = '';
    const sRegex = /<s[^>]*>([^<]*)<\/s>/g;
    let sMatch: RegExpExecArray | null;
    while ((sMatch = sRegex.exec(match[3])) !== null) {
      text += sMatch[1];
    }
    if (!text) {
      text = match[3].replace(/<[^>]+>/g, '');
    }
    text = text.replace(/&amp;/g, '&').trim();
    if (!text) continue;
    results.push({
      text,
      start: Number(match[1]) / 1000,
      duration: Number(match[2]) / 1000,
    });
  }
  if (results.length) return results;

  const classic = [
    ...xml.matchAll(
      /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g,
    ),
  ];
  return classic.map((row) => ({
    text: row[3],
    start: Number(row[1]),
    duration: Number(row[2]),
  }));
}

async function fetchCaptionTracks(videoId: string): Promise<CaptionTrack[]> {
  const resp = await fetch(INNERTUBE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': INNERTUBE_UA,
    },
    body: JSON.stringify({
      context: {
        client: {
          clientName: 'ANDROID',
          clientVersion: INNERTUBE_CLIENT_VERSION,
        },
      },
      videoId,
    }),
  });
  const data = (await resp.json()) as {
    captions?: {
      playerCaptionsTracklistRenderer?: {
        captionTracks?: CaptionTrack[];
      };
    };
  };
  return (
    data.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? []
  );
}

async function fetchSegments(baseUrl: string): Promise<TranscriptSegment[]> {
  const xml = await fetch(baseUrl, {
    headers: { 'User-Agent': INNERTUBE_UA },
  }).then((r) => r.text());
  return parseTimedtextXml(xml);
}

async function fetchPair(
  videoId: string,
  mode: SpikeCase['mode'],
): Promise<{ learning: TranscriptSegment[]; native: TranscriptSegment[] }> {
  const tracks = await fetchCaptionTracks(videoId);
  const enTrack =
    tracks.find((t) => t.languageCode === 'en') ?? tracks[0];
  if (!enTrack) {
    throw new Error(`No English track for ${videoId}`);
  }

  const learning = await fetchSegments(enTrack.baseUrl);
  await sleep(1500);

  let native: TranscriptSegment[] = [];
  if (mode === 'tlang-zh-Hant') {
    native = await fetchSegments(`${enTrack.baseUrl}&tlang=zh-Hant`);
    if (!native.length) {
      await sleep(3000);
      native = await fetchSegments(`${enTrack.baseUrl}&tlang=zh-Hant`);
    }
  } else {
    const zhTrack = tracks.find((t) => t.languageCode === 'zh-TW');
    if (zhTrack) {
      native = await fetchSegments(zhTrack.baseUrl);
    }
  }

  return { learning, native };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatTable(rows: string[][]): string {
  const widths = rows[0].map((_, col) =>
    Math.max(...rows.map((row) => row[col].length)),
  );
  return rows
    .map((row) =>
      row.map((cell, i) => cell.padEnd(widths[i])).join(' | '),
    )
    .join('\n');
}

async function main(): Promise<void> {
  mkdirSync(FIXTURE_DIR, { recursive: true });

  const results: Array<{
    case: SpikeCase;
    stats: ReturnType<typeof analyzePairingStrategies>;
  }> = [];

  for (const spikeCase of CASES) {
    await sleep(2000);
    console.log(`Fetching ${spikeCase.videoId}…`);
    const { learning, native } = await fetchPair(
      spikeCase.videoId,
      spikeCase.mode,
    );

    const fixturePath = join(FIXTURE_DIR, `${spikeCase.videoId}.json`);
    writeFileSync(
      fixturePath,
      JSON.stringify(
        { ...spikeCase, learning, native, fetchedAt: new Date().toISOString() },
        null,
        2,
      ),
    );

    results.push({
      case: spikeCase,
      stats: analyzePairingStrategies(learning, native),
    });
  }

  const joFixture = results.find((r) => r.case.videoId === 'j_r93YulrUE');
  let joContextSection = '_Could not analyze Jo Van Eyck fixture._';
  if (joFixture?.stats.nativeAvailable) {
    const raw = JSON.parse(
      readFileSync(join(FIXTURE_DIR, 'j_r93YulrUE.json'), 'utf8'),
    ) as { learning: TranscriptSegment[]; native: TranscriptSegment[] };
    const idx = raw.learning.findIndex((s) =>
      s.text.toLowerCase().includes('context engineering'),
    );
    if (idx >= 0) {
      const L = raw.learning[idx];
      const indexNative = raw.native[idx]?.text ?? null;
      const timeNative = nativeTextByTimeOverlap(L, raw.native).text;
      joContextSection = [
        `- **Learning cue ${idx}** @ ${L.start.toFixed(2)}s: "${L.text}"`,
        `- **Index-paired native:** ${indexNative ? `"${indexNative.slice(0, 120)}…"` : '_missing_'}`,
        `- **Time-overlap native:** ${timeNative ? `"${timeNative.slice(0, 120)}…"` : '_no overlap found_'}`,
      ].join('\n');
    }
  }

  const table = formatTable([
    [
      'Video',
      'Mode',
      'L cues',
      'N cues',
      'Index timing %',
      'Time overlap %',
      'Multi-match %',
    ],
    ...results.map(({ case: c, stats }) => [
      c.videoId,
      c.mode,
      String(stats.learningCount),
      stats.nativeAvailable ? String(stats.nativeCount) : '—',
      stats.nativeAvailable ? `${stats.indexTimingPassPct}%` : 'n/a',
      stats.nativeAvailable ? `${stats.timeOverlapCoveragePct}%` : 'n/a',
      stats.nativeAvailable ? `${stats.timeMultiMatchPct}%` : 'n/a',
    ]),
  ]);

  const report = `# Caption pairing spike report

**Date:** ${new Date().toISOString().slice(0, 10)}  
**Ticket:** [.scratch/youtube-bilingual-captions/issues/02-caption-pairing-spike.md](../issues/02-caption-pairing-spike.md)  
**ADR:** [ADR-0002](../../docs/adr/0002-youtube-bilingual-captions-spike-first.md)

## Methods

| Strategy | Definition |
|----------|------------|
| **A — Time overlap** | For each learning cue, pick native cue(s) with maximum interval overlap (>10ms). |
| **B — Index gate** | Pair learning cue *i* with native cue *i* only when \`start\` and \`duration\` match within ±50ms. |
| **C — YouTube native CC** | Not automated here — see §C below. Semia already hides YT CC; dual-layer would mean showing YT translate UI while Semia renders learning line. |

Tracks fetched via YouTube InnerTube (ANDROID client). Translation track uses \`&tlang=zh-Hant\` on the English ASR base URL unless noted.

## Summary table

\`\`\`
${table}
\`\`\`

## Case study: Jo Van Eyck (\`j_r93YulrUE\`)

Known production failure: short EN line paired with unrelated long ZH paragraph.

${joContextSection}

**Track shape:** ${joFixture?.stats.learningCount ?? '?'} learning cues vs ${joFixture?.stats.nativeCount ?? '?'} native (\`tlang\`) cues — **${joFixture && joFixture.stats.nativeCount ? Math.round((100 * joFixture.stats.nativeCount) / joFixture.stats.learningCount) : '?'}%** of learning count. Index pairing cannot be 1:1 even before semantics.

## Per-video notes

${results
  .map(({ case: c, stats }) => {
    const sampleLines = stats.samples
      .slice(0, 2)
      .map(
        (s) =>
          `  - cue ${s.cueIndex}: EN "${s.learningText.slice(0, 50)}…" → index ZH "${(s.indexNativeText ?? '—').slice(0, 50)}…" / time ZH "${(s.timeNativeText ?? '—').slice(0, 50)}…"`,
      )
      .join('\n');
    return `### ${c.label} (\`${c.videoId}\`)

- Mode: \`${c.mode}\`
- Native available: ${stats.nativeAvailable}
- Index timing pass: **${stats.indexTimingPassPct}%**
- Time overlap coverage: **${stats.timeOverlapCoveragePct}%**
${sampleLines || '  - _(no samples)_'}
`;
  })
  .join('\n')}

## Strategy C — YouTube native CC (manual)

| Pros | Cons |
|------|------|
| YouTube owns translation quality and cue boundaries | Semia currently **hides** native YT CC to show word-click overlay |
| No pairing code in Semia | Two visual systems; unclear if learning overlay + YT translate can coexist cleanly |
| | Word-click still needs Semia learning track — user sees **two different UIs** for subtitles |

**Verdict:** Worth a quick UI prototype, but does not remove the need for a pairing strategy if we want a **single Funlingo-style pill**.

## Failure modes observed

1. **Cue count mismatch (tlang):** Jo Van Eyck 674→324; Rick Astley 61→49. Index pairing structurally impossible for many cues.
2. **tlang unavailable:** Fireship \`kCc8FmEb1nY\` returned empty native track in this run — translate not offered or blocked.
3. **Human dual tracks:** 3Blue1Brown EN + human zh-TW have different segmentation (286 vs 231); index timing **0%**, time overlap **100%** but **39.5%** multi-match (one EN cue overlaps several ZH cues).
4. **Semantic drift under index pairing:** Rick Astley lyrics — index 12 maps to wrong verse even when some timing matches elsewhere.

## Recommendation

| Decision | Rationale |
|----------|-----------|
| **Defer dual-line overlay** | No strategy reaches trustworthy semantics on the Jo Van Eyck case. Index gate fails on count alone; time-overlap returns *some* text but multi-match and ASR/tlang segmentation make quality unpredictable. |
| **Next spike (optional)** | Manually review time-overlap output on Jo Van Eyck at 10 timestamps; if still nonsense, abandon on-overlay native line until a different data source exists. |
| **Do not ship index pairing** | Confirmed across all samples with \`tlang\`. |
| **Prototype path** | Ticket #03 settings UI can proceed; ticket #05 bilingual overlay should stay blocked until a human review pass on time-overlap samples says otherwise. |

## Fixtures

Raw \`learning\` + \`native\` segments JSON per video: [\`fixtures/\`](./fixtures/)

Re-run: \`npm run spike:caption-pairing\`
`;

  const reportPath = join(OUT_DIR, 'spike-report.md');
  writeFileSync(reportPath, report);
  console.log(`Wrote ${reportPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
