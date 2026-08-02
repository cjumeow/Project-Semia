import type { CardIntent, LanguageCard } from '@semia/shared';

type LanguageCardViewProps = {
  card: LanguageCard;
};

export function LanguageCardView({ card }: LanguageCardViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {card.intents.map((intent) => (
          <span
            key={intent}
            className="rounded-md bg-accent-soft px-2 py-0.5 font-mono text-[10px] uppercase text-accent"
          >
            {intent}
          </span>
        ))}
      </div>
      <CardField label="Focus" value={card.focus} />
      <CardField label="Meaning" value={card.meaning} multiline />
      <CardField label="Scenario 1" value={card.scenario1} multiline />
      <CardField label="Scenario 2" value={card.scenario2} multiline />
      {card.speakingExample ? (
        <CardField label="Speaking example" value={card.speakingExample} multiline />
      ) : null}
      {card.writingExample ? (
        <CardField label="Writing example" value={card.writingExample} multiline />
      ) : null}
      {card.learnerNote ? (
        <CardField label="Your note" value={card.learnerNote} multiline />
      ) : null}
    </div>
  );
}

function CardField({
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
      <p className="semia-section-label">{label}</p>
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
