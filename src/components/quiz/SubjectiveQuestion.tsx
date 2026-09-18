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
          className={`rounded-lg border px-4 py-1.5 text-sm font-semibold transition-all ${
            done
              ? 'border-emerald-400 bg-emerald-500 text-white'
              : 'border-emerald-300 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/5 dark:text-emerald-400'
          }`}
        >
          {done ? '已完成 ✓' : '标记已完成'}
        </button>
        {hasAnswer && (
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-600 transition-all hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/5 dark:text-blue-400"
          >
            {showAnswer ? '收起答案' : '查看答案'}
          </button>
        )}
      </div>
      {hasAnswer && showAnswer && (
        <div className="mt-3 rounded-lg border border-amber-300/40 bg-amber-50/80 px-4 py-3 text-sm leading-relaxed text-amber-900 dark:bg-amber-500/5 dark:border-amber-500/20 dark:text-amber-200">
          <span className="font-semibold">答题要点：</span>{question.answer}
        </div>
      )}
    </>
  );
}
