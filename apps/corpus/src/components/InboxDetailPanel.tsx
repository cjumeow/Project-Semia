import { useState } from 'react';
import type { LanguageCard } from '@semia/shared';
import type { CorpusSnippet } from '../types/corpus';
import type { DetailTab } from '../utils/languageCardInboxWorkspaceModel';
import { DetailTabBar } from './DetailTabBar';
import { LanguageCardDetailModal, LanguageCardListModal } from './LinkedLanguageCards';
import { LanguageCardsTabPlaceholder } from './LanguageCardsTabPlaceholder';
import { SnippetDetail } from './SnippetDetail';

type InboxDetailPanelProps = {
  snippet: CorpusSnippet | undefined;
  width: number;
  generating?: boolean;
  error?: string | null;
  onRegenerate?: () => void;
  generatingContext?: boolean;
  contextError?: string | null;
  contextWindowEnabled?: boolean;
  onOpenSettings?: () => void;
  languageCards?: LanguageCard[];
  languageCardCount?: number;
  onCreateLanguageCard?: () => void;
  createLanguageCardEnabled?: boolean;
};

export function InboxDetailPanel({
  snippet,
  width,
  generating,
  error,
  onRegenerate,
  generatingContext,
  contextError,
  contextWindowEnabled,
  onOpenSettings,
  languageCards = [],
  languageCardCount = 0,
  onCreateLanguageCard,
  createLanguageCardEnabled,
}: InboxDetailPanelProps) {
  const [detailTab, setDetailTab] = useState<DetailTab>('snip');
  const [languageListOpen, setLanguageListOpen] = useState(false);
  const [peekCard, setPeekCard] = useState<LanguageCard | null>(null);

  return (
    <>
      <section
        className="flex h-full shrink-0 flex-col overflow-hidden bg-surface"
        style={{ width }}
      >
        <DetailTabBar activeTab={detailTab} onTabChange={setDetailTab} />
        {detailTab === 'snip' ? (
          <SnippetDetail
            snippet={snippet}
            embedded
            variant="inbox-snip"
            generating={generating}
            error={error}
            onRegenerate={onRegenerate}
            generatingContext={generatingContext}
            contextError={contextError}
            contextWindowEnabled={contextWindowEnabled}
            onOpenSettings={onOpenSettings}
            languageCardCount={languageCardCount}
            onOpenLanguageCards={
              languageCardCount > 0 ? () => setLanguageListOpen(true) : undefined
            }
            onCreateLanguageCard={onCreateLanguageCard}
            createLanguageCardEnabled={createLanguageCardEnabled}
          />
        ) : (
          <LanguageCardsTabPlaceholder snippet={snippet} />
        )}
      </section>

      {languageListOpen ? (
        <LanguageCardListModal
          cards={languageCards}
          onClose={() => setLanguageListOpen(false)}
          onSelectCard={(card) => {
            setLanguageListOpen(false);
            setPeekCard(card);
          }}
        />
      ) : null}

      <LanguageCardDetailModal
        card={peekCard}
        sourceTitle={snippet?.sourceTitle}
        onClose={() => setPeekCard(null)}
      />
    </>
  );
}
