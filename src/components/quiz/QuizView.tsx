import { useQuiz } from '../../context/QuizContext';
import { gradeQuestions } from '../../utils/grading';
import { getChapterStats } from '../../utils/stats';
import type { Question } from '../../types';
import { QuestionCard } from '../quiz/QuestionCard';

function renderQuestions(questions: Question[], chId: string) {
  let n = 0;
  const objCount = questions.filter(q => q.type !== 'subjective').length;
  return (
    <>
      {questions.map(q => {
        if (q.type === 'subjective') return null;
        n++;
        return <QuestionCard key={q.id} question={q} num={n} chId={chId} />;
      })}
      {questions.map(q => {
        if (q.type !== 'subjective') return null;
        n++;
        return <QuestionCard key={q.id} question={q} num={n} chId={chId} />;
      })}
    </>
  );
}

export function QuizView() {
  const { state, currentChapter } = useQuiz();

  if (!currentChapter) return null;

  const stats = getChapterStats(currentChapter);

  return (
    <div className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-8">
      <h2 className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
        {currentChapter.title}
      </h2>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">客观题点击选项作答，主观题可自查要点</p>

      {stats.total > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/10 bg-white/60 px-4 py-3 shadow-sm backdrop-blur-sm dark:bg-slate-800/40">
          <span className="text-sm text-slate-600 dark:text-slate-300">已完成 {stats.correct}/{stats.total}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-500"
              style={{ width: `${stats.pct}%` }}
            />
          </div>
          <span className="min-w-[36px] text-right text-sm font-bold text-emerald-600 dark:text-emerald-400">{stats.pct}%</span>
        </div>
      )}

      <div className="space-y-4">
        {renderQuestions(currentChapter.questions, currentChapter.id)}
      </div>
    </div>
  );
}
