import { persistTranscriptOembedEnrichment } from '../transcriptOembedEnrichment';
import {
  listTranscripts,
  saveTranscript,
  saveTranscriptError,
} from '../storage';
import type { BackgroundMessage } from '../types';

type TranscriptMessage =
  | Extract<BackgroundMessage, { type: 'SAVE_TRANSCRIPT' }>
  | Extract<BackgroundMessage, { type: 'SAVE_TRANSCRIPT_ERROR' }>
  | Extract<BackgroundMessage, { type: 'LIST_TRANSCRIPTS' }>;

export function isTranscriptMessage(
  message: BackgroundMessage,
): message is TranscriptMessage {
  return (
    message.type === 'SAVE_TRANSCRIPT' ||
    message.type === 'SAVE_TRANSCRIPT_ERROR' ||
    message.type === 'LIST_TRANSCRIPTS'
  );
}

export async function handleTranscriptMessage(
  message: TranscriptMessage,
): Promise<Record<string, unknown>> {
  switch (message.type) {
    case 'SAVE_TRANSCRIPT':
      await saveTranscript(message.transcript);
      return { ok: true };

    case 'SAVE_TRANSCRIPT_ERROR':
      await saveTranscriptError(message.error);
      return { ok: true };

    case 'LIST_TRANSCRIPTS':
      return { ok: true, transcripts: await listTranscripts() };
  }
}

export function bootstrapTranscriptPipeline(): void {
  void persistTranscriptOembedEnrichment();
}

export function onTranscriptsStorageChanged(): void {
  void persistTranscriptOembedEnrichment();
}
