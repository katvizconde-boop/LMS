import { QuizBlock } from "./QuizBlock";

type Quiz = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  feedback: string;
  priorChoice: number | null;
};

type Props = {
  number: string;
  quizzes: Quiz[];
};

export function KnowledgeCheckSection({ number, quizzes }: Props) {
  if (quizzes.length === 0) return null;
  return (
    <section className="border-b border-line last:border-b-0">
      <div className="mx-auto max-w-[800px] px-6 py-20 sm:px-8">
        <div className="label-mono mb-3">Section {number}</div>
        <h2 className="heading-serif mb-6 text-4xl text-navy">Knowledge check</h2>
        <p className="prose-editorial">
          {quizzes.length === 1
            ? "One quick question to make sure the foundation stuck. Click your answer."
            : `${quizzes.length} quick questions to make sure the foundation stuck. Click your answer.`}
        </p>
        {quizzes.map((q) => (
          <QuizBlock
            key={q.id}
            quizId={q.id}
            question={q.question}
            options={q.options}
            correctIndex={q.correctIndex}
            feedback={q.feedback}
            priorChoice={q.priorChoice}
          />
        ))}
      </div>
    </section>
  );
}
