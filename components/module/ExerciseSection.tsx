import { ExerciseBlock } from "./ExerciseBlock";

type ExerciseInstructions = {
  intro?: string;
  steps: string[];
  deadlineNote?: string;
};

type Props = {
  sectionNumber: string;
  moduleNumber: string;
  introCopy?: string;
  exercise: {
    title: string | null;
    instructions: ExerciseInstructions;
  };
};

export function ExerciseSection({
  sectionNumber,
  moduleNumber,
  introCopy,
  exercise,
}: Props) {
  return (
    <section className="border-b border-line last:border-b-0">
      <div className="mx-auto max-w-[800px] px-6 py-20 sm:px-8">
        <div className="label-mono mb-3">Section {sectionNumber}</div>
        <h2 className="heading-serif mb-6 text-4xl text-navy">
          Your applied exercise
        </h2>
        {introCopy ? <p className="prose-editorial">{introCopy}</p> : null}
        <ExerciseBlock
          moduleNumber={moduleNumber}
          title={exercise.title}
          instructions={exercise.instructions}
        />
      </div>
    </section>
  );
}
