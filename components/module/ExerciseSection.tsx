import { ExerciseBlock } from "./ExerciseBlock";
import { ExerciseSubmissionForm } from "./ExerciseSubmissionForm";
import type { SubmissionStatus } from "@prisma/client";

type ExerciseInstructions = {
  intro?: string;
  steps: string[];
  deadlineNote?: string;
};

type Submission = {
  id: string;
  content: string;
  status: SubmissionStatus;
  reviewerNotes: string | null;
  submittedAt: Date;
  reviewedAt: Date | null;
};

type Props = {
  sectionNumber: string;
  moduleId: string;
  moduleNumber: string;
  introCopy?: string;
  exercise: {
    title: string | null;
    instructions: ExerciseInstructions;
  };
  latestSubmission: Submission | null;
};

export function ExerciseSection({
  sectionNumber,
  moduleId,
  moduleNumber,
  introCopy,
  exercise,
  latestSubmission,
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
        <ExerciseSubmissionForm
          moduleId={moduleId}
          latestSubmission={latestSubmission}
        />
      </div>
    </section>
  );
}
