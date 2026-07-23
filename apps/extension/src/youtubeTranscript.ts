import type { TranscriptSegment } from "./types";
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
  const url = new URL(baseUrl);
  // fmt=json3 is convenient to parse.
  url.searchParams.set("fmt", "json3");
  return url.toString();
}

/**
 * Download and parse JSON3 timedtext into normalized segments.
 */
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
