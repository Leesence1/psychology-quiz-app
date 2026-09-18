import { useQuiz } from '../../context/QuizContext';
import { getChapterStats } from '../../utils/stats';
import { AlertCircle } from 'lucide-react';

export function Sidebar() {
  const { state, selectChapter, switchView } = useQuiz();

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 flex-shrink-0 overflow-y-auto border-r border-emerald-500/10 bg-slate-900/40 backdrop-blur-xl lg:block">
      <nav className="py-3 px-3 space-y-1">
        <button
          onClick={() => switchView('wrongbook')}
          className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
            state.view === 'wrongbook'
              ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
              : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
          }`}
        >
          <span className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />错题本</span>
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
            {state.wrongBook.length}题
          </span>
        </button>

        {state.chapters.map(ch => {
          const stats = getChapterStats(ch);
          const active = state.currentChapter === ch.id && state.view === 'quiz';
          const objCount = ch.questions.filter(q => q.type !== 'subjective').length;
          const badgeCls = stats.total > 0
            ? stats.pct >= 80 ? 'bg-emerald-500 text-white'
            : stats.pct < 60 ? 'bg-rose-500 text-white'
            : 'bg-amber-500 text-white'
            : 'bg-slate-800 text-slate-400';

          return (
            <button
              key={ch.id}
              onClick={() => { selectChapter(ch.id); switchView('quiz'); }}
              className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm transition-all ${
                active
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <span className="truncate">{ch.title}</span>
              {stats.total > 0 ? (
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${badgeCls}`}>
                  {stats.correct}/{stats.total}
                </span>
              ) : (
                <span className={`rounded-full px-2 py-0.5 text-[11px] ${badgeCls}`}>{objCount}题</span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
