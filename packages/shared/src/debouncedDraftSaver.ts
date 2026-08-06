export type DebouncedDraftSaver<T> = {
  schedule: (value: T) => void;
  flush: () => Promise<void>;
  cancel: () => void;
};

type CreateDebouncedDraftSaverOptions<T> = {
  delayMs: number;
  save: (value: T) => Promise<void> | void;
};

export function createDebouncedDraftSaver<T>({
  delayMs,
  save,
}: CreateDebouncedDraftSaverOptions<T>): DebouncedDraftSaver<T> {
  let pendingValue: T | undefined;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let inFlight: Promise<void> | undefined;

  const runSave = async (value: T): Promise<void> => {
    await save(value);
  };

  const clearPendingTimer = (): void => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
  };

  const schedule = (value: T): void => {
    pendingValue = value;
    clearPendingTimer();
    timeoutId = setTimeout(() => {
      timeoutId = undefined;
      const valueToSave = pendingValue;
      pendingValue = undefined;
      if (valueToSave === undefined) return;
      inFlight = runSave(valueToSave).finally(() => {
        inFlight = undefined;
      });
    }, delayMs);
  };

  const flush = async (): Promise<void> => {
    clearPendingTimer();
    if (inFlight) {
      await inFlight;
    }
    if (pendingValue === undefined) {
      return;
    }
    const valueToSave = pendingValue;
    pendingValue = undefined;
    await runSave(valueToSave);
  };

  const cancel = (): void => {
    clearPendingTimer();
    pendingValue = undefined;
  };

  return { schedule, flush, cancel };
}
