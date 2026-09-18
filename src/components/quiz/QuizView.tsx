import React from 'react';
import { useQuiz } from '../../context/QuizContext';
import { getChapterStats } from '../../utils/stats';
import type { Question } from '../../types';
import { QuestionCard } from '../quiz/QuestionCard';

function renderQuestions(questions: Question[], chId: string) {
  let n = 0;
  const items: React.ReactNode[] = [];
  // Render objective first, then subjective
  questions.forEach(q => {
    if (q.type !== 'subjective') {
      n++;
      items.push(<QuestionCard key={q.id} question={q} num={n} chId={chId} />);
    }
  });
  questions.forEach(q => {
    if (q.type === 'subjective') {
      n++;
      items.push(<QuestionCard key={q.id} question={q} num={n} chId={chId} />);
    }
  });
  return items;
}

export function QuizView() {
  const { state, currentChapter } = useQuiz();

  if (!currentChapter) return null;

  const stats = getChapterStats(currentChapter);

  return (
    <div className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-8">
      <h2 className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
        {currentChapter.title}
      </h2>
      <p className="mb-4 text-sm text-slate-400">客观题点击选项作答，主观题可自查要点</p>

      {stats.total > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-500/15 bg-slate-900/40 px-4 py-3 shadow-lg backdrop-blur-sm">
          <span className="text-sm text-slate-300">已完成 {stats.correct}/{stats.total}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-500"
              style={{ width: `${stats.pct}%` }}
            />
          </div>
          <span className="min-w-[36px] text-right text-sm font-bold text-emerald-400">{stats.pct}%</span>
        </div>
      )}

      <div className="space-y-4">
        {renderQuestions(currentChapter.questions, currentChapter.id)}
      </div>
    </div>
  );
}
