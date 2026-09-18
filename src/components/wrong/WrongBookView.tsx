import { BookOpen } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';
import { QuestionCard } from '../quiz/QuestionCard';

export function WrongBookView() {
  const { state } = useQuiz();

  if (state.wrongBook.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center pb-24 pt-6">
        <div className="text-center">
          <BookOpen className="mx-auto mb-4 h-16 w-16 text-emerald-400/40" />
          <h2 className="text-xl font-bold text-slate-200">还没有错题</h2>
          <p className="mt-2 text-sm text-slate-400">继续保持，加油！</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-8">
      <h2 className="bg-gradient-to-r from-rose-300 to-orange-300 bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
        错题本
      </h2>
      <p className="mb-6 text-sm text-slate-400">共 {state.wrongBook.length} 道错题，再刷一遍吧</p>
      <div className="space-y-4">
        {state.wrongBook.map((entry, idx) => (
          <QuestionCard
            key={`${entry.chId}-${entry.question.id}`}
            question={entry.question}
            num={idx + 1}
            chId={entry.chId}
            isWrongBook
          />
        ))}
      </div>
    </div>
  );
}
