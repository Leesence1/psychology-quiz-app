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
    <div className="space-y-2.5">
      {question.options?.map((opt, i) => {
        let cls = 'border-slate-800/80 bg-slate-900/30 text-slate-300 hover:border-emerald-500/30 hover:bg-slate-800/30';
        let letterCls = 'bg-slate-800 text-slate-400';

        if (selected === i && !state.submitted) {
          cls = 'border-emerald-500/50 bg-emerald-500/15 text-emerald-200 shadow-lg shadow-emerald-500/10';
          letterCls = 'bg-emerald-400 text-slate-950 font-bold';
        }

        if (state.submitted) {
          if (i === correctIdx) {
            cls = 'border-emerald-500/50 bg-emerald-500/20 text-emerald-200 font-medium';
            letterCls = 'bg-emerald-400 text-slate-950 font-bold';
          } else if (selected === i) {
            cls = 'border-rose-500/50 bg-rose-500/15 text-rose-200';
            letterCls = 'bg-rose-400 text-slate-950 font-bold';
          }
        }

        return (
          <button
            key={i}
            onClick={() => !state.submitted && setAnswer(question.id, i)}
            className={`flex w-full items-center gap-3.5 rounded-2xl border px-4 py-3 text-sm transition-all duration-200 ${cls}`}
          >
            <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-all ${letterCls}`}>
              {letters[i]}
            </span>
            <span className="leading-snug">{opt}</span>
          </button>
        );
      })}
    </div>
  );
}
