import type { TranscriptSegment } from "./types";
import { toYoutubeTlang } from "@semia/shared";
import { decodeTimedtextEntities } from "./decodeTimedtextEntities";
import { hasTimedtextAuthParams, learningLanguagesCompatible } from "./transcriptSyncPolicy";
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

function appendTimedtextParam(url: string, key: string, value: string): string {
  const parsed = new URL(url, "https://www.youtube.com");
  if (parsed.searchParams.get(key) === value) {
    return url;
  }
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${key}=${encodeURIComponent(value)}`;
}

/**
 * Build a timedtext URL for the learning (source) track.
 */
export function buildLearningTimedtextUrl(
  templateOrVideoId: string,
  learningLanguage: string,
): string {
  if (
    templateOrVideoId.includes("/api/timedtext") &&
    hasTimedtextAuthParams(templateOrVideoId)
  ) {
    const parsed = new URL(templateOrVideoId, "https://www.youtube.com");
    const lang = parsed.searchParams.get("lang");
    if (
      lang &&
      !parsed.searchParams.has("tlang") &&
      learningLanguagesCompatible(lang, learningLanguage)
    ) {
      // Keep the exact player-issued string; pot/signature bind to it.
      return templateOrVideoId;
    }
  }

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
  const learningUrl = buildLearningTimedtextUrl(
    templateOrVideoId,
    learningLanguage,
  );
  const tlang = toYoutubeTlang(nativeLanguage);

  if (hasTimedtextAuthParams(templateOrVideoId)) {
    const parsed = new URL(learningUrl, "https://www.youtube.com");
    if (parsed.searchParams.get("tlang") === tlang) {
      return learningUrl;
    }
    return appendTimedtextParam(learningUrl, "tlang", tlang);
  }

  const url = new URL(learningUrl, "https://www.youtube.com");
  url.searchParams.set("tlang", tlang);
  return url.toString();
}

export function parseTimedtextXml(xml: string): TranscriptSegment[] {
  const results: TranscriptSegment[] = [];
  const pRegex = /<p\s+t="(\d+)"\s+d="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
  let match: RegExpExecArray | null;
  while ((match = pRegex.exec(xml)) !== null) {
    let text = "";
    const sRegex = /<s[^>]*>([^<]*)<\/s>/g;
    let sMatch: RegExpExecArray | null;
    while ((sMatch = sRegex.exec(match[3])) !== null) {
      text += sMatch[1];
    }
    if (!text) {
      text = match[3].replace(/<[^>]+>/g, "");
    }
    text = decodeTimedtextEntities(text);
    if (!text) continue;
    results.push({
      text,
      start: Number(match[1]) / 1000,
      duration: Number(match[2]) / 1000,
    });
  }
  if (results.length) return results;

  const classic = [
    ...xml.matchAll(/<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g),
  ];
  return classic.map((row) => ({
    text: decodeTimedtextEntities(row[3]),
    start: Number(row[1]),
    duration: Number(row[2]),
  }));
}

function parseJson3Timedtext(json: TimedTextJson3): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];

  for (const ev of json.events ?? []) {
    const startMs = ev.tStartMs;
    const durMs = ev.dDurationMs;
    if (typeof startMs !== "number" || typeof durMs !== "number") continue;

    const segText = decodeTimedtextEntities(
      (ev.segs ?? [])
        .map((s) => s.utf8 ?? "")
        .join("")
        .replace(/\n/g, " ")
        .trim(),
    );

    if (!segText) continue;

    segments.push({
      text: segText,
      start: startMs / 1000,
      duration: durMs / 1000,
    });
  }

  return segments;
}

/**
 * Download and parse timedtext into normalized segments.
 */
export function isTimedtextRateLimitError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /\b429\b/.test(message);
}

export async function fetchTranscriptSegments(
  timedtextUrl: string,
): Promise<TranscriptSegment[]> {
  const res = await fetch(timedtextUrl, { credentials: "include" });
  if (!res.ok) {
    throw new Error(
      `Failed to fetch timedtext: ${res.status} ${res.statusText}`,
    );
  }

  const text = await res.text();
  if (!text.trim()) {
    throw new Error(`Empty timedtext response! URL: ${timedtextUrl}`);
  }

  if (text.trimStart().startsWith("<?xml") || text.includes("<timedtext")) {
    return parseTimedtextXml(text);
  }

  const json = safeJsonParse<TimedTextJson3>(text);
  if (json) {
    return parseJson3Timedtext(json);
  }

  throw new Error(`Unrecognized timedtext response! URL: ${timedtextUrl}`);
}
