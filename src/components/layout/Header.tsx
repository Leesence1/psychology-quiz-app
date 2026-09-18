import { BookOpen, Moon, Sun } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';
import { getGlobalStats } from '../../utils/stats';

export function Header() {
  const { state, toggleTheme } = useQuiz();
  const global = getGlobalStats(state.chapters);

  const isDark = state.theme === 'dark';

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-500/15 bg-slate-950/40 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
              <BookOpen className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
          <div>
            <span className="text-lg font-bold tracking-wide text-white">GradQuest</span>
            <span className="ml-2 hidden text-[10px] font-semibold tracking-wider text-emerald-300/60 sm:inline">347 心理学考研刷题</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300/80 backdrop-blur-sm sm:inline-block border border-emerald-500/20">
            累计 {global.correct}/{global.total}（{global.pct}%）
          </span>
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800/60 text-slate-400 transition hover:border-emerald-500/30 hover:text-emerald-300 border border-slate-700/50"
            title="切换主题"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
