import type { CardIntent, LanguageCard, LanguageCardExample } from '@semia/shared';

type LanguageCardViewProps = {
  card: LanguageCard;
};

export function LanguageCardView({ card }: LanguageCardViewProps) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-1.5">
        {card.intents.map((intent) => (
          <span
            key={intent}
            className="rounded-md bg-accent-soft px-2 py-0.5 font-mono text-[10px] uppercase text-accent"
          >
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
          <ul className="mt-2 flex flex-col gap-2">
            {card.examples.map((example) => (
              <ExampleBlock key={`${example.kind}-${example.text}`} example={example} />
            ))}
          </ul>
        </div>
      ) : null}
      {card.learnerNote ? (
        <CardField label="Your note" value={card.learnerNote} multiline />
      ) : null}
    </div>
  );
}

function ExampleBlock({ example }: { example: LanguageCardExample }) {
  const surfaceClass =
    example.kind === 'speaking'
      ? 'border-accent/25 bg-accent-soft/70'
      : 'border-border bg-canvas';

  return (
    <li
      className={[
        'rounded-lg border px-3.5 py-3',
        surfaceClass,
      ].join(' ')}
    >
      <p className="semia-section-label">{intentLabel(example.kind)}</p>
      <p className="mt-2 text-sm leading-relaxed text-text">{example.text}</p>
      {example.translation ? (
        <p className="semia-field-zh mt-2 text-text-secondary">
          {example.translation}
        </p>
      ) : null}
    </li>
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
