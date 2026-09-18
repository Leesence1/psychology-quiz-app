import { BookOpen, Moon, Sun, BarChart3 } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';
import { getGlobalStats, getBadgeClass } from '../../utils/stats';
import type { Theme } from '../../types';

export function Header() {
  const { state, toggleTheme } = useQuiz();
  const global = getGlobalStats(state.chapters);

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-500/10 bg-gradient-to-r from-slate-900/80 via-emerald-950/60 to-slate-900/80 backdrop-blur-xl dark:from-slate-950/90 dark:via-emerald-950/70 dark:to-slate-950/90">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-emerald-400" />
          <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">GradQuest</h1>
          <span className="ml-2 hidden text-xs text-white/60 sm:inline-block">347 心理学考研刷题</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm">
            累计 {global.correct}/{global.total}（{global.pct}%）
          </span>
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20"
            title="切换主题"
          >
            {state.theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
