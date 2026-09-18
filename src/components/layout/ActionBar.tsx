import { RotateCcw, Send } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';
import { gradeQuestions, calcAccuracy, getScoreClass, getScoreEmoji } from '../../utils/grading';

export function ActionBar() {
  const { state, submit, reset, currentChapter } = useQuiz();

  if (!currentChapter && state.view !== 'wrongbook') return null;

  const questions = state.view === 'wrongbook'
    ? state.wrongBook.map(w => w.question)
    : (currentChapter?.questions || []);

  let resultHtml = '';
  if (state.submitted) {
    const results = gradeQuestions(questions, state.answers);
    const acc = calcAccuracy(results);
    resultHtml = `${getScoreEmoji(acc.pct)} 正确率：<span class="text-lg font-extrabold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">${acc.correct}/${acc.total}（${acc.pct}%）</span>`;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-emerald-500/10 bg-white/70 backdrop-blur-xl dark:bg-slate-900/70 lg:left-56">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="text-sm text-slate-600 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: resultHtml }} />
        <div className="flex gap-2">
          {state.submitted ? (
            <button
              onClick={reset}
              className="rounded-lg bg-rose-100 px-5 py-2 text-sm font-semibold text-rose-600 shadow-sm transition-all hover:bg-rose-200 dark:bg-rose-500/10 dark:text-rose-400"
            >
              <RotateCcw className="mr-1 inline h-4 w-4" /> 重置此章
            </button>
          ) : (
            <button
              onClick={submit}
              className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
            >
              <Send className="mr-1 inline h-4 w-4" /> 提交判卷
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
