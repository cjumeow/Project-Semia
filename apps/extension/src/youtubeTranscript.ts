import type { TranscriptSegment } from "./types";
import { toYoutubeTlang } from "@semia/shared";
import { safeJsonParse } from "./utils";

type TimedTextJson3 = {
  events?: Array<{
    tStartMs?: number;
    dDurationMs?: number;
    segs?: Array<{ utf8?: string }>;
  }>;
};

/**
 * Ensure a timedtext baseUrl requests JSON3.
 */
export function toJson3Url(baseUrl: string): string {
  const url = new URL(baseUrl, "https://www.youtube.com");
  url.searchParams.set("fmt", "json3");
  return url.toString();
}

/**
 * Build a timedtext URL for the learning (source) track.
 */
export function buildLearningTimedtextUrl(
  templateOrVideoId: string,
  learningLanguage: string,
): string {
  const url = templateOrVideoId.includes("/api/timedtext")
    ? new URL(templateOrVideoId, "https://www.youtube.com")
    : new URL("https://www.youtube.com/api/timedtext");
  if (!url.searchParams.get("v") && !templateOrVideoId.includes("/api/timedtext")) {
    url.searchParams.set("v", templateOrVideoId);
  }
  url.searchParams.set("lang", learningLanguage);
  url.searchParams.delete("tlang");
  url.searchParams.set("fmt", "json3");
  return url.toString();
}

/**
 * Build a timedtext URL for YouTube auto-translate (source lang + tlang).
 */
export function buildTranslatedTimedtextUrl(
  templateOrVideoId: string,
  learningLanguage: string,
  nativeLanguage: string,
): string {
  const url = new URL(
    buildLearningTimedtextUrl(templateOrVideoId, learningLanguage),
  );
  url.searchParams.set("tlang", toYoutubeTlang(nativeLanguage));
  return url.toString();
}

/**
 * Download and parse JSON3 timedtext into normalized segments.
 */
export function isTimedtextRateLimitError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /\b429\b/.test(message);
}

export async function fetchTranscriptSegments(
  json3Url: string,
): Promise<TranscriptSegment[]> {
  const res = await fetch(json3Url, { credentials: "include" });
  if (!res.ok) {
    throw new Error(
      `Failed to fetch timedtext: ${res.status} ${res.statusText}`,
    );
  }

  const text = await res.text();
  const json = safeJsonParse<TimedTextJson3>(text);
  if (!json) {
    throw new Error(`Empty JSON! URL: ${json3Url}`);
  }

  const events = json.events ?? [];
  const segments: TranscriptSegment[] = [];

  for (const ev of events) {
    const startMs = ev.tStartMs;
    const durMs = ev.dDurationMs;
    if (typeof startMs !== "number" || typeof durMs !== "number") continue;

    const segText = (ev.segs ?? [])
      .map((s) => s.utf8 ?? "")
      .join("")
      .replace(/\n/g, " ")
      .trim();

    if (!segText) continue;

    segments.push({
      text: segText,
      start: startMs / 1000,
      duration: durMs / 1000,
    });
  }

  return segments;
}
