import { useEffect } from 'react';
import { useQuiz } from './context/QuizContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ActionBar } from './components/layout/ActionBar';
import { QuizView } from './components/quiz/QuizView';
import { WrongBookView } from './components/wrong/WrongBookView';
import type { Chapter } from './types';

function AppContent() {
  const { state, dispatch, currentChapter, addWrong, submit } = useQuiz();

  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: true });
    fetch('/questions.json')
      .then(r => { if (!r.ok) throw new Error('Failed to load'); return r.json(); })
      .then((data: Chapter[]) => {
        dispatch({ type: 'SET_DATA', payload: data });
        dispatch({ type: 'SET_LOADING', payload: false });
        // Auto-select first chapter
        if (data.length > 0) dispatch({ type: 'SET_CHAPTER', payload: data[0].id });
      })
      .catch(err => {
        dispatch({ type: 'SET_ERROR', payload: `加载题目失败: ${err}` });
        dispatch({ type: 'SET_LOADING', payload: false });
      });
  }, []);

  // Save wrong answers on submit
  useEffect(() => {
    if (!state.submitted || !currentChapter) return;
    const wrongIds: number[] = [];
    currentChapter.questions.forEach(q => {
      if (q.type === 'subjective') return;
      const userAns = state.answers[q.id];
      let correct = false;
      if (q.type === 'single') correct = userAns === q.answer;
      else if (q.type === 'multi') {
        const u = Array.isArray(userAns) ? [...userAns].sort().join(',') : '';
        const a = [...(q.answer as number[])].sort().join(',');
        correct = u === a;
      }
      if (!correct) wrongIds.push(q.id);
    });
    if (wrongIds.length > 0) {
      const entries = wrongIds.map(qId => {
        const q = currentChapter.questions.find(x => x.id === qId)!;
        return { chId: currentChapter.id, chTitle: currentChapter.title, question: q };
      });
      addWrong(entries);
    }
  }, [state.submitted, currentChapter]);

  if (state.loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50 dark:from-slate-950 dark:to-emerald-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-500" />
          <p className="text-sm text-slate-500 dark:text-slate-400">加载题库中...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50 dark:from-slate-950 dark:to-emerald-950">
        <div className="rounded-xl border border-rose-200 bg-white px-8 py-12 text-center shadow-lg dark:border-rose-500/20 dark:bg-slate-900">
          <p className="text-rose-600 dark:text-rose-400">{state.error}</p>
          <p className="mt-2 text-sm text-slate-500">请确认已通过 python server.py 启动服务</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950">
      <Header />
      <div className="mx-auto flex max-w-7xl">
        <Sidebar />
        {state.view === 'wrongbook' ? <WrongBookView /> : <QuizView />}
      </div>
      <ActionBar />

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
