import type { StoredTranscript } from './types';
import { listTranscripts, saveTranscript } from './storage';
import { enrichTranscriptFromOembed, needsOembedEnrichment } from './youtubeOembed';

let inFlight: Promise<void> | null = null;

export function transcriptMetadataChanged(
  before: StoredTranscript,
  after: StoredTranscript,
): boolean {
  return before.title !== after.title || before.channel !== after.channel;
}

async function runEnrichment(): Promise<void> {
  const transcripts = await listTranscripts();

  for (const before of transcripts) {
    if (!needsOembedEnrichment(before)) continue;

    const after = await enrichTranscriptFromOembed(before);
    if (transcriptMetadataChanged(before, after)) {
      await saveTranscript(after);
    }
  }
}

/** Fetch oembed metadata and persist improvements — not on the LIST read path. */
export async function persistTranscriptOembedEnrichment(): Promise<void> {
  if (inFlight) {
    await inFlight;
    return;
  }

  inFlight = runEnrichment().finally(() => {
    inFlight = null;
  });

  await inFlight;
}
