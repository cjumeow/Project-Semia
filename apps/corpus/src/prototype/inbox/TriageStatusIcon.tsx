import type { SnippetTriageStatus } from './inboxTriageModel';

type TriageStatusIconProps = {
  status: SnippetTriageStatus;
  size?: number;
  className?: string;
};

/** Mastered = green check. Review = brown circle. Pending = amber ring. */
export function TriageStatusIcon({
  status,
  size = 16,
  className = '',
}: TriageStatusIconProps) {
  if (status === 'mastered') {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center text-emerald-600 ${className}`}
        title="Mastered"
        aria-label="Mastered"
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
    );
  }

  if (status === 'review') {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center ${className}`}
        title="Review"
        aria-label="Review"
      >
        <span
          className="rounded-full bg-[#8B7355]"
          style={{ width: size * 0.7, height: size * 0.7 }}
          aria-hidden
        />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${className}`}
      title="Pending"
      aria-label="Pending"
    >
      <span
        className="rounded-full border-2 border-amber-400/90 bg-amber-50"
        style={{ width: size * 0.65, height: size * 0.65 }}
        aria-hidden
      />
    </span>
  );
}
