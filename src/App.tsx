import React, { useState, useEffect } from 'react';
import {
  BookOpen, CheckCircle, XCircle, Clock, Award, Flame, Brain, Sparkles,
  Bookmark, BookmarkCheck, RotateCcw, ChevronRight, ChevronLeft, BarChart2,
  LayoutDashboard, FileText, AlertCircle, Layers, Maximize2, Volume2, VolumeX,
  Play, Pause, Search, Filter, Check, HelpCircle, Lightbulb, MessageSquare,
  Zap, Target, Sun, Moon, TrendingUp, BookMarked, ArrowRight, Eye, EyeOff
} from 'lucide-react';
import { useQuiz } from './context/QuizContext';
import { getGlobalStats, getChapterStats } from './utils/stats';
import type { Chapter } from './types';

// ---- Icon map for subjects ----
const subjectIcons: Record<string, string> = {
  ch3: '🧠', ch4: '👁️', ch5: '👂', ch6: '📝',
  ch6_perception: '🔍', ch7_imagination: '💭', ch9: '⚡', ch10_language: '🗣️',
  past_exams: '📜', english_daily: '📖'
};
const subjectColors: Record<string, string> = {
  ch3: 'from-emerald-500/20 to-teal-600/20', ch4: 'from-teal-500/20 to-cyan-600/20',
  ch5: 'from-green-500/20 to-emerald-600/20', ch6: 'from-blue-500/20 to-indigo-600/20',
  ch6_perception: 'from-violet-500/20 to-purple-600/20', ch7_imagination: 'from-pink-500/20 to-rose-600/20',
  ch9: 'from-amber-500/20 to-orange-600/20', ch10_language: 'from-sky-500/20 to-blue-600/20',
  past_exams: 'from-slate-500/20 to-gray-600/20', english_daily: 'from-indigo-500/20 to-blue-600/20'
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

  // Load data
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

  // Save wrong answers
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
    if (!correct) {
      addWrong([{ chId: ch.id, chTitle: ch.title, question: q }]);
    }
  }, [isAnswerSubmitted, currentQuestionIndex, currentChapter]);

  // Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds(prev => prev - 1), 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
      // Timer finished: show notification
      alert('🍅 番茄钟结束！休息 5 分钟再继续吧。');
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isTimerRunning, timerSeconds]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getQuestions = (): { id: number; type: string; q: string; options?: { id: string; text: string }[]; answer: string | string[]; explanation?: string; keyPoints?: string[]; mnemonic?: string; difficulty?: string; tags?: string[]; chId: string }[] => {
    if (!currentChapter) return [];
    return currentChapter.questions.filter(q => q.type !== 'subjective').map((q, i) => ({
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

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;
    setIsAnswerSubmitted(true);
    setShowExplanation(true);
    submit();
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(state.answers[questions[currentQuestionIndex + 1]?.id] ?? null);
      setIsAnswerSubmitted(false);
      setShowExplanation(isRecitationMode);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(state.answers[questions[currentQuestionIndex - 1]?.id] ?? null);
      setIsAnswerSubmitted(false);
      setShowExplanation(isRecitationMode);
    }
  };

  const toggleBookmark = (id: number) => {
    setBookmarkedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const goToChapter = (chId: string) => {
    selectChapter(chId);
    setActiveTab('quiz');
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setShowExplanation(isRecitationMode);
  };

  // Keyboard shortcuts: A-D select, Enter submit, ← → navigate
  useEffect(() => {
    if (activeTab !== 'quiz' || !currentQ) return;
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['a','b','c','d'].includes(key) && !isAnswerSubmitted && !isRecitationMode) {
        e.preventDefault();
        handleOptionSelect(key.toUpperCase());
      } else if (key === 'enter' && selectedAnswer && !isAnswerSubmitted) {
        e.preventDefault();
        handleSubmitAnswer();
      } else if (key === 'arrowright' && currentQuestionIndex < questions.length - 1) {
        e.preventDefault();
        handleNextQuestion();
      } else if (key === 'arrowleft' && currentQuestionIndex > 0) {
        e.preventDefault();
        handlePrevQuestion();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeTab, currentQ, selectedAnswer, isAnswerSubmitted, currentQuestionIndex, questions.length, isRecitationMode]);

  if (state.loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950">
        <div className="text-center"><div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-400" /><p className="text-sm text-emerald-300/60">加载题库中...</p></div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950">
        <div className="rounded-2xl border border-rose-500/20 bg-slate-900/60 px-8 py-12 text-center shadow-2xl backdrop-blur-xl"><p className="text-rose-400">{state.error}</p></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white relative overflow-x-hidden">
      {/* Background Soft Ambient Light Blobs */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-1/3 -right-40 w-[500px] h-[500px] bg-teal-400/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed -bottom-40 left-1/3 w-96 h-96 bg-cyan-500/15 rounded-full blur-[130px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/40 border-b border-emerald-500/15 px-6 md:px-10 py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center"><Brain className="w-5 h-5 text-emerald-400" /></div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-wide bg-gradient-to-r from-emerald-200 via-teal-100 to-white bg-clip-text text-transparent">GradQuest</span>
                <span className="text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">PRO 备考</span>
              </div>
              <p className="text-[11px] text-emerald-300/60 hidden sm:block">考研刷题与知识图谱一体化</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-900/30 border border-emerald-500/20 backdrop-blur-md">
              <Target className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-emerald-200">累计正确率:</span>
              <span className="text-xs font-bold text-emerald-400">{global.pct}%</span>
            </div>
            <button onClick={() => setShowTimerOverlay(!showTimerOverlay)} className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/40 text-xs text-slate-300 hover:text-emerald-300 transition-all">
              <Clock className="w-4 h-4 text-emerald-400" /><span>专注时钟: {formatTime(timerSeconds)}</span>
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/30 text-slate-400 hover:text-emerald-300 transition-all" title={soundEnabled ? "关闭白噪音" : "开启专注白噪音"}>
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <div className="h-8 w-px bg-slate-800/80 mx-1 hidden sm:block" />
            <div className="flex items-center space-x-2 pl-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 p-0.5 flex items-center justify-center text-xs font-bold text-slate-950">U</div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-medium text-slate-200">347 心理学考研</div>
                <div className="text-[10px] text-emerald-400">累计 {global.correct}/{global.total} 题</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Timer Overlay */}
      {showTimerOverlay && (
        <div className="fixed inset-x-0 top-16 z-30 flex justify-center px-4">
          <div className="backdrop-blur-2xl bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 shadow-2xl shadow-emerald-950/80 max-w-md w-full flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400"><Clock className="w-6 h-6 animate-pulse" /></div>
              <div><div className="text-sm font-semibold text-slate-200">番茄专注计时器</div><div className="text-2xl font-mono font-bold text-emerald-400 tracking-wider">{formatTime(timerSeconds)}</div></div>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 transition-all flex items-center space-x-1 shadow-lg shadow-emerald-500/20 text-xs">
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isTimerRunning ? '暂停' : '开始'}</span>
              </button>
              <button onClick={() => { setIsTimerRunning(false); setTimerSeconds(25 * 60); }} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200" title="重置"><RotateCcw className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-8 flex flex-col md:flex-row gap-8">
        {/* Left Sidebar */}
        <aside className="w-full md:w-72 shrink-0">
          <div className="backdrop-blur-xl bg-slate-900/40 border border-emerald-500/15 rounded-[20px] p-5 sticky top-20 shadow-xl shadow-slate-950/50 space-y-2">
            <div className="px-4 py-3 text-[11px] font-semibold text-emerald-300/50 uppercase tracking-widest">备考空间</div>
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center space-x-3.5 px-5 py-3.5 rounded-[14px] text-[15px] font-medium transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}>
              <LayoutDashboard className="w-5 h-5" /><span>学习仪表盘</span>
            </button>
            <button onClick={() => { if (state.chapters.length > 0) goToChapter(state.chapters[0].id); }} className={`w-full flex items-center space-x-3.5 px-5 py-3.5 rounded-[14px] text-[15px] font-medium transition-all duration-200 ${activeTab === 'quiz' ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}>
              <BookOpen className="w-5 h-5" /><span>真题 / 模拟刷题</span>
              <span className="ml-auto text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">热练</span>
            </button>
            <button onClick={() => setActiveTab('wrong')} className={`w-full flex items-center space-x-3.5 px-5 py-3.5 rounded-[14px] text-[15px] font-medium transition-all duration-200 ${activeTab === 'wrong' ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}>
              <AlertCircle className="w-5 h-5" /><span>错题复盘本</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">{state.wrongBook.length}</span>
            </button>
            <div className="pt-5 border-t border-slate-800/80 px-4 py-3 text-[11px] font-semibold text-emerald-300/50 uppercase tracking-widest">智能学伴</div>
            <div className="p-5 rounded-[16px] bg-gradient-to-br from-emerald-900/30 via-slate-900/50 to-slate-900/80 border border-emerald-500/20 backdrop-blur-md space-y-3">
              <div className="flex items-center space-x-2.5 text-sm font-semibold text-emerald-300"><Sparkles className="w-5 h-5 text-emerald-400" /><span>AI 备考解疑助手</span></div>
              <p className="text-xs text-slate-400 leading-relaxed">随时在做题页面选中疑难提问，AI 助教为您深度拆解题目切入点。</p>
              <button className="w-full mt-3 py-2.5 px-4 rounded-[12px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-sm font-medium transition-all flex items-center justify-center space-x-1.5"><MessageSquare className="w-4 h-4" /><span>发起提问</span></button>
            </div>
            <div className="p-4 rounded-[12px] bg-slate-900/30 border border-slate-800 text-xs text-slate-400 italic leading-relaxed">"千淘万漉虽辛苦，吹尽狂沙始到金。"</div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* ================= DASHBOARD ================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-r from-emerald-900/40 via-teal-900/20 to-slate-900/60 border border-emerald-500/20 rounded-[24px] p-8 md:p-10 shadow-2xl shadow-emerald-950/40">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="space-y-3 max-w-xl">
                    <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
                      <Flame className="w-4 h-4 text-emerald-400" /><span>今日刷题状态极佳 · 目标进度 {global.pct}%</span>
                    </div>
                    <h1 className="text-[28px] md:text-[34px] font-bold text-white tracking-tight leading-snug">保持专注，上岸在即 </h1>
                    <p className="text-sm text-slate-300 leading-relaxed">已完成 <span className="text-emerald-400 font-semibold">{global.correct}</span> 道练习题，准确率 <span className="text-emerald-400 font-semibold">{global.pct}%</span>。</p>
                  </div>
                  <button onClick={() => { if (state.chapters.length > 0) goToChapter(state.chapters[0].id); }} className="px-7 py-4 rounded-[16px] bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 flex items-center space-x-2 text-sm">
                    <Play className="w-4 h-4 fill-slate-950" /><span>开始刷题</span>
                  </button>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="backdrop-blur-md bg-slate-900/40 border border-emerald-500/15 rounded-[18px] p-5 shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-3"><span>今日刷题</span><BookOpen className="w-5 h-5 text-emerald-400" /></div>
                  <div className="text-3xl font-bold text-white">{global.correct} <span className="text-sm font-normal text-slate-400">/ {global.total} 题</span></div>
                  <div className="mt-3 w-full bg-slate-800 h-2 rounded-full overflow-hidden"><div className="bg-emerald-400 h-full rounded-full" style={{ width: `${global.pct}%` }} /></div>
                </div>
                <div className="backdrop-blur-md bg-slate-900/40 border border-emerald-500/15 rounded-[18px] p-5 shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-3"><span>平均正确率</span><BarChart2 className="w-5 h-5 text-teal-400" /></div>
                  <div className="text-3xl font-bold text-emerald-300">{global.pct}%</div>
                  <div className="text-xs text-emerald-400/80 mt-2 flex items-center space-x-1"><TrendingUp className="w-3.5 h-3.5" /><span>持续进步中</span></div>
                </div>
                <div className="backdrop-blur-md bg-slate-900/40 border border-emerald-500/15 rounded-[18px] p-5 shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-3"><span>待复盘错题</span><AlertCircle className="w-5 h-5 text-amber-400" /></div>
                  <div className="text-3xl font-bold text-slate-100">{state.wrongBook.length} <span className="text-sm font-normal text-slate-400">道</span></div>
                  <div className="text-xs text-slate-400 mt-2">需定期完成二刷</div>
                </div>
                <div className="backdrop-blur-md bg-slate-900/40 border border-emerald-500/15 rounded-[18px] p-5 shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-3"><span>章节总数</span><Award className="w-5 h-5 text-emerald-400" /></div>
                  <div className="text-3xl font-bold text-white">{state.chapters.length} <span className="text-sm font-normal text-slate-400">章</span></div>
                  <div className="text-xs text-emerald-400/80 mt-2">涵盖全部考点</div>
                </div>
              </div>

              {/* Subject Cards */}
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-200 flex items-center space-x-2.5"><Layers className="w-6 h-6 text-emerald-400" /><span>科目刷题进度库</span></h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {state.chapters.map(ch => {
                    const stats = getChapterStats(ch);
                    const sub = getSubjectSub(ch);
                    const total = ch.questions.length;
                    const icon = subjectIcons[ch.id] || '';
                    const color = subjectColors[ch.id] || 'from-emerald-500/20 to-teal-600/20';
                    return (
                      <div key={ch.id} onClick={() => goToChapter(ch.id)} className="group backdrop-blur-xl bg-slate-900/40 border border-emerald-500/15 hover:border-emerald-500/40 rounded-[20px] p-6 shadow-lg transition-all duration-300 hover:shadow-emerald-950/50 hover:-translate-y-1 cursor-pointer relative overflow-hidden">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-2xl p-3 rounded-[14px] bg-slate-800/60 border border-slate-700/50">{icon}</span>
                            <div><h3 className="text-[17px] font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">{ch.title}</h3><p className="text-sm text-slate-400 mt-1">{sub}</p></div>
                          </div>
                          <span className="text-sm font-semibold px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">{stats.pct}%</span>
                        </div>
                        <div className="mt-6 space-y-2">
                          <div className="flex justify-between text-sm text-slate-400"><span>刷题进度</span><span className="text-slate-200 font-medium">{stats.correct} / {stats.total} 题</span></div>
                          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5"><div className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full rounded-full transition-all duration-500" style={{ width: `${stats.pct}%` }} /></div>
                        </div>
                        <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between text-sm text-slate-400">
                          <span>共 {total} 题</span>
                          <span className="text-emerald-400 flex items-center space-x-1 group-hover:translate-x-1 transition-transform"><span>进入题库</span><ArrowRight className="w-4 h-4" /></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= QUIZ ================= */}
          {activeTab === 'quiz' && currentQ && (
            <div className="space-y-7">
              <div className="backdrop-blur-xl bg-slate-900/50 border border-emerald-500/20 rounded-[18px] p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">{currentChapter?.title}</span>
                </div>
                <div className="flex items-center space-x-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
                  <button onClick={() => { setIsRecitationMode(false); setShowExplanation(isAnswerSubmitted); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!isRecitationMode ? 'bg-emerald-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'}`}>做题模式</button>
                  <button onClick={() => { setIsRecitationMode(true); setShowExplanation(true); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1 ${isRecitationMode ? 'bg-emerald-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'}`}><Sparkles className="w-3 h-3" /><span>背题/背诵模式</span></button>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => toggleBookmark(currentQ.id)} className={`p-2 rounded-xl border transition-all ${bookmarkedIds.includes(currentQ.id) ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-200'}`} title="收藏题目">
                    {bookmarkedIds.includes(currentQ.id) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                  <span className="text-xs font-mono text-slate-400 px-2">{currentQuestionIndex + 1} / {questions.length}</span>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-slate-900/40 border border-emerald-500/15 rounded-[24px] p-8 md:p-10 shadow-2xl space-y-7 relative">
                <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg">{currentQ.type === 'single' ? '单选题' : '多选题'}</span>
                  </div>
                </div>
                <div className="text-[17px] md:text-xl font-medium text-slate-100 leading-relaxed space-y-3"><p>{currentQ.q}</p></div>

                <div className="space-y-3.5 pt-3">
                  {currentQ.options?.map((opt) => {
                    const isSelected = selectedAnswer === opt.id;
                    const isCorrect = opt.id === currentQ.answer;
                    let cardStyle = "bg-slate-900/30 border-slate-800/80 text-slate-300 hover:border-emerald-500/30 hover:bg-slate-800/30";
                    if (isRecitationMode && isCorrect) cardStyle = "bg-emerald-500/15 border-emerald-500/40 text-emerald-200 font-medium shadow-md shadow-emerald-500/5";
                    else if (isAnswerSubmitted && isCorrect) cardStyle = "bg-emerald-500/20 border-emerald-500/50 text-emerald-200 font-medium";
                    else if (isAnswerSubmitted && isSelected && !isCorrect) cardStyle = "bg-rose-500/20 border-rose-500/50 text-rose-200 font-medium";
                    else if (isSelected) cardStyle = "bg-emerald-500/20 border-emerald-500/50 text-emerald-200 font-medium shadow-lg shadow-emerald-500/10";
                    return (
                      <button key={opt.id} onClick={() => handleOptionSelect(opt.id)} className={`w-full text-left p-5 rounded-[16px] border transition-all duration-200 flex items-center justify-between group ${cardStyle}`}>
                        <div className="flex items-start space-x-3.5">
                          <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-semibold text-xs transition-colors shrink-0 ${isSelected || (isRecitationMode && isCorrect) ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'}`}>{opt.id}</span>
                          <span className="text-sm md:text-base pt-0.5 leading-snug">{opt.text}</span>
                        </div>
                        {isAnswerSubmitted && !isRecitationMode && (isCorrect ? <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" /> : (isSelected ? <XCircle className="w-5 h-5 text-rose-400 shrink-0" /> : null))}
                      </button>
                    );
                  })}
                </div>

                {!isRecitationMode && !isAnswerSubmitted && (
                  <div className="pt-4 flex justify-end">
                    <button onClick={handleSubmitAnswer} disabled={!selectedAnswer} className={`px-8 py-3 rounded-2xl font-bold text-sm shadow-lg transition-all ${selectedAnswer ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-emerald-500/20 cursor-pointer' : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'}`}>提交答案 & 查看解析</button>
                  </div>
                )}

                {showExplanation && currentQ.explanation && (
                  <div className="mt-10 pt-7 border-t border-emerald-500/20 space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5 text-emerald-300 font-bold text-sm"><Brain className="w-5 h-5 text-emerald-400" /><span>AI 深度解析与考点拆解</span></div>
                      <span className="text-xs text-slate-400">正确答案：<span className="text-emerald-400 font-bold text-base">{currentQ.answer}</span></span>
                    </div>
                    <div className="p-5 rounded-[16px] bg-emerald-950/20 border border-emerald-500/20 text-slate-200 text-[15px] leading-relaxed space-y-2"><p>{currentQ.explanation}</p></div>
                    {currentQ.mnemonic && <div className="p-4 rounded-[12px] bg-teal-950/30 border border-teal-500/20 text-sm text-teal-200 font-medium">{currentQ.mnemonic}</div>}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4">
                <button onClick={handlePrevQuestion} disabled={currentQuestionIndex === 0} className={`px-6 py-3 rounded-[12px] border text-sm font-medium flex items-center space-x-2 transition-all ${currentQuestionIndex > 0 ? 'bg-slate-900/60 border-slate-700/60 text-slate-200 hover:border-emerald-500/40' : 'bg-slate-900/20 border-slate-800/40 text-slate-600 cursor-not-allowed'}`}><ChevronLeft className="w-4 h-4" /><span>上一题</span></button>
                <div className="text-xs text-slate-400 hidden sm:block">键盘快捷键：<kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">A-D</kbd> 选择，<kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">Enter</kbd> 提交</div>
                <button onClick={handleNextQuestion} disabled={currentQuestionIndex === questions.length - 1} className={`px-6 py-3 rounded-[12px] border text-sm font-medium flex items-center space-x-2 transition-all ${currentQuestionIndex < questions.length - 1 ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30' : 'bg-slate-900/20 border-slate-800/40 text-slate-600 cursor-not-allowed'}`}><span>下一题</span><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {/* ================= WRONG BOOK ================= */}
          {activeTab === 'wrong' && (
            <div className="space-y-7">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 backdrop-blur-xl bg-slate-900/40 border border-emerald-500/15 rounded-[20px] p-7 shadow-xl">
                <div><h1 className="text-2xl font-bold text-white flex items-center space-x-3"><AlertCircle className="w-6 h-6 text-amber-400" /><span>错题复盘与攻克本</span></h1><p className="text-sm text-slate-400 mt-2">系统智能记录错题，建议按照艾宾浩斯记忆曲线定期二刷。</p></div>
                <div className="flex items-center space-x-2 bg-slate-950/60 p-1.5 rounded-[14px] border border-slate-800">
                  <button onClick={() => setFlashcardMode(false)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${!flashcardMode ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>列表模式</button>
                  <button onClick={() => setFlashcardMode(true)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${flashcardMode ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>抽卡背诵</button>
                </div>
              </div>

              {!flashcardMode ? (
                <div className="space-y-5">
                  {state.wrongBook.map((item) => {
                    const letters = ['A','B','C','D'];
                    return (
                      <div key={`${item.chId}-${item.question.id}`} className="backdrop-blur-xl bg-slate-900/40 border border-emerald-500/15 rounded-[18px] p-7 shadow-lg space-y-5 hover:border-emerald-500/30 transition-all">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                          <div className="flex items-center space-x-2"><span className="text-xs font-semibold px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">{item.chTitle}</span></div>
                        </div>
                        <div className="text-[15px] font-medium text-slate-200 leading-relaxed">{item.question.q}</div>
                        {item.question.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            {item.question.options.map((opt, i) => {
                              const isCorrect = item.question.type === 'single' ? i === item.question.answer : (item.question.answer as number[])?.includes(i);
                              return <div key={i} className={`p-3.5 rounded-[12px] border ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-slate-800/30 border-slate-700/30 text-slate-400'}`}>{letters[i]}. {opt}</div>;
                            })}
                          </div>
                        )}
                        {item.question.explain && <div className="p-4 rounded-[12px] bg-slate-950/40 border border-slate-800 text-sm text-slate-400 flex items-center space-x-2.5"><HelpCircle className="w-5 h-5 text-amber-400 shrink-0" /><span>解析：<strong className="text-slate-200">{item.question.explain}</strong></span></div>}
                        <div className="pt-3 flex justify-end"><button onClick={() => { setActiveTab('quiz'); goToChapter(item.chId); }} className="px-5 py-2.5 rounded-[12px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-sm font-medium transition-all">立即重新做此题</button></div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                  {state.wrongBook.map((item) => {
                    const isFlipped = flippedCards[item.question.id];
                    return (
                      <div key={`${item.chId}-${item.question.id}`} onClick={() => setFlippedCards(prev => ({ ...prev, [item.question.id]: !prev[item.question.id] }))} className="h-72 cursor-pointer group">
                        <div className={`relative w-full h-full duration-500 rounded-[20px] backdrop-blur-xl bg-slate-900/60 border border-emerald-500/20 p-7 shadow-xl flex flex-col justify-between transition-all group-hover:border-emerald-500/40 ${isFlipped ? 'bg-emerald-950/40 border-emerald-500/40' : ''}`}>
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span className="font-semibold text-emerald-400">{item.chTitle}</span>
                            <span className="text-[10px] bg-slate-800 px-2.5 py-1 rounded-lg text-slate-300">{isFlipped ? '背面：答案与解析' : '正面：点击翻转'}</span>
                          </div>
                          <div className="my-auto text-[15px] md:text-lg font-medium text-slate-100 text-center leading-relaxed">
                            {!isFlipped ? item.question.q : (
                              <div className="space-y-3"><div className="text-emerald-300 font-bold text-xl">正确答案：{item.question.type === 'single' ? ['A','B','C','D'][item.question.answer as number] : (item.question.answer as number[]).map(i => ['A','B','C','D'][i]).join(', ')}</div><div className="text-sm text-slate-300">{item.question.explain}</div></div>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 text-center"> 点击任意卡片区域可翻转查看</div>
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
