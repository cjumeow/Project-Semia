/**
 * Funlingo parity spike (#36) — compare Semia strategies on saved fixtures.
 * Run: node --experimental-transform-types scripts/funlingo-parity-spike.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  isCoarseNativeTrack,
  overlapSeconds,
  pairNativeForLearningCue,
} from '../apps/extension/src/cuePairing.ts';
import type { TranscriptSegment } from '../apps/extension/src/types.ts';

function nativeTextByTimeOverlap(
  learning: TranscriptSegment,
  nativeSegments: TranscriptSegment[],
): { text: string | null } {
  const hits: Array<{ index: number; overlap: number }> = [];
  for (let i = 0; i < nativeSegments.length; i++) {
    const overlap = overlapSeconds(learning, nativeSegments[i]!);
    if (overlap > 0.01) hits.push({ index: i, overlap });
  }
  if (!hits.length) return { text: null };
  hits.sort((a, b) => b.overlap - a.overlap || a.index - b.index);
  const bestOverlap = hits[0]!.overlap;
  const best = hits.filter((h) => h.overlap === bestOverlap);
  return {
    text: best.map((h) => nativeSegments[h.index]!.text).join(' '),
  };
}

function resolveNativeOverlay(
  learning: TranscriptSegment,
  native: TranscriptSegment[],
  learningCount: number,
): string | null {
  if (!native.length) return null;
  if (isCoarseNativeTrack(learningCount, native.length)) return null;
  const paired = pairNativeForLearningCue(learning, native);
  if (paired.confidence !== 'high' || !paired.nativeText) return null;
  return paired.nativeText;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = join(__dirname, '../.scratch/youtube-bilingual-captions/fixtures');
const OUT = join(__dirname, '../.scratch/youtube-bilingual-captions/funlingo-parity-report.md');

type Fixture = {
  videoId?: string;
  label?: string;
  learning: TranscriptSegment[];
  native: TranscriptSegment[];
};

function load(name: string): Fixture {
  return JSON.parse(readFileSync(join(FIXTURE_DIR, name), 'utf8')) as Fixture;
}

type Row = {
  index: number;
  time: string;
  en: string;
  indexNative: string;
  timeNative: string;
  semiaGate: string;
  semiaOverlay: string;
};

function sampleRows(
  learning: TranscriptSegment[],
  native: TranscriptSegment[],
  indices: number[],
): Row[] {
  const lc = learning.length;
  return indices.map((i) => {
    const L = learning[i]!;
    const paired = pairNativeForLearningCue(L, native);
    const overlay = resolveNativeOverlay(L, native, lc);
    const time = nativeTextByTimeOverlap(L, native);
    return {
      index: i,
      time: L.start.toFixed(1),
      en: L.text.slice(0, 80),
      indexNative: (native[i]?.text ?? '—').slice(0, 80),
      timeNative: (time.text ?? '—').slice(0, 80),
      semiaGate: `${paired.confidence}${paired.reason ? ` (${paired.reason})` : ''}`,
      semiaOverlay: overlay ? 'show' : 'hide',
    };
  });
}

function table(rows: Row[]): string {
  const header =
    '| # | time | EN (learning) | Index native | Time-overlap native | Semia gate | Semia overlay |';
  const sep = '|---|------|---------------|--------------|---------------------|------------|---------------|';
  const body = rows.map(
    (r) =>
      `| ${r.index} | ${r.time}s | ${r.en.replace(/\|/g, '\\|')} | ${r.indexNative.replace(/\|/g, '\\|')} | ${r.timeNative.replace(/\|/g, '\\|')} | ${r.semiaGate} | ${r.semiaOverlay} |`,
  );
  return [header, sep, ...body].join('\n');
}

const jo = load('j_r93YulrUE.json');
const zoo = load('jNQXAC9IVRw.json');
const rick = load('dQw4w9WgXcQ.json');

const joIndices = [0, 11, 50, 96, 100, 150, 200, 250, 300, 320];
const zooIndices = [0, 1, 2, 3, 4, 5];
const rickIndices = [0, 5, 10, 12, 15, 20, 25, 30, 35, 40].filter(
  (i) => i < rick.learning.length,
);

const joRows = sampleRows(jo.learning, jo.native, joIndices);
const zooRows = sampleRows(zoo.learning, zoo.native, zooIndices);
const rickRows = sampleRows(rick.learning, rick.native, rickIndices);

const FIXTURES_START = '<!-- SPIKE:FIXTURES_START -->';
const FIXTURES_END = '<!-- SPIKE:FIXTURES_END -->';

const fixtureSection = `${FIXTURES_START}
## Semia automated comparison (fixtures)

Strategies per row:

- **Index native** — \`native[i]\` (Funlingo-like only when counts + timing match)
- **Time-overlap native** — max interval overlap (Semia v1 spike strategy A)
- **Semia gate** — \`pairNativeForLearningCue\` (v2/v3 gates)
- **Semia overlay** — \`resolveNativeCaptionLine\` (v3: **hide all** on coarse track)

### Jo Van Eyck (\`j_r93YulrUE\`) — long ASR + \`tlang\` zh-Hant

- Learning cues: **${jo.learning.length}** · Native cues: **${jo.native.length}** (${Math.round((100 * jo.native.length) / jo.learning.length)}%) · Coarse: **${isCoarseNativeTrack(jo.learning.length, jo.native.length)}**
- Semia overlay policy: **learning-only** (coarse)

${table(joRows)}

**Cue 96** (known production bug): index native is semantically wrong; time-overlap finds the aligned native (\`等等。對我來說，這是情境工程的一部分\`); Semia gate → \`high\` (correct pair) but overlay → **hide** (coarse track policy).

### Me at the zoo (\`jNQXAC9IVRw\`) — toy control (equal cue counts)

- Learning cues: **${zoo.learning.length}** · Native cues: **${zoo.native.length}** · Coarse: **${isCoarseNativeTrack(zoo.learning.length, zoo.native.length)}**
${zoo.native.length === 0 ? '\n> **Note:** Fixture native track empty (YouTube rate-limit on batch fetch). Re-fetch with `npm run spike:caption-pairing` for paired zoo data. Spike #02 reported 6×6 cues with 100% index/time alignment.\n' : ''}

${table(zooRows)}

Equal counts (when native track present): index ≈ time-overlap; Semia shows native on every cue. **Not representative** of long-form ASR + \`tlang\`.

### Rick Astley (\`dQw4w9WgXcQ\`) — lyrics, moderate mismatch

- Learning cues: **${rick.learning.length}** · Native cues: **${rick.native.length}** (${Math.round((100 * rick.native.length) / rick.learning.length)}%) · Coarse: **${isCoarseNativeTrack(rick.learning.length, rick.native.length)}**

${table(rickRows)}
${FIXTURES_END}`;

let report: string;
try {
  const existing = readFileSync(OUT, 'utf8');
  const start = existing.indexOf(FIXTURES_START);
  const end = existing.indexOf(FIXTURES_END);
  if (start !== -1 && end !== -1 && end > start) {
    report =
      existing.slice(0, start) +
      fixtureSection +
      existing.slice(end + FIXTURES_END.length);
    console.log('Updated fixture tables only (preserved Network RE section).');
  } else {
    throw new Error('markers missing');
  }
} catch {
  console.warn(
    'funlingo-parity-report.md missing SPIKE markers — writing fixture section only to stdout; restore report from git.',
  );
  report = fixtureSection;
}

writeFileSync(OUT, report);
console.log(`Wrote ${OUT}`);
