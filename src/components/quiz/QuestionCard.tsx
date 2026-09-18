import { useState } from 'react';
import { useQuiz } from '../../context/QuizContext';
import type { Question } from '../../types';
import { SingleChoice } from './SingleChoice';
import { MultiChoice } from './MultiChoice';
import { SubjectiveQuestion } from './SubjectiveQuestion';

interface Props {
  question: Question;
  num: number;
  chId: string;
  isWrongBook?: boolean;
}

export function QuestionCard({ question, num, chId, isWrongBook }: Props) {
  const { state } = useQuiz();
  const [cardState, setCardState] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const determineState = () => {
    if (!state.submitted) return 'idle';
    if (question.type === 'subjective') return 'idle';
    const userAns = state.answers[question.id];
    if (question.type === 'single') return userAns === question.answer ? 'correct' : 'wrong';
    if (question.type === 'multi') {
      const userArr = Array.isArray(userAns) ? [...userAns].sort().join(',') : '';
      const ansArr = [...(question.answer as number[])].sort().join(',');
      return userArr === ansArr ? 'correct' : 'wrong';
    }
    return 'idle';
  };

  const cs = determineState();
  const animDelay = `${num * 0.04}s`;

  const borderClass = cs === 'correct'
    ? 'border-emerald-400/50 bg-emerald-50/80 dark:bg-emerald-500/5'
    : cs === 'wrong'
      ? 'border-rose-400/50 bg-rose-50/80 dark:bg-rose-500/5'
      : 'border-white/20 bg-white/60 dark:bg-slate-800/40 dark:border-slate-700/50';

  return (
    <div
      className={`rounded-xl border p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md ${borderClass}`}
      style={{ animationDelay: animDelay, animation: 'fadeSlideIn 0.3s ease both' }}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-xs font-bold text-white">
          {num}
        </span>
        <span className={`rounded-md px-2.5 py-0.5 text-[11px] font-semibold ${
          question.type === 'single' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' :
          question.type === 'multi' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
          'bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400'
        }`}>
          {question.type === 'single' ? '单选' : question.type === 'multi' ? '多选' : '主观题'}
        </span>
      </div>
      <p className="mb-4 text-[15px] font-semibold leading-relaxed text-slate-800 dark:text-slate-100">{question.q}</p>

      {question.type === 'single' && <SingleChoice question={question} chId={chId} />}
      {question.type === 'multi' && <MultiChoice question={question} chId={chId} />}
      {question.type === 'subjective' && <SubjectiveQuestion question={question} />}

      {question.explain && state.submitted && (
        <div className="mt-3 rounded-lg border border-amber-300/40 bg-amber-50/80 px-4 py-3 text-sm leading-relaxed text-amber-900 dark:bg-amber-500/5 dark:border-amber-500/20 dark:text-amber-200">
          <span className="font-semibold">解析：</span>{question.explain}
        </div>
      )}
    </div>
  );
}
