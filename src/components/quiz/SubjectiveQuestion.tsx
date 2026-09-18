import { useState } from 'react';
import { useQuiz } from '../../context/QuizContext';
import type { Question } from '../../types';

interface Props {
  question: Question;
}

export function SubjectiveQuestion({ question }: Props) {
  const { state, toggleSubj } = useQuiz();
  const done = state.subjDone[question.id] || false;
  const [showAnswer, setShowAnswer] = useState(false);
  const hasAnswer = !!question.answer;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => toggleSubj(question.id)}
          className={`rounded-xl border px-4 py-1.5 text-sm font-semibold transition-all ${
            done
              ? 'border-emerald-500/40 bg-emerald-500 text-slate-950'
              : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10'
          }`}
        >
          {done ? '已完成 ✓' : '标记已完成'}
        </button>
        {hasAnswer && (
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-1.5 text-sm font-semibold text-blue-300 transition-all hover:bg-blue-500/10"
          >
            {showAnswer ? '收起答案' : '查看答案'}
          </button>
        )}
      </div>
      {hasAnswer && showAnswer && (
        <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm leading-relaxed text-amber-200/90">
          <span className="font-semibold text-amber-400">答题要点：</span>{question.answer}
        </div>
      )}
    </>
  );
}
