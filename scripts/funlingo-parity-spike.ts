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

const report = `# Funlingo parity spike report

**Date:** ${new Date().toISOString().slice(0, 10)}  
**Ticket:** [#36](https://github.com/cjumeow/Project-Semia/issues/36) · [issues/06-funlingo-parity-spike.md](./issues/06-funlingo-parity-spike.md)  
**Scope:** Research only — no production code changes.

## Executive summary

| Question | Answer |
|----------|--------|
| Does Funlingo use YouTube \`tlang\` like Semia? | **Unlikely on YouTube** — Funlingo engineering blog describes intercepting the **learning subtitle track** and running a **batched MT pipeline** on the same cue boundaries, not pairing against a separate \`tlang\` track. |
| Why does Funlingo "feel" better on long videos? | **1:1 cue alignment by construction** — native line is a translation of the *same* timed cue Semia already shows for word-click. |
| Can Semia match Funlingo while keeping \`tlang\` only? | **Not reliably** on coarse ASR+\`tlang\` pairs (Jo, Lex). Count/timing/semantic drift are structural. |
| Semia v3 mitigation (shipped) | Coarse \`tlang\` track → **learning-only** overlay — avoids wrong native, does not restore Funlingo-style dual line. |

## Funlingo architecture (public sources)

Sources: [Funlingo engineering blog — dual subtitles](https://engineeringgetfunlingo.hashnode.dev/how-we-built-real-time-dual-subtitles-for-youtube-and-netflix-and-what-we-got-wrong-first), [subtitle platform adapters](https://engineeringgetfunlingo.hashnode.dev/the-hardest-part-of-building-a-language-learning-extension-isn-t-translation-it-s-subtitles).

| Layer | Funlingo (described) | Semia (shipped) |
|-------|----------------------|-----------------|
| Learning line source | Intercept platform timedtext / VTT **before** player render | Intercept ASR \`lang=en\` timedtext (same) |
| Native line source | **MT batch translate** of upcoming ~90s of **same cues** | YouTube \`&tlang=\` auto-translate (**separate** segmentation) |
| Alignment | Same cue index / same timestamps | Time overlap + gates between mismatched tracks |
| Native CC | Suppress platform CC; own renderer | Hide YT CC; Semia pill overlay |
| Failure on zh-Hans vs zh-Hant | Blog: "bug in some languages but not others" — likely **MT/locale**, not \`tlang\` drift | Observed: **different \`tlang\` shapes** per locale |

**Hypothesis (primary):** Funlingo parity is not a smarter pairing function on \`tlang\` — it is a **different data source** (translate learning cues, not pair learning ↔ \`tlang\`).

**Hypothesis (secondary):** Extensions that *do* use \`tlang\` (e.g. yt-dual-subs) still suffer when cue counts differ; they may hide errors on short/equal-count videos only.

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

## Manual HITL: Funlingo side-by-side (required for full parity)

Automated run cannot install Funlingo. To complete the comparison on **Lex #434** (\`e-gwvmhyU7A\`) and Jo:

1. Install [Funlingo](https://chromewebstore.google.com/detail/funlingo-dual-subtitles-f/gjdpaicenfffjkgofmcjikilokigkonj) alongside Semia (separate profile or disable one extension at a time).
2. Open video → enable captions → Funlingo: learning **en**, native **zh-TW** (or zh-CN).
3. At each timestamp, record Funlingo native line vs Semia overlay:

| Video | Timestamp | EN (both) | Funlingo ZH | Semia ZH (v3) |
|-------|-----------|-----------|-------------|---------------|
| Jo \`j_r93YulrUE\` | 3:56 (cue 96) | *That's part of context engineering* | _fill_ | learning-only |
| Lex \`e-gwvmhyU7A\` | 1:57:41 | *you wanna really stick* | _fill_ | learning-only |
| Lex \`e-gwvmhyU7A\` | ~56:13 | *405B that's not released yet* | _fill_ | learning-only |

**Prediction:** Funlingo shows a **short, same-span** zh line aligned to the EN cue; Semia v3 shows **no** native line on Lex/Jo (coarse track).

## Recommendations for Semia

| Option | Effort | Funlingo parity? | Trade-off |
|--------|--------|------------------|-----------|
| **A. Keep coarse → learning-only** | Done | No dual line on long videos | Safe, no wrong native |
| **B. MT translate learning cues** (Funlingo-like) | High | **Yes** — 1:1 alignment | API cost, latency, cache; new \`ai/\` or translate module |
| **C. Hybrid** — \`tlang\` when counts match; else MT | Medium | Partial | Complexity |
| **D. Show YouTube native CC layer** | Low–med | Variable | Fights word-click UX (ADR-0003 strategy C) |

**Recommendation:** If product requires Funlingo-quality dual line on Lex/Jo-class videos, spike **Option B** next (translate learning \`segments[i]\` per cue or batched window) — not more \`tlang\` pairing gates.

## Reproduction

\`\`\`bash
node --experimental-transform-types scripts/funlingo-parity-spike.ts
node --experimental-transform-types scripts/analyze-spike-fixtures.ts
npm test -- apps/extension/src/lexPairingRepro.test.ts
\`\`\`

## References

- Semia spike #02: [spike-report.md](./spike-report.md)
- ADR-0003 gated native line: [docs/adr/0003-youtube-bilingual-gated-native-line.md](../../docs/adr/0003-youtube-bilingual-gated-native-line.md)
- Funlingo Chrome Web Store: [Funlingo dual subtitles](https://chromewebstore.google.com/detail/funlingo-dual-subtitles-f/gjdpaicenfffjkgofmcjikilokigkonj)
`;

writeFileSync(OUT, report);
console.log(`Wrote ${OUT}`);
