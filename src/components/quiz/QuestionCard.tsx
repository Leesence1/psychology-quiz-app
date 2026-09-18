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

  const determineState = (): 'idle' | 'correct' | 'wrong' => {
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
    ? 'border-emerald-500/40 bg-emerald-500/5'
    : cs === 'wrong'
      ? 'border-rose-500/40 bg-rose-500/5'
      : 'border-slate-800/80 bg-slate-900/40 hover:border-emerald-500/20';

  return (
    <div
      className={`rounded-3xl border p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-emerald-950/30 ${borderClass}`}
      style={{ animationDelay: animDelay, animation: 'fadeSlideIn 0.3s ease both' }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-xs font-bold text-slate-950">
          {num}
        </span>
        <span className={`rounded-lg px-2.5 py-0.5 text-[11px] font-semibold ${
          question.type === 'single' ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' :
          question.type === 'multi' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
          'bg-purple-500/10 text-purple-300 border border-purple-500/20'
        }`}>
          {question.type === 'single' ? '单选' : question.type === 'multi' ? '多选' : '主观题'}
        </span>
      </div>
      <p className="mb-5 text-[15px] font-semibold leading-relaxed text-slate-100">{question.q}</p>

      {question.type === 'single' && <SingleChoice question={question} chId={chId} />}
      {question.type === 'multi' && <MultiChoice question={question} chId={chId} />}
      {question.type === 'subjective' && <SubjectiveQuestion question={question} />}

      {question.explain && state.submitted && (
        <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm leading-relaxed text-emerald-200/90">
          <span className="font-semibold text-emerald-400">解析：</span>{question.explain}
        </div>
      )}
    </div>
  );
}
