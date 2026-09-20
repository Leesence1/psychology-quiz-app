import React, { useState, useEffect } from 'react';
import {
  BookOpen, CheckCircle, XCircle, Clock, Award,
  LayoutDashboard, AlertCircle, Volume2, VolumeX,
  Play, Pause, Sparkles,
  Target, ArrowRight,
  Bookmark, BookmarkCheck, ChevronRight, ChevronLeft, RotateCcw,
  GraduationCap, Brain, Eye, Languages, ScrollText, FileText, Zap,
  BarChart2, Flame, HelpCircle
} from 'lucide-react';
import { useQuiz } from './context/QuizContext';
import { getGlobalStats, getChapterStats } from './utils/stats';
import type { Chapter } from './types';

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
  const { state, dispatch, currentChapter, setAnswer, submit, selectChapter, addWrong } = useQuiz();
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
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then((data: Chapter[]) => { dispatch({ type: 'SET_DATA', payload: data }); dispatch({ type: 'SET_LOADING', payload: false }); })
      .catch(err => { dispatch({ type: 'SET_ERROR', payload: `加载失败: ${err}` }); dispatch({ type: 'SET_LOADING', payload: false }); });
  }, []);

  useEffect(() => {
    if (!isAnswerSubmitted || !currentChapter) return;
    const ch = currentChapter;
    const qs = ch.questions.filter(q => q.type !== 'subjective');
    const q = qs[currentQuestionIndex];
    if (!q) return;
    const u = state.answers[q.id];
    let ok = false;
    if (q.type === 'single') ok = u === q.answer;
    else if (q.type === 'multi') { const a = [...(q.answer as number[])].sort().join(','); ok = (Array.isArray(u) ? [...u].sort().join(',') : '') === a; }
    if (!ok) addWrong([{ chId: ch.id, chTitle: ch.title, question: q }]);
  }, [isAnswerSubmitted, currentQuestionIndex, currentChapter]);

  useEffect(() => {
    let iv: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning && timerSeconds > 0) iv = setInterval(() => setTimerSeconds(p => p - 1), 1000);
    else if (timerSeconds === 0) { setIsTimerRunning(false); alert('番茄钟结束！休息 5 分钟。'); }
    return () => { if (iv) clearInterval(iv); };
  }, [isTimerRunning, timerSeconds]);

  const fmt = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

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

  const sel = (id: string) => { if (isAnswerSubmitted && !isRecitationMode) return; setSelectedAnswer(id); if (currentQ) setAnswer(currentQ.id, ['A','B','C','D'].indexOf(id)); };
  const submitAns = () => { if (!selectedAnswer) return; setIsAnswerSubmitted(true); setShowExplanation(true); submit(); };
  const next = () => { if (currentQuestionIndex < questions.length-1) { setCurrentQuestionIndex(p=>p+1); setSelectedAnswer(state.answers[questions[currentQuestionIndex+1]?.id]??null); setIsAnswerSubmitted(false); setShowExplanation(isRecitationMode); }};
  const prev = () => { if (currentQuestionIndex>0) { setCurrentQuestionIndex(p=>p-1); setSelectedAnswer(state.answers[questions[currentQuestionIndex-1]?.id]??null); setIsAnswerSubmitted(false); setShowExplanation(isRecitationMode); }};
  const goCh = (id: string) => { selectChapter(id); setActiveTab('quiz'); setCurrentQuestionIndex(0); setSelectedAnswer(null); setIsAnswerSubmitted(false); setShowExplanation(isRecitationMode); };

  useEffect(() => {
    if (activeTab !== 'quiz' || !currentQ) return;
    const h = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (['a','b','c','d'].includes(k) && !isAnswerSubmitted && !isRecitationMode) { e.preventDefault(); sel(k.toUpperCase()); }
      else if (k==='enter' && selectedAnswer && !isAnswerSubmitted) { e.preventDefault(); submitAns(); }
      else if (k==='arrowright') { e.preventDefault(); next(); }
      else if (k==='arrowleft') { e.preventDefault(); prev(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [activeTab, currentQ, selectedAnswer, isAnswerSubmitted, currentQuestionIndex, questions.length, isRecitationMode]);

  if (state.loading) return <div className="flex h-screen items-center justify-center bg-[#0c1222]"><div className="text-center"><div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-blue-500/20 border-t-blue-400"/><p className="text-sm text-slate-500">加载中...</p></div></div>;
  if (state.error) return <div className="flex h-screen items-center justify-center bg-[#0c1222]"><div className="rounded-xl border border-rose-500/20 bg-[#162032] px-8 py-10 text-center"><p className="text-rose-400 text-sm">{state.error}</p></div></div>;

  return (
    <div className="min-h-screen bg-[#0c1222] text-slate-100 font-sans antialiased selection:bg-blue-500 selection:text-white">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{backgroundImage:'linear-gradient(rgba(148,163,184,1) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,1) 1px,transparent 1px)',backgroundSize:'64px 64px'}}/>

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-[#0c1222]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
          <button onClick={()=>setActiveTab('dashboard')} className="flex shrink-0 items-center gap-3 rounded-xl text-left transition-opacity hover:opacity-80">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 ring-1 ring-inset ring-blue-500/20"><GraduationCap className="h-5 w-5 text-blue-400"/></div>
            <span className="leading-tight">
              <span className="block text-[17px] font-bold tracking-tight text-white">GradQuest</span>
              <span className="block text-[11px] text-slate-500">347 心理学考研</span>
            </span>
          </button>

          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-lg bg-[#162032] px-3 py-1.5 ring-1 ring-inset ring-slate-700/40 sm:flex">
              <Target className="h-4 w-4 text-blue-400"/>
              <span className="text-xs text-slate-500">正确率</span>
              <span className="tnum text-sm font-semibold text-white">{global.pct}%</span>
            </div>
            <button onClick={()=>setShowTimerOverlay(!showTimerOverlay)} title="专注计时" aria-label="专注计时"
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs ring-1 ring-inset transition-colors duration-200 ${showTimerOverlay?'bg-blue-500/10 text-blue-300 ring-blue-500/30':'bg-[#162032] text-slate-400 ring-slate-700/40 hover:text-slate-200 hover:ring-slate-600'}`}>
              <Clock className="h-4 w-4"/><span className="tnum font-medium">{fmt(timerSeconds)}</span>
            </button>
            <button onClick={()=>setSoundEnabled(!soundEnabled)} title={soundEnabled?'关闭音效':'开启音效'} aria-label={soundEnabled?'关闭音效':'开启音效'}
              className="rounded-lg bg-[#162032] p-2 text-slate-500 ring-1 ring-inset ring-slate-700/40 transition-colors duration-200 hover:text-slate-300 hover:ring-slate-600">
              {soundEnabled?<Volume2 className="h-4 w-4 text-blue-400"/>:<VolumeX className="h-4 w-4"/>}
            </button>
            <div className="flex min-w-0 items-center gap-2.5 border-l border-slate-800 pl-2.5 sm:pl-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-300 ring-1 ring-inset ring-blue-500/25">K</div>
              <div className="hidden min-w-0 leading-tight lg:block">
                <div className="truncate text-xs font-medium text-slate-300">考研人</div>
                <div className="tnum text-[11px] text-slate-500">{global.correct}/{global.total}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Timer */}
      {showTimerOverlay && (
        <div className="fixed inset-x-0 top-20 z-30 flex justify-center px-4">
          <div className="bg-[#162032] border border-slate-700/50 rounded-xl p-5 shadow-xl max-w-sm w-full flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400"><Clock className="w-5 h-5"/></div>
              <div><div className="text-sm font-medium text-slate-200">专注计时</div><div className="text-xl font-mono font-bold text-blue-400 tabular-nums">{fmt(timerSeconds)}</div></div>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={()=>setIsTimerRunning(!isTimerRunning)} className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-400 flex items-center space-x-1 text-xs">{isTimerRunning?<Pause className="w-3.5 h-3.5"/>:<Play className="w-3.5 h-3.5 fill-white"/>}<span>{isTimerRunning?'暂停':'开始'}</span></button>
              <button onClick={()=>{setIsTimerRunning(false);setTimerSeconds(25*60);}} className="p-2 rounded-lg bg-slate-800 text-slate-400"><RotateCcw className="w-4 h-4"/></button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN */}
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-5 py-6 sm:px-8 lg:flex-row lg:gap-8 lg:px-12 lg:py-8">

        {/* SIDEBAR — pills on mobile, full-width rows on desktop */}
        <aside className="lg:w-64 lg:shrink-0">
          <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-800/60 bg-[#162032] p-2 lg:sticky lg:top-24 lg:flex-col lg:overflow-visible">
            {[
              { id:'dashboard', label:'学习仪表盘', icon: LayoutDashboard },
              { id:'quiz', label:'真题 / 模拟刷题', icon: BookOpen },
              { id:'wrong', label:'错题复盘本', icon: AlertCircle },
            ].map(({id, label, icon: Icon}) => (
              <button key={id} onClick={()=>{ if(id==='quiz' && state.chapters.length>0) goCh(state.chapters[0].id); else setActiveTab(id); }}
                className={`flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.98] lg:w-full lg:gap-3 lg:px-4 lg:py-3 ${activeTab===id ? 'bg-blue-500/10 text-blue-300 ring-1 ring-inset ring-blue-500/25' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'}`}>
                <Icon className="h-[18px] w-[18px] shrink-0"/><span className="whitespace-nowrap">{label}</span>
                {id==='wrong' && state.wrongBook.length>0 && <span className="tnum ml-auto rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">{state.wrongBook.length}</span>}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0">

          {/* ===== DASHBOARD ===== */}
          {activeTab==='dashboard' && (
            <div className="space-y-6">
              {/* Hero — tighter, single reading column, CTA vertically centred */}
              <div className="animate-rise relative overflow-hidden rounded-2xl border border-blue-500/15 bg-gradient-to-br from-blue-500/[0.12] via-blue-500/5 to-transparent p-6 sm:p-8 lg:px-9 lg:py-8">
                <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 space-y-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-300 ring-1 ring-inset ring-blue-500/20"><Flame className="h-3.5 w-3.5"/><span>今日状态极佳</span></span>
                    <h1 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-[34px]">保持专注，上岸在即</h1>
                    <p className="text-sm text-slate-400">已完成 <span className="tnum font-semibold text-blue-400">{global.correct}</span> 道题，准确率 <span className="tnum font-semibold text-blue-400">{global.pct}%</span></p>
                  </div>
                  <button onClick={()=>{if(state.chapters.length>0)goCh(state.chapters[0].id);}}
                    className="group flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:bg-blue-400 hover:shadow-blue-500/30 active:scale-[0.98] lg:self-auto">
                    <Play className="h-4 w-4 fill-white transition-transform duration-200 group-hover:scale-110"/><span>开始刷题</span>
                  </button>
                </div>
              </div>

              {/* Stats — one strip instead of four floating cards */}
              <div className="animate-rise overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-800/60">
                <div className="grid grid-cols-2 gap-px sm:grid-cols-4">
                  {[
                    { label:'今日刷题', value:`${global.correct}`, suffix:` / ${global.total}`, icon:BookOpen },
                    { label:'平均正确率', value:`${global.pct}%`, suffix:'', icon:BarChart2, accent:true },
                    { label:'待复盘错题', value:`${state.wrongBook.length}`, suffix:' 道', icon:AlertCircle },
                    { label:'章节总数', value:`${state.chapters.length}`, suffix:' 章', icon:Award },
                  ].map((s,i) => (
                    <div key={i} className="bg-[#162032] px-5 py-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <s.icon className={`h-3.5 w-3.5 ${s.accent?'text-blue-400':'text-slate-500'}`}/><span>{s.label}</span>
                      </div>
                      <p className={`tnum mt-2 text-2xl font-bold ${s.accent?'text-blue-400':'text-white'}`}>{s.value}<span className="text-sm font-normal text-slate-500">{s.suffix}</span></p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-800/60 bg-[#162032] px-5 py-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-500"><span>今日进度</span><span className="tnum">{global.pct}%</span></div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-700/50"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-[width] duration-700 ease-out" style={{width:`${global.pct}%`}}/></div>
                </div>
              </div>

              {/* Chapter Cards — two rows of information, no duplicated counts */}
              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-base font-semibold text-slate-200">科目进度</h2>
                  <span className="tnum text-xs text-slate-500">{state.chapters.length} 个科目</span>
                </div>
                <div className="stagger grid grid-cols-1 gap-4 md:grid-cols-2">
                  {state.chapters.map(ch => {
                    const stats = getChapterStats(ch);
                    const sub = getSubjectSub(ch);
                    const total = ch.questions.length;
                    const Icon = subjectIconMap[ch.id] || BookOpen;
                    const accent = subjectAccentMap[ch.id] || 'text-blue-400';
                    const border = subjectBorderMap[ch.id] || 'border-blue-500/20';
                    return (
                      <button key={ch.id} onClick={()=>goCh(ch.id)}
                        className="group flex flex-col gap-4 rounded-2xl border border-slate-800/60 bg-[#162032] p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-700 hover:bg-[#1a2540] hover:shadow-lg hover:shadow-black/20 active:translate-y-0 active:scale-[0.995]">
                        <div className="flex items-start gap-3.5">
                          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800/60 ring-1 ring-inset ${border}`}><Icon className={`h-5 w-5 ${accent}`}/></div>
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-[15px] font-semibold text-slate-100">{ch.title}</h3>
                            <p className="mt-0.5 truncate text-xs text-slate-500">{sub}</p>
                          </div>
                          <span className={`tnum shrink-0 text-sm font-semibold ${stats.pct > 0 ? accent : 'text-slate-500'}`}>{stats.pct}%</span>
                        </div>

                        <div className="space-y-2">
                          <div className="h-1.5 overflow-hidden rounded-full bg-slate-700/50">
                            <div className="h-full rounded-full bg-blue-500 transition-[width] duration-700 ease-out" style={{width:`${stats.pct}%`}}/>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="tnum text-slate-400">{stats.correct} / {total} 题</span>
                            <span className="flex items-center gap-1 text-slate-500 transition-colors duration-200 group-hover:text-blue-400">
                              <span>进入题库</span><ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"/>
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ===== QUIZ ===== */}
          {activeTab==='quiz' && currentQ && (
            <div className="animate-rise space-y-5">
              <div className="bg-[#162032] border border-slate-800/50 rounded-xl p-5 flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-300">{currentChapter?.title}</span>
                <div className="flex items-center space-x-1 bg-slate-800/50 p-0.5 rounded-lg">
                  <button onClick={()=>{setIsRecitationMode(false);setShowExplanation(isAnswerSubmitted);}} className={`px-4 py-1.5 rounded-md text-xs transition-all ${!isRecitationMode?'bg-blue-500 text-white':'text-slate-400 hover:text-slate-200'}`}>做题</button>
                  <button onClick={()=>{setIsRecitationMode(true);setShowExplanation(true);}} className={`px-4 py-1.5 rounded-md text-xs transition-all flex items-center space-x-1 ${isRecitationMode?'bg-blue-500 text-white':'text-slate-400 hover:text-slate-200'}`}><Sparkles className="w-3 h-3"/><span>背诵</span></button>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={()=>{setBookmarkedIds(p=>p.includes(currentQ.id)?p.filter(x=>x!==currentQ.id):[...p,currentQ.id]);}} className={`p-2 rounded-lg transition-all ${bookmarkedIds.includes(currentQ.id)?'text-blue-400 bg-blue-500/10':'text-slate-500 hover:text-slate-300'}`}>{bookmarkedIds.includes(currentQ.id)?<BookmarkCheck className="w-4 h-4"/>:<Bookmark className="w-4 h-4"/>}</button>
                  <span className="text-xs text-slate-500 tabular-nums px-1">{currentQuestionIndex+1} / {questions.length}</span>
                </div>
              </div>

              <div className="bg-[#162032] border border-slate-800/50 rounded-2xl p-10 md:p-12 space-y-8">
                <span className="inline-block text-xs font-medium text-slate-500 bg-slate-800 px-3 py-1.5 rounded-lg">{currentQ.type==='single'?'单选题':'多选题'}</span>
                <p className="text-xl text-slate-100 leading-relaxed">{currentQ.q}</p>

                <div className="space-y-3 pt-2">
                  {currentQ.options?.map((opt) => {
                    const isSel = selectedAnswer===opt.id;
                    const isCor = opt.id===currentQ.answer;
                    let st = "bg-slate-800/30 border-slate-700/30 text-slate-300 hover:border-slate-500 hover:bg-slate-800/60";
                    if (isRecitationMode && isCor) st="bg-blue-500/10 border-blue-500/30 text-blue-200";
                    else if (isAnswerSubmitted && isCor) st="bg-green-500/10 border-green-500/30 text-green-200";
                    else if (isAnswerSubmitted && isSel && !isCor) st="bg-rose-500/10 border-rose-500/30 text-rose-200";
                    else if (isSel) st="bg-blue-500/10 border-blue-500/30 text-blue-200";
                    return (
                      <button key={opt.id} onClick={()=>sel(opt.id)} className={`group flex w-full items-center justify-between rounded-xl border p-5 text-left transition-all duration-200 active:scale-[0.995] ${st}`}>
                        <div className="flex items-start space-x-4">
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold transition-colors duration-200 ${isSel||(isRecitationMode&&isCor)?'bg-blue-400 text-[#0c1222]':'bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-200'}`}>{opt.id}</span>
                          <span className="text-[15px] md:text-base pt-1">{opt.text}</span>
                        </div>
                        {isAnswerSubmitted&&!isRecitationMode&&(isCor?<CheckCircle className="w-5 h-5 text-green-400 shrink-0"/>:isSel?<XCircle className="w-5 h-5 text-rose-400 shrink-0"/>:null)}
                      </button>
                    );
                  })}
                </div>

                {!isRecitationMode && !isAnswerSubmitted && (
                  <div className="pt-3 flex justify-end">
                    <button onClick={submitAns} disabled={!selectedAnswer} className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all ${selectedAnswer?'bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/20':'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>提交答案</button>
                  </div>
                )}

                {showExplanation && currentQ.explanation && (
                  <div className="animate-rise mt-8 space-y-4 border-t border-slate-800/50 pt-7">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-blue-300 font-medium text-sm"><HelpCircle className="w-4 h-4"/><span>解析</span></div>
                      <span className="text-xs text-slate-500">答案：<span className="text-blue-400 font-semibold">{currentQ.answer}</span></span>
                    </div>
                    <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-5 text-[15px] text-slate-300 leading-relaxed"><p>{currentQ.explanation}</p></div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button onClick={prev} disabled={currentQuestionIndex===0} className={`px-5 py-2.5 rounded-lg border text-sm transition-all flex items-center space-x-1.5 ${currentQuestionIndex>0?'bg-[#162032] border-slate-700/50 text-slate-300 hover:border-slate-600':'bg-slate-800/30 border-slate-800/50 text-slate-600 cursor-not-allowed'}`}><ChevronLeft className="w-4 h-4"/><span>上一题</span></button>
                <button onClick={next} disabled={currentQuestionIndex===questions.length-1} className={`px-5 py-2.5 rounded-lg border text-sm transition-all flex items-center space-x-1.5 ${currentQuestionIndex<questions.length-1?'bg-blue-500/10 border-blue-500/20 text-blue-300 hover:bg-blue-500/20':'bg-slate-800/30 border-slate-800/50 text-slate-600 cursor-not-allowed'}`}><span>下一题</span><ChevronRight className="w-4 h-4"/></button>
              </div>
            </div>
          )}

          {/* ===== WRONG BOOK ===== */}
          {activeTab==='wrong' && (
            <div className="animate-rise space-y-5">
              <div className="bg-[#162032] border border-slate-800/50 rounded-2xl p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div><h1 className="text-2xl font-bold text-white">错题复盘本</h1><p className="text-sm text-slate-500 mt-2">共 {state.wrongBook.length} 道错题</p></div>
                {state.wrongBook.length > 0 && (
                  <div className="flex items-center space-x-1 bg-slate-800/50 p-0.5 rounded-lg">
                    <button onClick={()=>setFlashcardMode(false)} className={`px-5 py-2 rounded-md text-sm transition-all ${!flashcardMode?'bg-blue-500 text-white':'text-slate-400 hover:text-slate-200'}`}>列表</button>
                    <button onClick={()=>setFlashcardMode(true)} className={`px-5 py-2 rounded-md text-sm transition-all ${flashcardMode?'bg-blue-500 text-white':'text-slate-400 hover:text-slate-200'}`}>抽卡</button>
                  </div>
                )}
              </div>

              {state.wrongBook.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-[#162032]/60 px-6 py-16 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-inset ring-emerald-500/20"><CheckCircle className="h-6 w-6 text-emerald-400"/></div>
                  <p className="mt-4 text-sm font-medium text-slate-200">错题本是空的</p>
                  <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">做错的题会自动收进这里，方便反复复盘。先去刷几道题吧。</p>
                  <button onClick={()=>{if(state.chapters.length>0)goCh(state.chapters[0].id);}}
                    className="mt-5 flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:bg-blue-400 active:scale-[0.98]">
                    <Play className="h-4 w-4 fill-white"/><span>去刷题</span>
                  </button>
                </div>
              ) : !flashcardMode ? (
                <div className="space-y-5">
                  {state.wrongBook.map((item) => {
                    const L = ['A','B','C','D'];
                    return (
                      <div key={`${item.chId}-${item.question.id}`} className="bg-[#162032] border border-slate-800/50 rounded-2xl p-8 space-y-6">
                        <span className="inline-block text-xs font-medium text-slate-500 bg-slate-800 px-2.5 py-1 rounded">{item.chTitle}</span>
                        <p className="text-[17px] text-slate-200 leading-relaxed">{item.question.q}</p>
                        {item.question.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            {item.question.options.map((opt,i) => {
                              const isCor = item.question.type==='single'?i===item.question.answer:(item.question.answer as number[])?.includes(i);
                              return <div key={i} className={`p-4 rounded-lg border ${isCor?'bg-green-500/10 border-green-500/20 text-green-300':'bg-slate-800/30 border-slate-700/30 text-slate-400'}`}>{L[i]}. {opt}</div>;
                            })}
                          </div>
                        )}
                        {item.question.explain && <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-4 text-sm text-slate-400"><span className="text-slate-500">解析：</span><span className="text-slate-300">{item.question.explain}</span></div>}
                        <div className="flex justify-end pt-2"><button onClick={()=>{setActiveTab('quiz');goCh(item.chId);}} className="px-5 py-2.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 text-sm transition-all">重做此题</button></div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {state.wrongBook.map((item) => {
                    const flip = flippedCards[item.question.id];
                    return (
                      <div key={`${item.chId}-${item.question.id}`} onClick={()=>setFlippedCards(p=>({...p,[item.question.id]:!p[item.question.id]}))} className="h-72 cursor-pointer group">
                        <div className={`w-full h-full bg-[#162032] border rounded-2xl p-8 shadow-lg flex flex-col justify-between transition-all group-hover:border-slate-700 ${flip?'border-blue-500/30 bg-blue-500/5':'border-slate-800/50'}`}>
                          <div className="flex items-center justify-between text-xs text-slate-500"><span className="text-blue-400 font-medium">{item.chTitle}</span><span className="bg-slate-800 px-2.5 py-1 rounded">{flip?'背面':'正面'}</span></div>
                          <div className="my-auto text-[17px] text-slate-100 text-center leading-relaxed">
                            {!flip ? item.question.q : (
                              <div className="space-y-4"><p className="text-blue-400 font-semibold text-xl">答案：{item.question.type==='single'?['A','B','C','D'][item.question.answer as number]:(item.question.answer as number[]).map(i=>['A','B','C','D'][i]).join(', ')}</p><p className="text-sm text-slate-400">{item.question.explain}</p></div>
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
