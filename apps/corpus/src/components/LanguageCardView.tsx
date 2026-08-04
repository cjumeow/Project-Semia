import type { CardIntent, LanguageCard, LanguageCardExample } from '@semia/shared';
import type { ReactNode } from 'react';
import { groupExamplesByKind, intentChipClass } from '../utils/semiaUi';

type LanguageCardViewProps = {
  card: LanguageCard;
};

export function LanguageCardView({ card }: LanguageCardViewProps) {
  const { speaking, writing } = groupExamplesByKind(card.examples);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-1.5">
        {card.intents.map((intent) => (
          <span key={intent} className={intentChipClass(intent)}>
            {intentLabel(intent)}
          </span>
        ))}
      </div>
      <CardField label="Focus" value={card.focus} />
      <CardField label="中文" value={card.meaning} labelZh multiline />
      {card.scenario ? (
        <CardField label="Usage" value={card.scenario} labelZh multiline />
      ) : null}
      {card.examples.length > 0 ? (
        <div>
          <p className="semia-section-label">Examples</p>
          <div className="mt-2 flex flex-col gap-2">
            {renderExampleSections(card.intents, speaking, writing)}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function renderExampleSections(
  intents: CardIntent[],
  speaking: LanguageCardExample[],
  writing: LanguageCardExample[],
): ReactNode[] {
  const sections: ReactNode[] = [];
  const seen = new Set<CardIntent>();

  for (const intent of intents) {
    if (seen.has(intent)) continue;
    seen.add(intent);

    if (intent === 'speaking' && speaking.length > 0) {
      sections.push(<SpeakingExampleBlock key="speaking" examples={speaking} />);
    } else if (intent === 'writing') {
      for (const example of writing) {
        sections.push(
          <WritingExampleBlock key={`${example.kind}-${example.text}`} example={example} />,
        );
      }
    }
  }

  return sections;
}

function SpeakingExampleBlock({ examples }: { examples: LanguageCardExample[] }) {
  return (
    <div className="semia-example-block">
      <p className="text-xs font-medium text-text-secondary">Speaking</p>
      <ul className="semia-example-list">
        {examples.map((example) => (
          <li key={example.text}>
            <p>{example.text}</p>
            {example.translation ? (
              <p className="semia-field-zh semia-example-zh">{example.translation}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function WritingExampleBlock({ example }: { example: LanguageCardExample }) {
  return (
    <div className="semia-example-block">
      <p className="text-xs font-medium text-text-secondary">{intentLabel(example.kind)}</p>
      <p className="mt-2 text-sm leading-relaxed text-text">{example.text}</p>
      {example.translation ? (
        <p className="semia-field-zh semia-example-zh">{example.translation}</p>
      ) : null}
    </div>
  );
}

function CardField({
  label,
  value,
  labelZh,
  multiline,
}: {
  label: string;
  value: string;
  labelZh?: boolean;
  multiline?: boolean;
}) {
  return (
    <div>
      <p className={labelZh ? 'semia-section-label-zh' : 'semia-section-label'}>
        {label}
      </p>
      <p
        className={[
          'mt-1.5 text-sm leading-relaxed text-text',
          multiline ? 'whitespace-pre-line font-reading' : '',
        ].join(' ')}
      >
        {value}
      </p>
    </div>
  );
}

export function intentLabel(intent: CardIntent): string {
  return intent === 'speaking' ? 'Speaking' : 'Writing';
}
