import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { analyzePairingStrategies } from '../apps/extension/src/captionPairingAnalysis.ts';

const dir = '.scratch/youtube-bilingual-captions/fixtures';
for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  const data = JSON.parse(readFileSync(join(dir, file), 'utf8')) as {
    videoId?: string;
    label?: string;
    learning: unknown[];
    native: unknown[];
  };
  const stats = analyzePairingStrategies(
    data.learning as Parameters<typeof analyzePairingStrategies>[0],
    data.native as Parameters<typeof analyzePairingStrategies>[1],
  );
  console.log(
    [
      file.replace('.json', ''),
      stats.learningCount,
      stats.nativeCount || '—',
      stats.nativeAvailable ? `${stats.indexTimingPassPct}%` : 'n/a',
      stats.nativeAvailable ? `${stats.timeOverlapCoveragePct}%` : 'n/a',
      stats.nativeAvailable ? `${stats.timeMultiMatchPct}%` : 'n/a',
    ].join('\t'),
  );
}
