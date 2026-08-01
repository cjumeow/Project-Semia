import { useCallback, useEffect, useState } from 'react';
import {
  getWebJumpBackHint,
  type WebAnchor,
  type WebJumpBackHint,
} from '@semia/shared';
import { corpusRepository } from '../data/corpusRepository';

type WebSnippetRef = {
  id: string;
  anchor: WebAnchor;
  selectedText: string;
};

type UseWebJumpBackHintResult = {
  hint: WebJumpBackHint | undefined;
  resetRestoreStatus: () => void;
};

export function useWebJumpBackHint(
  snippet: WebSnippetRef | undefined,
): UseWebJumpBackHintResult {
  const [restoreFailed, setRestoreFailed] = useState(false);
  const [restoreSucceeded, setRestoreSucceeded] = useState(false);

  useEffect(() => {
    if (!snippet) {
      setRestoreFailed(false);
      setRestoreSucceeded(false);
      return;
    }

    const loadStatus = async (): Promise<void> => {
      const status = await corpusRepository.getWebRestoreStatus(snippet.id);
      setRestoreFailed(status === 'failed');
      setRestoreSucceeded(status === 'ok');
    };

    void loadStatus();
    return corpusRepository.subscribe(() => {
      void loadStatus();
    });
  }, [snippet?.id, snippet?.anchor]);

  const resetRestoreStatus = useCallback((): void => {
    setRestoreFailed(false);
    setRestoreSucceeded(false);
  }, []);

  const hint = snippet
    ? getWebJumpBackHint(snippet.anchor, {
        restoreFailed,
        restoreSucceeded,
        selectedText: snippet.selectedText,
      })
    : undefined;

  return { hint, resetRestoreStatus };
}
