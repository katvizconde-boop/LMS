type ExerciseInstructions = {
  intro?: string;
  steps: string[];
  deadlineNote?: string;
};

type Props = {
  moduleNumber: string;
  title: string | null;
  instructions: ExerciseInstructions;
};

export function ExerciseBlock({ moduleNumber, title, instructions }: Props) {
  const heading = title ?? `Module ${moduleNumber} — Submission`;
  return (
    <div className="my-8 rounded border border-dashed border-gold bg-cream-deep p-9">
      <h3 className="mb-4 font-serif text-3xl font-normal text-navy">{heading}</h3>
      {instructions.intro ? (
        <p className="mb-5 text-base text-navy-soft">{instructions.intro}</p>
      ) : null}
      <ol className="list-none [counter-reset:step]">
        {instructions.steps.map((step, i) => (
          <li
            key={i}
            className="relative border-b border-dotted border-gold/30 py-3.5 pl-14 text-[15px] last:border-b-0 [counter-increment:step] before:absolute before:left-0 before:top-3.5 before:font-mono before:text-sm before:font-medium before:text-gold before:content-[counter(step,decimal-leading-zero)]"
          >
            {step}
          </li>
        ))}
      </ol>
      {instructions.deadlineNote ? (
        <p className="mt-5 font-mono text-xs uppercase tracking-widest text-gold">
          {instructions.deadlineNote}
        </p>
      ) : null}
    </div>
  );
}
