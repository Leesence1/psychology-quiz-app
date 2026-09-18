import { BookOpen } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';
import { getChapterStats, getBadgeClass } from '../../utils/stats';
import type { View } from '../../types';

export function Sidebar() {
  const { state, selectChapter, switchView } = useQuiz();

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 flex-shrink-0 overflow-y-auto border-r border-emerald-500/10 bg-white/60 backdrop-blur-xl dark:bg-slate-900/60 lg:block">
      <nav className="py-3">
        <button
          onClick={() => switchView('wrongbook')}
          className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition-all ${
            state.view === 'wrongbook'
              ? 'border-l-2 border-rose-500 bg-rose-50/80 font-semibold text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
              : 'text-slate-600 hover:bg-slate-100/60 dark:text-slate-300 dark:hover:bg-white/5'
          }`}
        >
          <span>错题本</span>
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-400">
            {state.wrongBook.length}题
          </span>
        </button>

        {state.chapters.map(ch => {
          const stats = getChapterStats(ch);
          const active = state.currentChapter === ch.id && state.view === 'quiz';
          const objCount = ch.questions.filter(q => q.type !== 'subjective').length;

          return (
            <button
              key={ch.id}
              onClick={() => { selectChapter(ch.id); switchView('quiz'); }}
              className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition-all ${
                active
                  ? 'border-l-2 border-emerald-500 bg-emerald-50/80 font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                  : 'text-slate-600 hover:bg-slate-100/60 dark:text-slate-300 dark:hover:bg-white/5'
              }`}
            >
              <span className="truncate">{ch.title}</span>
              {stats.total > 0 ? (
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold text-white ${getBadgeClass(stats.pct) === 'good' ? 'bg-emerald-500' : getBadgeClass(stats.pct) === 'bad' ? 'bg-rose-500' : 'bg-amber-500'}`}>
                  {stats.correct}/{stats.total}
                </span>
              ) : (
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] text-slate-500 dark:bg-slate-700 dark:text-slate-400">{objCount}题</span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
