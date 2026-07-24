(() => {
  const w = window as any;
  // If the bridge is already installed, return.
  if (w.__ytTranscriptCaptureBridgeInstalled) return;
  w.__ytTranscriptCaptureBridgeInstalled = true;

  const BRIDGE_SOURCE = "YT_TRANSCRIPT_CAPTURE_BRIDGE";

  // Patch fetch to observe timedtext requests.
  const originalFetch = window.fetch;

  window.fetch = async (input: any, init?: any) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input?.url;

    if (typeof url === "string" && url.includes("youtube.com/api/timedtext")) {
      window.postMessage(
        { source: BRIDGE_SOURCE, type: "TIMEDTEXT_URL", url },
        "*",
      );
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
      window.postMessage(
        { source: BRIDGE_SOURCE, type: "TIMEDTEXT_URL", url: urlStr },
        "*",
      );
    }

    return (originalOpen as any).apply(this, [method, url, ...args]);
  };

})();