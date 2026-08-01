/** Turn chrome.storage failures into an actionable message. */
export function formatStorageError(error: unknown): string {
  const message = String(
    error instanceof Error ? error.message : (error ?? 'Unknown storage error'),
  );

  if (/quota/i.test(message) || /QUOTA_BYTES/i.test(message)) {
    return (
      'Storage quota exceeded. Reload the extension after the unlimitedStorage ' +
      'update, or clear Semia data in chrome://extensions → Semia → Storage.'
    );
  }

  return message;
}
