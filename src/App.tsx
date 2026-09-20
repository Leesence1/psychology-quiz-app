import React, { useState, useEffect } from 'react';
import {
  BookOpen, CheckCircle, XCircle, Clock, Award, Layers,
  LayoutDashboard, AlertCircle, Volume2, VolumeX,
  Play, Pause, HelpCircle, Sparkles,
  Target, TrendingUp, ArrowRight,
  Bookmark, BookmarkCheck, ChevronRight, ChevronLeft, RotateCcw,
  GraduationCap, Brain, Eye, Languages, ScrollText, FileText, Zap,
  BarChart2, Flame
} from 'lucide-react';
import { useQuiz } from './context/QuizContext';
import { getGlobalStats, getChapterStats } from './utils/stats';
import type { Chapter } from './types';

// ---- Subject icon mapping ----
const subjectIconMap: Record<string, React.ElementType> = {
  ch3: Brain, ch4: Eye, ch5: Eye, ch6: BookOpen,
  ch6_perception: Eye, ch7_imagination: Sparkles,
  ch9: Zap, ch10_language: Languages,
  past_exams: ScrollText, english_daily: FileText,
};

const subjectAccentMap: Record<string, string> = {
  ch3: 'text-blue-400', ch4: 'text-cyan-400', ch5: 'text-teal-400', ch6: 'text-indigo-400',
  ch6_perception: 'text-violet-400', ch7_imagination: 'text-pink-400',
  ch9: 'text-amber-400', ch10_language: 'text-sky-400',
  past_exams: 'text-slate-400', english_daily: 'text-blue-400',
};

const subjectBorderMap: Record<string, string> = {
  ch3: 'border-blue-500/20', ch4: 'border-cyan-500/20', ch5: 'border-teal-500/20', ch6: 'border-indigo-500/20',
  ch6_perception: 'border-violet-500/20', ch7_imagination: 'border-pink-500/20',
  ch9: 'border-amber-500/20', ch10_language: 'border-sky-500/20',
  past_exams: 'border-slate-500/20', english_daily: 'border-blue-500/20',
};

function getSubjectSub(ch: Chapter): string {
  return ch.title.replace(/^第[一二三四五六七八九十\d]+章\s*/, '');
}

