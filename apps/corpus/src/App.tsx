import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LanguageCard } from '@semia/shared';
import { MAX_LANGUAGE_CARDS_PER_FRAGMENT } from '@semia/shared';
import { CreateLanguageCardModal } from './components/CreateLanguageCardModal';
import { InboxArchiveConfirmDialog } from './components/InboxArchiveConfirmDialog';
import { InboxWorkspace } from './components/InboxWorkspace';
import { MyCardsWorkspace } from './components/MyCardsWorkspace';
import { ReviewQueueWorkspace } from './components/ReviewQueueWorkspace';
import { SemiaSettingsDialog } from './components/SemiaSettingsDialog';
import { useCorpusData } from './hooks/useCorpusData';
import { useCorpusSelection } from './hooks/useCorpusSelection';
import { useContextWindowGeneration } from './hooks/useContextWindowGeneration';
import { useLanguageCardOnboarding } from './hooks/useLanguageCardOnboarding';
import { useLanguageCards } from './hooks/useLanguageCards';
import { useSemiaSettings } from './hooks/useSemiaSettings';
import { useSnippetNoteGeneration } from './hooks/useSnippetNoteGeneration';
import { useResizableWidth } from './hooks/useResizableWidth';
import { ResizeHandle } from './components/ResizeHandle';
import { SemiaSidebar } from './components/SemiaSidebar';
import { InboxDetailPanel } from './components/InboxDetailPanel';
import { SnippetDetail } from './components/SnippetDetail';
import { SourceWorkspace } from './components/SourceWorkspace';
import { LanguageCardReviewWorkspace } from './components/LanguageCardReviewWorkspace';
import {
  LanguageCardDetailModal,
  LanguageCardListModal,
} from './components/LinkedLanguageCards';
import { LanguageCardPreviewModal } from './components/LanguageCardPreviewModal';
import { corpusRepository } from './data/corpusRepository';
import { isGeneratedNote } from './types/corpus';
import { effectiveTriageStatus, snippetSeekSeconds } from './utils/corpusGrouping';
import { useSnippetChat } from './hooks/useSnippetChat';
import { WorkspaceWithChat } from './components/WorkspaceWithChat';
import { isEditableTarget } from './utils/isEditableTarget';
import {
  shouldPromptArchiveWithoutFormalCards,
} from './utils/languageCardInboxWorkspaceModel';
import type { InboxProcessTrigger } from './components/inboxTriageTypes';

