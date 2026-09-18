import { RotateCcw, Send } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';
import { gradeQuestions, calcAccuracy, getScoreEmoji } from '../../utils/grading';

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
    resultHtml = `${getScoreEmoji(acc.pct)} 正确率：<span class="text-lg font-extrabold text-emerald-400">${acc.correct}/${acc.total}（${acc.pct}%）</span>`;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-emerald-500/10 bg-slate-950/60 backdrop-blur-xl lg:left-60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="text-sm text-slate-300" dangerouslySetInnerHTML={{ __html: resultHtml }} />
        <div className="flex gap-2">
          {state.submitted ? (
            <button
              onClick={reset}
              className="flex items-center rounded-xl bg-rose-500/10 px-5 py-2 text-sm font-semibold text-rose-400 shadow-sm transition-all hover:bg-rose-500/20 border border-rose-500/20"
            >
              <RotateCcw className="mr-1 h-4 w-4" /> 重置此章
            </button>
          ) : (
            <button
              onClick={submit}
              className="flex items-center rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-6 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/20 transition-all hover:shadow-lg hover:brightness-110"
            >
              <Send className="mr-1 h-4 w-4" /> 提交判卷
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
