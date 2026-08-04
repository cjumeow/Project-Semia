import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { PracticeIcon, StudyCardsIcon, WebIcon, YouTubeIcon } from '../../components/SemiaNavIcons';
import { TriageStatusIcon } from '../../components/TriageStatusIcon';
import type { StyleVariantDefinition } from './styleVariants';
import type { SaasThemePrototypeState, SnippetBadge } from './useSaasThemePrototypeState';
import { SNIPPETS } from './useSaasThemePrototypeState';

const ICON_SIZE = 16;
const ICON_SIZE_SM = 15;

const SPEAKING_EXAMPLES = [
  {
    text: "We used to assemble everything on-site, but that's impossible now because the new system is so dense.",
    translation: '我們以前都在現場組裝，但現在因為新系統密度太高，這已經不可能了。',
  },
  {
    text: 'The team still meets on-site every Monday to review the rollout.',
    translation: '團隊每週一仍會到現場檢視部署進度。',
  },
] as const;

export function ThemeShell({
  state,
  styleVariant,
}: {
  state: SaasThemePrototypeState;
  styleVariant: StyleVariantDefinition;
}) {
  const selected = SNIPPETS.find((s) => s.id === state.selectedSnippetId) ?? SNIPPETS[0]!;
  const isPractice = state.pane === 'practice-snippets' || state.pane === 'practice-cards';

  return (
    <div className="flex h-screen overflow-hidden bg-canvas font-sans text-text">
      <aside className="flex h-full w-[280px] shrink-0 flex-col border-r border-border bg-shelf">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-2 pb-3 pt-3">
          <SidebarRow label="Inbox" count={1} />
          <NavItem
            label="Git flight rules"
            sub="github.com · 2 pending"
            icon={<WebIcon size={ICON_SIZE_SM} />}
            active={state.pane === 'inbox-source'}
            onClick={() => state.selectPane('inbox-source')}
            indent
          />

          <SidebarRow label="Library" count={2} className="mt-2" />
          <NavItem
            label="Immersion learning tips"
            sub="Language Coach · 3 snip"
            icon={<YouTubeIcon size={ICON_SIZE_SM} />}
            active={false}
            onClick={() => undefined}
            indent
          />

          <SidebarRow
            label="Practice"
            count={3}
            icon={<PracticeIcon size={ICON_SIZE} />}
            className="mt-2 border-t border-border pt-2"
          />
          <NavItem
            label="Snippets due"
            sub="0 snippets"
            active={state.pane === 'practice-snippets'}
            onClick={() => state.selectPane('practice-snippets')}
            indent
          />
          <NavItem
            label="Cards due"
            sub="3 cards"
            active={state.pane === 'practice-cards'}
            onClick={() => state.selectPane('practice-cards')}
            indent
          />

          <div className="mt-2 border-t border-border pt-2">
            <button
              type="button"
              className={[
                'proto-interactive flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors',
                state.pane === 'my-cards'
                  ? 'semia-margin-active border-accent/30 text-accent'
                  : 'border-border bg-surface text-text-secondary',
              ].join(' ')}
              onClick={() => state.selectPane('my-cards')}
            >
              <StudyCardsIcon size={ICON_SIZE} className={state.pane === 'my-cards' ? 'text-accent' : undefined} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold">Study cards</span>
                <span className="block truncate text-[11px] text-text-muted">9 saved cards</span>
              </span>
              <span className="rounded-md border border-border bg-canvas px-1.5 py-0.5 font-mono text-[11px] text-text-muted">
                9
              </span>
            </button>
          </div>
        </div>
      </aside>

      {isPractice ? (
        <PracticePanel state={state} selected={selected} />
      ) : (
        <>
          <section className="flex min-w-0 flex-1 flex-col border-r border-border bg-canvas">
            <header className="border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold text-text">
                Confederate naval vessels, although they&apos;re separated…
              </h2>
              <p className="mt-1 text-xs text-text-muted">History lecture</p>
            </header>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <p className="mb-3 text-xs font-medium text-text-secondary">Selections</p>
              <ul className="space-y-1">
                {SNIPPETS.map((snippet) => {
                  const isActive =
                    state.pane === 'snippet' && state.selectedSnippetId === snippet.id;
                  const triageStatus = state.triageBySnippetId[snippet.id] ?? 'pending';
                  return (
                    <li key={snippet.id}>
                      <div
                        className={[
                          'flex items-center gap-1 rounded-md border-l-[3px] border-transparent',
                          isActive ? 'semia-margin-active' : '',
                        ].join(' ')}
                      >
                        <button
                          type="button"
                          className={[
                            'proto-interactive flex min-w-0 flex-1 items-center gap-3 py-2.5 pl-[calc(0.75rem-3px)] pr-2 text-left transition-colors',
                            isActive ? 'text-text' : 'text-text-secondary',
                          ].join(' ')}
                          onClick={() => state.selectSnippet(snippet.id)}
                        >
                          <span className="proto-timestamp">{snippet.time}</span>
                          <span className="flex-1 truncate text-sm font-medium">{snippet.text}</span>
                          <SnippetBadgePill badge={snippet.badge} styleVariant={styleVariant} />
                        </button>

                        {triageStatus === 'pending' ? (
                          <div className="flex shrink-0 items-center gap-1 pr-2">
                            <IconTriageButton
                              label="Mark as review"
                              onClick={() => state.markSnippet(snippet.id, 'review')}
                            >
                              <TriageStatusIcon status="review" size={14} />
                            </IconTriageButton>
                            <IconTriageButton
                              label="Mark as mastered"
                              onClick={() => state.markSnippet(snippet.id, 'mastered')}
                            >
                              <TriageStatusIcon status="mastered" size={14} />
                            </IconTriageButton>
                          </div>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>

          <section className="flex w-[400px] shrink-0 flex-col overflow-y-auto bg-canvas p-5">
            <header className="mb-4 shrink-0">
              <h2 className="text-lg font-semibold leading-snug text-text">{selected.text}</h2>
              <span className="proto-timestamp mt-1 inline-block">{selected.time}</span>
            </header>

            <article className="proto-note-card flex flex-col gap-5">
              <button
                type="button"
                className="proto-language-card-btn proto-interactive self-start"
              >
                <LanguageCardIcon />
                Language card
              </button>

              <Field label="Original Speech" value="We used to assemble everything on-site." />
              <Field label="Natural Translation" value="我們以前都在現場組裝。" multiline />

              <LanguageCardPreview styleVariant={styleVariant} />

              <div className="overflow-hidden rounded-lg proto-context-collapsed">
                <button
                  type="button"
                  className="proto-interactive flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
                  onClick={state.toggleContext}
                  aria-expanded={state.contextExpanded}
                >
                  <span className="text-sm font-medium text-text">Context window</span>
                  <span className="text-text-muted" aria-hidden>
                    {state.contextExpanded ? '▾' : '▸'}
                  </span>
                </button>
                {state.contextExpanded ? (
                  <div className="border-t border-border bg-surface px-4 py-3">
                    <p className="text-sm leading-relaxed text-text">
                      …everything <mark className="proto-context-highlight">on-site</mark>…
                    </p>
                    <div className="my-3 border-t border-border" />
                    <p className="proto-context-native text-sm leading-relaxed">
                      …都在現場…
                    </p>
                  </div>
                ) : null}
              </div>

              <Field label="Background Note" value="Industrial / logistics phrasing." multiline />
            </article>
          </section>
        </>
      )}
    </div>
  );
}

function SnippetBadgePill({
  badge,
  styleVariant,
}: {
  badge: SnippetBadge;
  styleVariant: StyleVariantDefinition;
}) {
  const className = ['proto-snippet-badge', badgeClass(badge, styleVariant)].join(' ');

  if (badge.kind === 'dueNow') {
    return <span className={className}>Due now</span>;
  }
  if (badge.kind === 'cards') {
    return (
      <span className={className}>
        {badge.count} card{badge.count === 1 ? '' : 's'}
      </span>
    );
  }
  return <span className={className}>{badge.label}</span>;
}

function badgeClass(badge: SnippetBadge, styleVariant: StyleVariantDefinition): string {
  if (badge.kind === 'dueNow') return styleVariant.badges.dueNow;
  if (badge.kind === 'cards') return styleVariant.badges.cards;
  return styleVariant.badges.schedule;
}

function LanguageCardPreview({ styleVariant }: { styleVariant: StyleVariantDefinition }) {
  return (
    <div className="border-t border-border pt-5">
      <div className="mb-3 flex flex-wrap gap-1.5">
        <span className={styleVariant.intents.speaking}>Speaking</span>
        <span className={styleVariant.intents.writing}>Writing</span>
      </div>
      <Field label="Focus" value="on-site assembly" />
      <Field label="中文" value="現場組裝" />
      <div className="mt-4">
        <p className="text-sm font-medium text-text-secondary">Examples</p>
        <div className="proto-example-block mt-2">
          <p className="text-xs font-medium text-text-secondary">Speaking</p>
          <ul className="proto-example-list">
            {SPEAKING_EXAMPLES.map((example) => (
              <li key={example.text}>
                <p>{example.text}</p>
                <p className="proto-example-zh">{example.translation}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function PracticePanel({
  state,
  selected,
}: {
  state: SaasThemePrototypeState;
  selected: (typeof SNIPPETS)[number];
}) {
  return (
    <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-canvas">
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-3xl font-semibold text-text">{selected.text}</h2>
          <p className="mt-2 text-center text-xs text-text-muted">History lecture</p>
        </div>
      </div>

      <div className="shrink-0 border-t border-border bg-shelf/80 px-5 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text">{selected.text}</p>
            <p className="truncate text-[11px] text-text-muted">1/3 · Stage 1</p>
          </div>
          <div className="flex w-[min(20rem,48vw)] shrink-0 gap-3">
            <button
              type="button"
              className="min-w-0 flex-1 rounded-xl border border-[#8B7355]/40 bg-[#F5EDE4] px-4 py-3.5 text-sm font-medium text-[#5C4A32] transition-colors hover:bg-[#EBE0D4]"
              onClick={() => state.selectPane('practice-snippets')}
            >
              Still learning
            </button>
            <button
              type="button"
              className="min-w-0 flex-1 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-100"
              onClick={() => state.selectPane('practice-cards')}
            >
              Mastered
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SidebarRow({
  label,
  count,
  icon,
  className = '',
}: {
  label: string;
  count: number;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        'proto-section-label flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] font-medium',
        className,
      ].join(' ')}
    >
      <span className="text-[11px]">›</span>
      {icon ? <span className="flex h-4 w-4 items-center justify-center">{icon}</span> : null}
      <span className="flex-1">{label}</span>
      <span className="text-[11px] tabular-nums opacity-70">{count}</span>
    </div>
  );
}

function NavItem({
  label,
  sub,
  icon,
  active,
  onClick,
  indent,
}: {
  label: string;
  sub: string;
  icon?: ReactNode;
  active: boolean;
  onClick: () => void;
  indent?: boolean;
}) {
  return (
    <button
      type="button"
      className={[
        'proto-interactive my-0.5 flex w-full flex-col items-stretch gap-0.5 rounded-md border-l-[3px] border-transparent py-2 text-left transition-colors',
        indent ? 'pl-5' : 'pl-2.5',
        active ? 'semia-margin-active text-accent' : 'text-text-secondary',
      ].join(' ')}
      onClick={onClick}
    >
      <span className="flex items-center gap-1.5">
        {icon}
        <span className="truncate text-[13px] font-medium">{label}</span>
      </span>
      <span className={`truncate text-[11px] ${active ? 'text-accent/80' : 'text-text-muted'}`}>
        {sub}
      </span>
    </button>
  );
}

function IconTriageButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className="proto-triage-btn"
      aria-label={label}
      title={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      {children}
    </button>
  );
}

function LanguageCardIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="size-5 shrink-0"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802"
      />
    </svg>
  );
}

function Field({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-text-secondary">{label}</p>
      <p className={`mt-1.5 text-sm leading-relaxed text-text ${multiline ? '' : ''}`}>{value}</p>
    </div>
  );
}

export function useInterFont(): void {
  useEffect(() => {
    const id = 'saas-theme-proto-inter';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }, []);
}
