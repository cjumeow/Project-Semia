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
})();
