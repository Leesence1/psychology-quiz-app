import { useQuiz } from '../../context/QuizContext';
import type { Question } from '../../types';

interface Props {
  question: Question;
  chId: string;
}

const letters = ['A', 'B', 'C', 'D'];

export function SingleChoice({ question, chId }: Props) {
  const { state, setAnswer } = useQuiz();
  const selected = state.answers[question.id] as number | undefined;

  if (typeof question.answer !== 'number') return null;
  const correctIdx = question.answer;

  return (
    <div className="space-y-2">
      {question.options?.map((opt, i) => {
        let cls = 'border-slate-200 bg-white/50 hover:border-emerald-400 hover:bg-emerald-50/50 dark:border-slate-700 dark:bg-slate-800/30 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-500/5';
        let letterCls = 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';

        if (selected === i && !state.submitted) {
          cls = 'border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-500/10';
          letterCls = 'bg-emerald-500 text-white';
        }

        if (state.submitted) {
          if (i === correctIdx) {
            cls = 'border-emerald-500 bg-emerald-100 dark:border-emerald-400 dark:bg-emerald-500/10';
            letterCls = 'bg-emerald-500 text-white';
          } else if (selected === i) {
            cls = 'border-rose-400 bg-rose-50 dark:border-rose-500/50 dark:bg-rose-500/5';
            letterCls = 'bg-rose-500 text-white';
          }
        }

        return (
          <button
            key={i}
            onClick={() => !state.submitted && setAnswer(question.id, i)}
            className={`flex w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-sm transition-all ${cls}`}
          >
            <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all ${letterCls}`}>
              {letters[i]}
            </span>
            <span className="text-slate-700 dark:text-slate-200">{opt}</span>
          </button>
        );
      })}
    </div>
  );
}