export default function App() {
  const { state, dispatch, currentChapter, setAnswer, submit, selectChapter, addWrong, switchView } = useQuiz();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRecitationMode, setIsRecitationMode] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<unknown>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [showTimerOverlay, setShowTimerOverlay] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [flashcardMode, setFlashcardMode] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: true });
    fetch('/questions.json')
      .then(r => { if (!r.ok) throw new Error('Failed to load'); return r.json(); })
      .then((data: Chapter[]) => {
        dispatch({ type: 'SET_DATA', payload: data });
        dispatch({ type: 'SET_LOADING', payload: false });
      })
      .catch(err => {
        dispatch({ type: 'SET_ERROR', payload: `加载题目失败: ${err}` });
        dispatch({ type: 'SET_LOADING', payload: false });
      });
  }, []);

  useEffect(() => {
    if (!isAnswerSubmitted || !currentChapter) return;
    const ch = currentChapter;
    const questions = ch.questions.filter(q => q.type !== 'subjective');
    const q = questions[currentQuestionIndex];
    if (!q) return;
    const userAns = state.answers[q.id];
    let correct = false;
    if (q.type === 'single') correct = userAns === q.answer;
    else if (q.type === 'multi') {
      const u = Array.isArray(userAns) ? [...userAns].sort().join(',') : '';
      const a = [...(q.answer as number[])].sort().join(',');
      correct = u === a;
    }
    if (!correct) addWrong([{ chId: ch.id, chTitle: ch.title, question: q }]);
  }, [isAnswerSubmitted, currentQuestionIndex, currentChapter]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning && timerSeconds > 0) interval = setInterval(() => setTimerSeconds(p => p - 1), 1000);
    else if (timerSeconds === 0) { setIsTimerRunning(false); alert('番茄钟结束！休息 5 分钟再继续吧。'); }
    return () => { if (interval) clearInterval(interval); };
  }, [isTimerRunning, timerSeconds]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60), s = secs % 60;
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  };

  const getQuestions = () => {
    if (!currentChapter) return [];
    return currentChapter.questions.filter(q => q.type !== 'subjective').map(q => ({
      id: q.id, type: q.type, q: q.q,
      options: q.options?.map((o, j) => ({ id: ['A','B','C','D'][j], text: o })),
      answer: q.type === 'single' ? ['A','B','C','D'][q.answer as number] : (q.answer as number[]).map(j => ['A','B','C','D'][j]),
      explanation: q.explain, chId: currentChapter.id
    }));
  };

  const questions = getQuestions();
  const currentQ = questions[currentQuestionIndex];
  const global = getGlobalStats(state.chapters);

  const handleOptionSelect = (optId: string) => {
    if (isAnswerSubmitted && !isRecitationMode) return;
    setSelectedAnswer(optId);
    if (currentQ) setAnswer(currentQ.id, ['A','B','C','D'].indexOf(optId));
  };
  const handleSubmitAnswer = () => { if (!selectedAnswer) return; setIsAnswerSubmitted(true); setShowExplanation(true); submit(); };
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(p => p + 1); setSelectedAnswer(state.answers[questions[currentQuestionIndex + 1]?.id] ?? null);
      setIsAnswerSubmitted(false); setShowExplanation(isRecitationMode);
    }
  };
  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(p => p - 1); setSelectedAnswer(state.answers[questions[currentQuestionIndex - 1]?.id] ?? null);
      setIsAnswerSubmitted(false); setShowExplanation(isRecitationMode);
    }
  };
  const toggleBookmark = (id: number) => setBookmarkedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const goToChapter = (chId: string) => {
    selectChapter(chId); setActiveTab('quiz'); setCurrentQuestionIndex(0);
    setSelectedAnswer(null); setIsAnswerSubmitted(false); setShowExplanation(isRecitationMode);
  };

  useEffect(() => {
    if (activeTab !== 'quiz' || !currentQ) return;
    const handler = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (['a','b','c','d'].includes(k) && !isAnswerSubmitted && !isRecitationMode) { e.preventDefault(); handleOptionSelect(k.toUpperCase()); }
      else if (k === 'enter' && selectedAnswer && !isAnswerSubmitted) { e.preventDefault(); handleSubmitAnswer(); }
      else if (k === 'arrowright') { e.preventDefault(); handleNext(); }
      else if (k === 'arrowleft') { e.preventDefault(); handlePrev(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeTab, currentQ, selectedAnswer, isAnswerSubmitted, currentQuestionIndex, questions.length, isRecitationMode]);

  if (state.loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0c1222]">
      <div className="text-center"><div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-blue-500/20 border-t-blue-400"/><p className="text-sm text-slate-500">加载题库中...</p></div>
    </div>
  );
  if (state.error) return (
    <div className="flex h-screen items-center justify-center bg-[#0c1222]">
      <div className="rounded-xl border border-rose-500/20 bg-[#162032] px-8 py-10 text-center"><p className="text-rose-400 text-sm">{state.error}</p></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0c1222] text-slate-100 font-sans antialiased selection:bg-blue-500 selection:text-white relative overflow-x-hidden">
      {/* Grid background */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage:'linear-gradient(rgba(148,163,184,1) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,1) 1px,transparent 1px)', backgroundSize:'64px 64px' }}/>

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-[#0c1222]/80 backdrop-blur-md border-b border-slate-800/50 px-8 md:px-12 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><GraduationCap className="w-5 h-5 text-blue-400"/></div>
            <div><span className="font-bold text-[18px] tracking-tight text-white">GradQuest</span><p className="text-[11px] text-slate-500 mt-0.5">347 心理学考研</p></div>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2"><Target className="w-4 h-4 text-blue-400"/><span className="text-xs text-slate-500">正确率</span><span className="text-sm font-semibold tabular-nums text-white">{global.pct}%</span></div>
            <button onClick={() => setShowTimerOverlay(!showTimerOverlay)} className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#162032] border border-slate-700/50 text-xs text-slate-400"><Clock className="w-4 h-4"/><span className="tabular-nums">{formatTime(timerSeconds)}</span></button>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 rounded-lg bg-[#162032] border border-slate-700/50 text-slate-500">{soundEnabled ? <Volume2 className="w-4 h-4 text-blue-400"/> : <VolumeX className="w-4 h-4"/>}</button>
            <div className="h-6 w-px bg-slate-800 hidden sm:block"/>
            <div className="flex items-center space-x-2 pl-1">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">K</div>
              <div className="hidden lg:block"><div className="text-xs font-medium text-slate-300">考研人</div><div className="text-[10px] text-slate-500 tabular-nums">{global.correct}/{global.total}</div></div>
            </div>
          </div>
        </div>
      </header>

      {/* Timer Overlay */}
      {showTimerOverlay && (
        <div className="fixed inset-x-0 top-16 z-30 flex justify-center px-4">
          <div className="bg-[#162032] border border-slate-700/50 rounded-xl p-5 shadow-xl max-w-sm w-full flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400"><Clock className="w-5 h-5"/></div>
              <div><div className="text-sm font-medium text-slate-200">专注计时</div><div className="text-xl font-mono font-bold text-blue-400 tabular-nums">{formatTime(timerSeconds)}</div></div>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-400 transition-all flex items-center space-x-1 text-xs">{isTimerRunning ? <Pause className="w-3.5 h-3.5"/> : <Play className="w-3.5 h-3.5 fill-white"/>}<span>{isTimerRunning ? '暂停' : '开始'}</span></button>
              <button onClick={() => { setIsTimerRunning(false); setTimerSeconds(25*60); }} className="p-2 rounded-lg bg-slate-800 text-slate-400"><RotateCcw className="w-4 h-4"/></button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MAIN LAYOUT ===== */}
      <div className="max-w-[1600px] mx-auto px-8 md:px-12 py-10 flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <nav className="bg-[#162032] border border-slate-800/50 rounded-xl p-3 sticky top-24 space-y-1">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-all ${activeTab === 'dashboard' ? 'bg-blue-500/10 text-blue-300' : 'text-slate-400 hover:bg-slate-800/50'}`}><LayoutDashboard className="w-4 h-4"/><span>仪表盘</span></button>
            <button onClick={() => { if (state.chapters.length > 0) goToChapter(state.chapters[0].id); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-all ${activeTab === 'quiz' ? 'bg-blue-500/10 text-blue-300' : 'text-slate-400 hover:bg-slate-800/50'}`}><BookOpen className="w-4 h-4"/><span>刷题</span></button>
            <button onClick={() => setActiveTab('wrong')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-all ${activeTab === 'wrong' ? 'bg-blue-500/10 text-blue-300' : 'text-slate-400 hover:bg-slate-800/50'}`}><AlertCircle className="w-4 h-4"/><span>错题本</span>{state.wrongBook.length > 0 && <span className="ml-auto text-xs bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">{state.wrongBook.length}</span>}</button>
          </nav>
        </aside>

        <main className="flex-1 min-w-0">

          {/* ========== DASHBOARD ========== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Hero */}
              <div className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/15 rounded-2xl p-10 md:p-12">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                  <div className="space-y-4">
                    <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium"><Flame className="w-3.5 h-3.5"/><span>今日状态极佳</span></div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">保持专注，上岸在即</h1>
                    <p className="text-base text-slate-400">已完成 <span className="text-blue-400 font-semibold">{global.correct}</span> 道练习题，准确率 <span className="text-blue-400 font-semibold">{global.pct}%</span></p>
                  </div>
                  <button onClick={() => { if (state.chapters.length > 0) goToChapter(state.chapters[0].id); }} className="px-8 py-4 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center space-x-2 text-sm shrink-0 self-start lg:self-auto">
                    <Play className="w-5 h-5 fill-white"/><span>开始刷题</span>
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-[#162032] border border-slate-800/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4"><p className="text-sm text-slate-500">今日刷题</p><BookOpen className="w-5 h-5 text-blue-400"/></div>
                  <p className="text-3xl font-bold tabular-nums text-white">{global.correct} <span className="text-base font-normal text-slate-500">/ {global.total}</span></p>
                  <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full transition-all" style={{width:`${global.pct}%`}}/></div>
                </div>
                <div className="bg-[#162032] border border-slate-800/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4"><p className="text-sm text-slate-500">正确率</p><BarChart2 className="w-5 h-5 text-blue-400"/></div>
                  <p className="text-3xl font-bold tabular-nums text-blue-400">{global.pct}%</p>
                  <div className="mt-4 flex items-center space-x-1 text-xs text-slate-500"><TrendingUp className="w-3.5 h-3.5"/><span>持续进步</span></div>
                </div>
                <div className="bg-[#162032] border border-slate-800/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4"><p className="text-sm text-slate-500">待复盘错题</p><AlertCircle className="w-5 h-5 text-amber-400"/></div>
                  <p className="text-3xl font-bold tabular-nums text-white">{state.wrongBook.length} <span className="text-base font-normal text-slate-500">道</span></p>
                  <p className="mt-4 text-xs text-slate-500">定期完成二刷</p>
                </div>
                <div className="bg-[#162032] border border-slate-800/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4"><p className="text-sm text-slate-500">章节总数</p><Award className="w-5 h-5 text-blue-400"/></div>
                  <p className="text-3xl font-bold tabular-nums text-white">{state.chapters.length} <span className="text-base font-normal text-slate-500">章</span></p>
                  <p className="mt-4 text-xs text-slate-500">覆盖全部考点</p>
                </div>
              </div>

              {/* Chapter Cards */}
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-200">科目进度</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {state.chapters.map(ch => {
                    const stats = getChapterStats(ch);
                    const sub = getSubjectSub(ch);
                    const total = ch.questions.length;
                    const Icon = subjectIconMap[ch.id] || BookOpen;
                    const accent = subjectAccentMap[ch.id] || 'text-blue-400';
                    const border = subjectBorderMap[ch.id] || 'border-blue-500/20';
                    return (
                      <div key={ch.id} onClick={() => goToChapter(ch.id)} className="group bg-[#162032] border border-slate-800/50 hover:border-slate-700 rounded-xl p-7 transition-all cursor-pointer">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-xl ${border} bg-slate-800/50 flex items-center justify-center shrink-0`}><Icon className={`w-6 h-6 ${accent}`}/></div>
                            <div><h3 className="text-lg font-semibold text-slate-100">{ch.title}</h3><p className="text-sm text-slate-500 mt-1">{sub}</p></div>
                          </div>
                          <span className={`text-base font-semibold tabular-nums ${accent}`}>{stats.pct}%</span>
                        </div>
                        <div className="mt-6 space-y-3">
                          <div className="flex justify-between text-sm text-slate-500"><span>进度</span><span className="text-slate-300 tabular-nums">{stats.correct} / {total} 题</span></div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full transition-all" style={{width:`${stats.pct}%`}}/></div>
                        </div>
                        <div className="mt-5 pt-4 border-t border-slate-800/50 flex items-center justify-between text-sm">
                          <span className="text-slate-500">共 {total} 题</span>
                          <span className="text-blue-400 flex items-center space-x-1 group-hover:translate-x-1 transition-transform"><span>进入题库</span><ArrowRight className="w-4 h-4"/></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========== QUIZ ========== */}
          {activeTab === 'quiz' && currentQ && (
            <div className="space-y-6">
              <div className="bg-[#162032] border border-slate-800/50 rounded-xl p-5 flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-300">{currentChapter?.title}</span>
                <div className="flex items-center space-x-1 bg-slate-800/50 p-0.5 rounded-lg">
                  <button onClick={() => { setIsRecitationMode(false); setShowExplanation(isAnswerSubmitted); }} className={`px-4 py-1.5 rounded-md text-xs transition-all ${!isRecitationMode ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}>做题</button>
                  <button onClick={() => { setIsRecitationMode(true); setShowExplanation(true); }} className={`px-4 py-1.5 rounded-md text-xs transition-all flex items-center space-x-1 ${isRecitationMode ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}><Sparkles className="w-3 h-3"/><span>背诵</span></button>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => toggleBookmark(currentQ.id)} className={`p-2 rounded-lg transition-all ${bookmarkedIds.includes(currentQ.id) ? 'text-blue-400 bg-blue-500/10' : 'text-slate-500 hover:text-slate-300'}`}>{bookmarkedIds.includes(currentQ.id) ? <BookmarkCheck className="w-4 h-4"/> : <Bookmark className="w-4 h-4"/>}</button>
                  <span className="text-xs text-slate-500 tabular-nums px-1">{currentQuestionIndex + 1} / {questions.length}</span>
                </div>
              </div>

              <div className="bg-[#162032] border border-slate-800/50 rounded-2xl p-8 md:p-10 space-y-7">
                <span className="inline-block text-xs font-medium text-slate-500 bg-slate-800 px-3 py-1.5 rounded-lg">{currentQ.type === 'single' ? '单选题' : '多选题'}</span>
                <p className="text-xl text-slate-100 leading-relaxed">{currentQ.q}</p>

                <div className="space-y-3 pt-2">
                  {currentQ.options?.map((opt) => {
                    const isSelected = selectedAnswer === opt.id;
                    const isCorrect = opt.id === currentQ.answer;
                    let cardStyle = "bg-slate-800/30 border-slate-700/30 text-slate-300 hover:border-slate-600";
                    if (isRecitationMode && isCorrect) cardStyle = "bg-blue-500/10 border-blue-500/30 text-blue-200";
                    else if (isAnswerSubmitted && isCorrect) cardStyle = "bg-green-500/10 border-green-500/30 text-green-200";
                    else if (isAnswerSubmitted && isSelected && !isCorrect) cardStyle = "bg-rose-500/10 border-rose-500/30 text-rose-200";
                    else if (isSelected) cardStyle = "bg-blue-500/10 border-blue-500/30 text-blue-200";
                    return (
                      <button key={opt.id} onClick={() => handleOptionSelect(opt.id)} className={`w-full text-left p-5 rounded-xl border transition-all flex items-center justify-between group ${cardStyle}`}>
                        <div className="flex items-start space-x-4">
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-sm shrink-0 transition-colors ${isSelected || (isRecitationMode && isCorrect) ? 'bg-blue-400 text-[#0c1222]' : 'bg-slate-800 text-slate-500 group-hover:text-slate-300'}`}>{opt.id}</span>
                          <span className="text-[15px] md:text-base pt-1">{opt.text}</span>
                        </div>
                        {isAnswerSubmitted && !isRecitationMode && (isCorrect ? <CheckCircle className="w-5 h-5 text-green-400 shrink-0"/> : isSelected ? <XCircle className="w-5 h-5 text-rose-400 shrink-0"/> : null)}
                      </button>
                    );
                  })}
                </div>

                {!isRecitationMode && !isAnswerSubmitted && (
                  <div className="pt-3 flex justify-end">
                    <button onClick={handleSubmitAnswer} disabled={!selectedAnswer} className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all ${selectedAnswer ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>提交答案</button>
                  </div>
                )}

                {showExplanation && currentQ.explanation && (
                  <div className="mt-8 pt-7 border-t border-slate-800/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-blue-300 font-medium text-sm"><HelpCircle className="w-4 h-4"/><span>解析</span></div>
                      <span className="text-xs text-slate-500">答案：<span className="text-blue-400 font-semibold">{currentQ.answer}</span></span>
                    </div>
                    <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-5 text-[15px] text-slate-300 leading-relaxed"><p>{currentQ.explanation}</p></div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button onClick={handlePrev} disabled={currentQuestionIndex === 0} className={`px-5 py-2.5 rounded-lg border text-sm transition-all flex items-center space-x-1.5 ${currentQuestionIndex > 0 ? 'bg-[#162032] border-slate-700/50 text-slate-300 hover:border-slate-600' : 'bg-slate-800/30 border-slate-800/50 text-slate-600 cursor-not-allowed'}`}><ChevronLeft className="w-4 h-4"/><span>上一题</span></button>
                <button onClick={handleNext} disabled={currentQuestionIndex === questions.length - 1} className={`px-5 py-2.5 rounded-lg border text-sm transition-all flex items-center space-x-1.5 ${currentQuestionIndex < questions.length - 1 ? 'bg-blue-500/10 border-blue-500/20 text-blue-300 hover:bg-blue-500/20' : 'bg-slate-800/30 border-slate-800/50 text-slate-600 cursor-not-allowed'}`}><span>下一题</span><ChevronRight className="w-4 h-4"/></button>
              </div>
            </div>
          )}

          {/* ========== WRONG BOOK ========== */}
          {activeTab === 'wrong' && (
            <div className="space-y-6">
              <div className="bg-[#162032] border border-slate-800/50 rounded-xl p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div><h1 className="text-2xl font-bold text-white">错题本</h1><p className="text-sm text-slate-500 mt-2">共 {state.wrongBook.length} 道错题，建议定期二刷</p></div>
                <div className="flex items-center space-x-1 bg-slate-800/50 p-0.5 rounded-lg">
                  <button onClick={() => setFlashcardMode(false)} className={`px-4 py-2 rounded-md text-sm transition-all ${!flashcardMode ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}>列表</button>
                  <button onClick={() => setFlashcardMode(true)} className={`px-4 py-2 rounded-md text-sm transition-all ${flashcardMode ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}>抽卡</button>
                </div>
              </div>

              {!flashcardMode ? (
                <div className="space-y-5">
                  {state.wrongBook.map((item) => {
                    const letters = ['A','B','C','D'];
                    return (
                      <div key={`${item.chId}-${item.question.id}`} className="bg-[#162032] border border-slate-800/50 rounded-xl p-7 space-y-5">
                        <span className="inline-block text-xs font-medium text-slate-500 bg-slate-800 px-2.5 py-1 rounded">{item.chTitle}</span>
                        <p className="text-[17px] text-slate-200 leading-relaxed">{item.question.q}</p>
                        {item.question.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            {item.question.options.map((opt, i) => {
                              const isCorrect = item.question.type === 'single' ? i === item.question.answer : (item.question.answer as number[])?.includes(i);
                              return <div key={i} className={`p-4 rounded-lg border ${isCorrect ? 'bg-green-500/10 border-green-500/20 text-green-300' : 'bg-slate-800/30 border-slate-700/30 text-slate-400'}`}>{letters[i]}. {opt}</div>;
                            })}
                          </div>
                        )}
                        {item.question.explain && <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-4 text-sm text-slate-400"><span className="text-slate-500">解析：</span><span className="text-slate-300">{item.question.explain}</span></div>}
                        <div className="flex justify-end pt-2"><button onClick={() => { setActiveTab('quiz'); goToChapter(item.chId); }} className="px-5 py-2.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 text-sm transition-all">重做此题</button></div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {state.wrongBook.map((item) => {
                    const isFlipped = flippedCards[item.question.id];
                    return (
                      <div key={`${item.chId}-${item.question.id}`} onClick={() => setFlippedCards(p => ({...p, [item.question.id]: !p[item.question.id]}))} className="h-72 cursor-pointer group">
                        <div className={`relative w-full h-full bg-[#162032] border rounded-xl p-7 shadow-lg flex flex-col justify-between transition-all group-hover:border-slate-700 ${isFlipped ? 'border-blue-500/30 bg-blue-500/5' : 'border-slate-800/50'}`}>
                          <div className="flex items-center justify-between text-xs text-slate-500"><span className="text-blue-400 font-medium">{item.chTitle}</span><span className="bg-slate-800 px-2.5 py-1 rounded">{isFlipped ? '背面' : '正面'}</span></div>
                          <div className="my-auto text-[17px] text-slate-100 text-center leading-relaxed">
                            {!isFlipped ? item.question.q : (
                              <div className="space-y-4"><p className="text-blue-400 font-semibold text-xl">答案：{item.question.type === 'single' ? ['A','B','C','D'][item.question.answer as number] : (item.question.answer as number[]).map(i => ['A','B','C','D'][i]).join(', ')}</p><p className="text-sm text-slate-400">{item.question.explain}</p></div>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 text-center">点击翻转</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