const SIDEBAR_COLLAPSED_WIDTH = 52;

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [createCardOpen, setCreateCardOpen] = useState(false);
  const [previewCard, setPreviewCard] = useState<LanguageCard | null>(null);
  const [languageCardListOpen, setLanguageCardListOpen] = useState(false);
  const [languageCardDetail, setLanguageCardDetail] = useState<LanguageCard | null>(null);
  const [archiveConfirmSnippetId, setArchiveConfirmSnippetId] = useState<
    string | null
  >(null);
  const [archiveDontShowAgain, setArchiveDontShowAgain] = useState(false);
  const [inboxProcessTrigger, setInboxProcessTrigger] =
    useState<InboxProcessTrigger | null>(null);
  const {
    settings,
    contextWindowEnabled,
    languageCardsProEnabled,
    languageCardAiSuggestionsEnabled,
    focusKeywordMode,
    darkModeEnabled,
    setContextWindowEnabled,
    setLanguageCardsProEnabled,
    setLanguageCardAiSuggestionsEnabled,
    setFocusKeywordMode,
    setDarkModeEnabled,
    setSkipInboxArchiveWithoutFormalCardConfirm,
  } = useSemiaSettings();
  const { showOnboarding, markOnboardingSeen } = useLanguageCardOnboarding();
  const {
    cards: languageCards,
    refresh: refreshLanguageCards,
    countForFragment,
    cardsForFragment,
  } = useLanguageCards();
  const { groups, snippets, loading, error, fragmentCount, isLive, refresh } =
    useCorpusData();
  const {
    selection,
    inboxSourceGroups,
    librarySourceGroups,
    pendingQueue,
    dueQueue,
    dueCardQueue,
    selectedGroup,
    selectedSnippet,
    selectedCard,
    selectInboxSource,
    selectLibrarySource,
    selectMyCards,
    selectReviewQueue,
    selectCardReviewQueue,
    selectReviewQueueSnippet,
    selectCardReviewQueueCard,
    selectSnippet,
    advanceInboxSelectionAfterTriage,
  } = useCorpusSelection(groups, snippets, languageCards);

  const { generating, error: noteError, regenerate } = useSnippetNoteGeneration(
    selectedSnippet,
    refresh,
  );

  const {
    generating: generatingContext,
    error: contextError,
  } = useContextWindowGeneration(
    selectedSnippet,
    refresh,
    contextWindowEnabled,
  );

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed((current) => !current);
  }, []);

  const { width: sidebarWidth, onResizeStart: onSidebarResizeStart } =
    useResizableWidth({
      min: 160,
      max: 480,
      defaultWidth: 280,
      storageKey: 'semia-sidebar-width',
      edge: 'end',
    });

  const { width: detailWidth, onResizeStart: onDetailResizeStart } =
    useResizableWidth({
      min: 280,
      max: 640,
      defaultWidth: 600,
      storageKey: 'semia-detail-width',
      edge: 'start',
    });

  const effectiveSidebarWidth = sidebarCollapsed
    ? SIDEBAR_COLLAPSED_WIDTH
    : sidebarWidth;

  const showEmpty = !loading && !error && groups.length === 0;

  const chatSnippet = useMemo(() => {
    const fragmentId =
      selectedSnippet?.id ?? selectedCard?.sourceFragmentId ?? null;
    if (!fragmentId) return null;
    return snippets.find((snippet) => snippet.id === fragmentId) ?? null;
  }, [selectedCard?.sourceFragmentId, selectedSnippet?.id, snippets]);

  const snippetChat = useSnippetChat({ chatSnippet, isLive });

  const inboxChatContextSnippets = useMemo(
    () =>
      selection.pane === 'inbox'
        ? pendingQueue.map((snippet) => ({
            id: snippet.id,
            selectedText: snippet.selectedText,
          }))
        : undefined,
    [pendingQueue, selection.pane],
  );

  const languageCardCount = selectedSnippet
    ? countForFragment(selectedSnippet.id)
    : 0;
  const snippetLanguageCards = selectedSnippet
    ? cardsForFragment(selectedSnippet.id)
    : [];
  const createLanguageCardEnabled =
    isLive &&
    Boolean(selectedSnippet && isGeneratedNote(selectedSnippet.note)) &&
    languageCardCount < MAX_LANGUAGE_CARDS_PER_FRAGMENT;

  const handleCreateLanguageCard = useCallback(
    async (input: {
      focusText: string;
      intents: ('speaking' | 'writing')[];
      learnerNote?: string;
      includeScenario?: boolean;
    }) => {
      if (!selectedSnippet) {
        throw new Error('Select a snippet first.');
      }

      const card = await corpusRepository.createLanguageCard({
        fragment: selectedSnippet,
        focusText: input.focusText,
        intents: input.intents,
        learnerNote: input.learnerNote,
        includeScenario: input.includeScenario,
      });
      await Promise.all([refresh(), refreshLanguageCards()]);
      setCreateCardOpen(false);
      setPreviewCard(card);
      return card;
    },
    [refresh, refreshLanguageCards, selectedSnippet],
  );

  const languageCardProps = {
    languageCardCount,
    onOpenLanguageCards:
      languageCardCount > 0
        ? () => setLanguageCardListOpen(true)
        : undefined,
    onCreateLanguageCard: createLanguageCardEnabled
      ? () => setCreateCardOpen(true)
      : undefined,
    createLanguageCardEnabled,
  };

  const handleMarkTriage = useCallback(
    async (snippetId: string, status: 'review' | 'mastered'): Promise<void> => {
      if (!isLive) return;
      await corpusRepository.setSnippetTriageStatus(snippetId, status);
      await refresh();
    },
    [isLive, refresh],
  );

  const handleStillLearning = useCallback(
    async (snippetId: string): Promise<void> => {
      if (!isLive) return;
      await corpusRepository.recordStillLearning(snippetId);
      await refresh();
    },
    [isLive, refresh],
  );

  const handleCardStillLearning = useCallback(
    async (cardId: string): Promise<void> => {
      if (!isLive) return;
      await corpusRepository.recordCardStillLearning(cardId);
      await refreshLanguageCards();
    },
    [isLive, refreshLanguageCards],
  );

  const handleCardMasteredInReview = useCallback(
    async (cardId: string): Promise<void> => {
      if (!isLive) return;
      await corpusRepository.markCardMasteredInReview(cardId);
      await refreshLanguageCards();
    },
    [isLive, refreshLanguageCards],
  );

  const handleDeleteSnippet = useCallback(async (): Promise<void> => {
    if (!selectedSnippet || !isLive) return;
    await corpusRepository.deleteFragment(selectedSnippet.id);
    await refresh();
  }, [isLive, refresh, selectedSnippet]);

  const handleDeleteSnippetById = useCallback(
    async (snippetId: string): Promise<void> => {
      if (!isLive) return;
      await corpusRepository.deleteFragment(snippetId);
      await refresh();
    },
    [isLive, refresh],
  );

  const completeInboxArchive = useCallback(
    async (snippetId: string): Promise<void> => {
      if (!isLive) return;
      await corpusRepository.setSnippetTriageStatus(snippetId, 'mastered');
      await refresh();
    },
    [isLive, refresh],
  );

  const handleRequestInboxProcess = useCallback(
    (snippetId: string): void => {
      const formalCount = countForFragment(snippetId);
      if (
        shouldPromptArchiveWithoutFormalCards(
          formalCount,
          settings.skipInboxArchiveWithoutFormalCardConfirm ?? false,
        )
      ) {
        setArchiveDontShowAgain(false);
        setArchiveConfirmSnippetId(snippetId);
        return;
      }
      setInboxProcessTrigger({ snippetId, nonce: Date.now() });
    },
    [countForFragment, settings.skipInboxArchiveWithoutFormalCardConfirm],
  );

  const handleConfirmInboxArchive = useCallback(async (): Promise<void> => {
    if (!archiveConfirmSnippetId) return;
    if (archiveDontShowAgain) {
      await setSkipInboxArchiveWithoutFormalCardConfirm(true);
    }
    const snippetId = archiveConfirmSnippetId;
    setArchiveConfirmSnippetId(null);
    setInboxProcessTrigger({ snippetId, nonce: Date.now() });
  }, [
    archiveConfirmSnippetId,
    archiveDontShowAgain,
    setSkipInboxArchiveWithoutFormalCardConfirm,
  ]);

  const handleDeleteSource = useCallback(async (): Promise<void> => {
    if (!selectedGroup || !isLive) return;

    const label =
      selectedGroup.meta.kind === 'youtube' ? 'YouTube video' : 'web page';
    const confirmed = window.confirm(
      `Delete this ${label} and all ${selectedGroup.snippets.length} snippet${
        selectedGroup.snippets.length === 1 ? '' : 's'
      }? This cannot be undone.`,
    );
    if (!confirmed) return;

    await corpusRepository.deleteSource(selectedGroup.meta.sourceUrl);
    await refresh();
  }, [isLive, refresh, selectedGroup]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Backspace') return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isEditableTarget(event.target)) return;
      if (!selectedSnippet || !isLive || loading || error) return;

      event.preventDefault();
      void handleDeleteSnippet();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [error, handleDeleteSnippet, isLive, loading, selectedSnippet]);

  const workspace =
    selection.pane === 'inbox' ? (
      <InboxWorkspace
        pendingSnippets={pendingQueue}
        inboxSourceCount={inboxSourceGroups.length}
        selectedSnippetId={selection.snippetId}
        onSelectSnippet={selectSnippet}
        onRequestProcess={handleRequestInboxProcess}
        onProcessComplete={(snippetId) => {
          void completeInboxArchive(snippetId);
        }}
        onDeleteSnippet={(snippetId) => {
          void handleDeleteSnippetById(snippetId);
        }}
        onTriageExitStart={advanceInboxSelectionAfterTriage}
        processTrigger={inboxProcessTrigger}
        onProcessTriggerConsumed={() => setInboxProcessTrigger(null)}
        triageEnabled={isLive}
      />
    ) : selection.pane === 'review-queue' ? (
      <ReviewQueueWorkspace
        dueSnippets={dueQueue}
        selectedSnippet={selectedSnippet}
        actionsEnabled={isLive}
        generating={generating}
        noteError={noteError}
        generatingContext={generatingContext}
        contextError={contextError}
        onSelectSnippet={selectReviewQueueSnippet}
        onStillLearning={(snippetId) => {
          void handleStillLearning(snippetId);
        }}
        onMastered={(snippetId) => {
          void handleMarkTriage(snippetId, 'mastered');
        }}
        contextWindowEnabled={contextWindowEnabled}
        onOpenSettings={() => setSettingsOpen(true)}
        {...languageCardProps}
      />
    ) : selection.pane === 'card-review-queue' ? (
      <LanguageCardReviewWorkspace
        dueCards={dueCardQueue}
        selectedCard={selectedCard}
        actionsEnabled={isLive}
        onSelectCard={selectCardReviewQueueCard}
        onStillLearning={(cardId) => {
          void handleCardStillLearning(cardId);
        }}
        onMastered={(cardId) => {
          void handleCardMasteredInReview(cardId);
        }}
      />
    ) : selection.pane === 'my-cards' ? (
      <MyCardsWorkspace
        cards={languageCards}
        snippets={snippets}
        contextWindowEnabled={contextWindowEnabled}
      />
    ) : (
      <SourceWorkspace
        group={selectedGroup}
        selectedSnippetId={selection.snippetId}
        seekSeconds={
          selectedSnippet ? snippetSeekSeconds(selectedSnippet) : undefined
        }
        onSelectSnippet={selectSnippet}
        onDeleteSource={isLive ? () => void handleDeleteSource() : undefined}
        cardCountForSnippet={countForFragment}
      />
    );

  const showDetailPanel =
    selection.pane !== 'review-queue' &&
    selection.pane !== 'card-review-queue' &&
    selection.pane !== 'my-cards';

  return (
    <main className="flex h-screen overflow-hidden bg-canvas text-text">
      <div
        className="flex h-full shrink-0 flex-col overflow-x-hidden border-r border-border bg-shelf transition-[width] duration-200 ease-out"
        style={{ width: effectiveSidebarWidth }}
      >
        <SemiaSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapsed={toggleSidebarCollapsed}
          pane={selection.pane}
          inboxGroups={inboxSourceGroups}
          libraryGroups={librarySourceGroups}
          myCardsCount={languageCards.length}
          dueCount={dueQueue.length}
          dueCardCount={dueCardQueue.length}
          selectedSourceKey={selection.sourceKey}
          onSelectInboxSource={selectInboxSource}
          onSelectLibrarySource={selectLibrarySource}
          onSelectMyCards={selectMyCards}
          onSelectReviewQueue={selectReviewQueue}
          onSelectCardReviewQueue={selectCardReviewQueue}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      </div>

      {!sidebarCollapsed ? (
        <ResizeHandle onResizeStart={onSidebarResizeStart} />
      ) : null}

      {loading ? (
        <section className="flex flex-1 items-center justify-center bg-canvas">
          <p className="text-sm text-text-muted">Loading captures…</p>
        </section>
      ) : error ? (
        <section className="flex flex-1 items-center justify-center bg-canvas">
          <p className="px-6 text-center text-sm text-red-600">{error}</p>
        </section>
      ) : showEmpty ? (
        <section className="flex flex-1 items-center justify-center bg-canvas">
          <div className="max-w-sm px-6 text-center">
            {!isLive ? (
              <>
                <p className="text-sm font-medium text-text">Preview mode</p>
                <p className="mt-2 text-sm text-text-muted">
                  This dev preview cannot read Chrome extension storage. Open
                  SEMIA from the extension icon or LingoPanel on YouTube.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-text">No captures yet</p>
                <p className="mt-2 text-sm text-text-muted">
                  Capture snippets from YouTube or any web page, then return here
                  to review them.
                </p>
                <p className="mt-3 text-xs text-text-muted">
                  Storage check: {fragmentCount} capture
                  {fragmentCount === 1 ? '' : 's'} found.
                </p>
              </>
            )}
          </div>
        </section>
      ) : (
        <WorkspaceWithChat
          chat={snippetChat}
          contextSnippets={inboxChatContextSnippets}
          activeContextSnippetId={selectedSnippet?.id}
          onSelectContextSnippet={
            selection.pane === 'inbox'
              ? (snippetId) => {
                  const snippet = pendingQueue.find((item) => item.id === snippetId);
                  if (snippet) {
                    snippetChat.recordContextSwitch(snippet);
                  }
                  selectSnippet(snippetId);
                }
              : undefined
          }
        >
          {workspace}
        </WorkspaceWithChat>
      )}

      {showDetailPanel ? (
        <>
          <ResizeHandle onResizeStart={onDetailResizeStart} />

          <div className="flex h-full shrink-0 border-l border-border bg-surface">
            {selection.pane === 'inbox' ? (
              <InboxDetailPanel
                snippet={selectedSnippet}
                width={detailWidth}
                generating={generating}
                error={noteError}
                onRegenerate={() => {
                  void regenerate();
                }}
                generatingContext={generatingContext}
                contextError={contextError}
                contextWindowEnabled={contextWindowEnabled}
                onOpenSettings={() => setSettingsOpen(true)}
                languageCards={snippetLanguageCards}
                languageCardCount={languageCardCount}
                createLanguageCardEnabled={createLanguageCardEnabled}
                languageCardAiSuggestionsEnabled={languageCardAiSuggestionsEnabled}
                focusKeywordMode={focusKeywordMode}
                isLive={isLive}
                onLanguageCardsChanged={refreshLanguageCards}
              />
            ) : (
              <SnippetDetail
                snippet={selectedSnippet}
                width={detailWidth}
                generating={generating}
                error={noteError}
                onRegenerate={() => {
                  void regenerate();
                }}
                generatingContext={generatingContext}
                contextError={contextError}
                contextWindowEnabled={contextWindowEnabled}
                onOpenSettings={() => setSettingsOpen(true)}
                languageCards={snippetLanguageCards}
                {...languageCardProps}
                onMarkMastered={
                  isLive &&
                  selectedSnippet &&
                  effectiveTriageStatus(selectedSnippet) === 'review'
                    ? () => {
                        void handleMarkTriage(selectedSnippet.id, 'mastered');
                      }
                    : undefined
                }
              />
            )}
          </div>
        </>
      ) : null}
      <InboxArchiveConfirmDialog
        open={archiveConfirmSnippetId !== null}
        dontShowAgain={archiveDontShowAgain}
        onDontShowAgainChange={setArchiveDontShowAgain}
        onCancel={() => setArchiveConfirmSnippetId(null)}
        onConfirm={() => {
          void handleConfirmInboxArchive();
        }}
      />
      <SemiaSettingsDialog
        open={settingsOpen}
        darkModeEnabled={darkModeEnabled}
        contextWindowEnabled={contextWindowEnabled}
        languageCardsProEnabled={languageCardsProEnabled}
        languageCardAiSuggestionsEnabled={languageCardAiSuggestionsEnabled}
        focusKeywordMode={focusKeywordMode}
        onClose={() => setSettingsOpen(false)}
        onDarkModeEnabledChange={(enabled) => {
          void setDarkModeEnabled(enabled);
        }}
        onContextWindowEnabledChange={(enabled) => {
          void setContextWindowEnabled(enabled);
        }}
        onLanguageCardsProEnabledChange={(enabled) => {
          void setLanguageCardsProEnabled(enabled);
        }}
        onLanguageCardAiSuggestionsEnabledChange={(enabled) => {
          void setLanguageCardAiSuggestionsEnabled(enabled);
        }}
        onFocusKeywordModeChange={(mode) => {
          void setFocusKeywordMode(mode);
        }}
      />
      <CreateLanguageCardModal
        open={createCardOpen}
        snippet={selectedSnippet}
        languageCardsProEnabled={languageCardsProEnabled}
        showOnboarding={showOnboarding}
        onClose={() => setCreateCardOpen(false)}
        onOpenSettings={() => {
          setCreateCardOpen(false);
          setSettingsOpen(true);
        }}
        onMarkOnboardingSeen={markOnboardingSeen}
        onCreate={handleCreateLanguageCard}
      />
      <LanguageCardPreviewModal
        card={previewCard}
        onClose={() => setPreviewCard(null)}
      />
      {languageCardListOpen ? (
        <LanguageCardListModal
          cards={snippetLanguageCards}
          onSelectCard={(card) => {
            setLanguageCardListOpen(false);
            setLanguageCardDetail(card);
          }}
          onClose={() => setLanguageCardListOpen(false)}
        />
      ) : null}
      <LanguageCardDetailModal
        card={languageCardDetail}
        onClose={() => setLanguageCardDetail(null)}
      />
    </main>
  );
}
