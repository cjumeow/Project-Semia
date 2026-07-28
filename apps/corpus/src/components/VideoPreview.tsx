import {
  buildYouTubeThumbnailUrl,
  buildYouTubeWatchUrl,
  formatTimestamp,
} from '../utils/youtubeUrl';

type VideoPreviewProps = {
  videoId: string;
  title: string;
  seekSeconds?: number;
};

export function VideoPreview({
  videoId,
  title,
  seekSeconds,
}: VideoPreviewProps) {
  const watchUrl = buildYouTubeWatchUrl(videoId, seekSeconds);
  const thumbnailUrl = buildYouTubeThumbnailUrl(videoId);

  return (
    <div className="mx-auto aspect-video w-[85%] overflow-hidden rounded-xl border border-border bg-black shadow-sm">
      <a
        href={watchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block h-full w-full"
        aria-label={
          seekSeconds !== undefined
            ? `Open "${title}" on YouTube at ${formatTimestamp(seekSeconds)}`
            : `Open "${title}" on YouTube`
        }
      >
        <img
          src={thumbnailUrl}
          alt=""
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur-sm transition-transform group-hover:scale-105">
            <PlayIcon />
          </span>
          <span className="rounded-full bg-black/55 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            Open on YouTube
            {seekSeconds !== undefined ? ` · ${formatTimestamp(seekSeconds)}` : ''}
          </span>
        </div>
      </a>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
