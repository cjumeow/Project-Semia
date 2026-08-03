(() => {
  const w = window as any;
  if (w.__ytTranscriptCaptureBridgeInstalled) return;
  w.__ytTranscriptCaptureBridgeInstalled = true;

  const BRIDGE_SOURCE = "YT_TRANSCRIPT_CAPTURE_BRIDGE";

  function readPlayerMeta(videoId: string | null) {
    const playerResponse = w.ytInitialPlayerResponse;
    const details = playerResponse?.videoDetails;
    if (!details?.title) return undefined;

    if (videoId && details.videoId && details.videoId !== videoId) {
      return undefined;
    }

    return {
      title: details.title as string,
      channel: details.author as string | undefined,
    };
  }

  function readCaptionTracks(videoId: string | null) {
    const playerResponse = w.ytInitialPlayerResponse;
    const responseVideoId = playerResponse?.videoDetails?.videoId;
    if (videoId && responseVideoId && responseVideoId !== videoId) {
      return [];
    }

    const tracks =
      playerResponse?.captions?.playerCaptionsTracklistRenderer
        ?.captionTracks ?? [];

    return tracks
      .map((track: { languageCode?: string; baseUrl?: string }) => ({
        languageCode: track.languageCode ?? "",
        baseUrl: track.baseUrl ?? "",
      }))
      .filter((track: { baseUrl: string }) => Boolean(track.baseUrl));
  }

  function readActiveCaptionLanguage(): string | undefined {
    const player = document.getElementById("movie_player") as
      | { getOption?: (module: string, name: string) => { languageCode?: string } }
      | null;
    const track = player?.getOption?.("captions", "track");
    return track?.languageCode || undefined;
  }

  function postCaptionTracks(videoId: string | null) {
    const tracks = readCaptionTracks(videoId);
    if (!tracks.length) return;

    const playerMeta = videoId ? readPlayerMeta(videoId) : undefined;

    window.postMessage(
      {
        source: BRIDGE_SOURCE,
        type: "CAPTION_TRACKS",
        videoId,
        tracks,
        activeCaptionLanguage: readActiveCaptionLanguage(),
        title: playerMeta?.title,
        channel: playerMeta?.channel,
      },
      "*",
    );
  }

  function postTimedtextUrl(url: string) {
    let videoId: string | null = null;
    try {
      videoId = new URL(url, window.location.origin).searchParams.get("v");
    } catch {
      videoId = null;
    }

    const playerMeta = videoId ? readPlayerMeta(videoId) : undefined;

    window.postMessage(
      {
        source: BRIDGE_SOURCE,
        type: "TIMEDTEXT_URL",
        url,
        title: playerMeta?.title,
        channel: playerMeta?.channel,
      },
      "*",
    );
  }

  function publishPlayerCaptionTracks() {
    const videoId = new URL(window.location.href).searchParams.get("v");
    if (!videoId) return;
    postCaptionTracks(videoId);
  }

  const originalFetch = window.fetch;

  window.fetch = async (input: any, init?: any) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input?.url;

    if (typeof url === "string" && url.includes("youtube.com/api/timedtext")) {
      postTimedtextUrl(url);
    }

    return originalFetch(input, init);
  };

  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (
    this: XMLHttpRequest,
    method: any,
    url: any,
    ...args: any[]
  ) {
    const urlStr =
      typeof url === "string"
        ? url
        : url instanceof URL
          ? url.toString()
          : String(url);

    if (urlStr && urlStr.includes("youtube.com/api/timedtext")) {
      postTimedtextUrl(urlStr);
    }

    return (originalOpen as any).apply(this, [method, url, ...args]);
  };

  window.addEventListener("yt-navigate-finish", publishPlayerCaptionTracks);
  publishPlayerCaptionTracks();
  window.setTimeout(publishPlayerCaptionTracks, 1500);
})();
