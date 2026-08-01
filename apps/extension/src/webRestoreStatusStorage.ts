import {
  WEB_RESTORE_STATUS_STORAGE_KEY,
  type WebRestoreStatus,
  type WebRestoreStatusMap,
} from '@semia/shared';

async function readMap(): Promise<WebRestoreStatusMap> {
  const result = await chrome.storage.local.get(WEB_RESTORE_STATUS_STORAGE_KEY);
  return (result[WEB_RESTORE_STATUS_STORAGE_KEY] ?? {}) as WebRestoreStatusMap;
}

export async function setWebRestoreStatus(
  fragmentId: string,
  status: WebRestoreStatus,
): Promise<void> {
  const map = await readMap();
  map[fragmentId] = status;
  await chrome.storage.local.set({
    [WEB_RESTORE_STATUS_STORAGE_KEY]: map,
  });
}

export async function clearWebRestoreStatus(fragmentId: string): Promise<void> {
  const map = await readMap();
  if (!(fragmentId in map)) return;

  delete map[fragmentId];
  await chrome.storage.local.set({
    [WEB_RESTORE_STATUS_STORAGE_KEY]: map,
  });
}
