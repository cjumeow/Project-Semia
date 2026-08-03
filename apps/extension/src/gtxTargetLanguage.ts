/** Map Semia native language to Google `gtx` `tl=` parameter. */
export function toGtxTargetLanguage(nativeLanguage: string): string {
  const trimmed = nativeLanguage.trim();
  if (trimmed === 'zh-TW' || trimmed === 'zh-Hant') return 'zh-TW';
  if (trimmed === 'zh-CN' || trimmed === 'zh-Hans') return 'zh-CN';
  return trimmed || 'zh-TW';
}
