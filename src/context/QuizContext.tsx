import { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from 'react';
import type { Chapter, Question, WrongBookEntry, Theme, View } from '../types';
import { getTheme, setTheme, getWrongBook, setWrongBook, getSavedAnswer, setSavedAnswer, getSubjDone, setSubjDone, clearSavedAnswers } from '../utils/storage';

interface QuizState {
  chapters: Chapter[];
  currentChapter: string | null;
  answers: Record<number, unknown>;
  subjDone: Record<number, boolean>;
  submitted: boolean;
  wrongBook: WrongBookEntry[];
  theme: Theme;
  view: View;
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: 'SET_DATA'; payload: Chapter[] }
  | { type: 'SET_CHAPTER'; payload: string }
  | { type: 'SET_ANSWER'; payload: { qId: number; answer: unknown } }
  | { type: 'SUBMIT' }
  | { type: 'RESET' }
  | { type: 'SET_VIEW'; payload: View }
  | { type: 'TOGGLE_THEME' }
  | { type: 'TOGGLE_SUBJ'; payload: number }
  | { type: 'ADD_WRONG'; payload: WrongBookEntry[] }
  | { type: 'REMOVE_WRONG'; payload: { qId: number; chId: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: QuizState = {
  chapters: [],
  currentChapter: null,
  answers: {},
  subjDone: {},
  submitted: false,
  wrongBook: [],
  theme: getTheme(),
  view: 'quiz',
  loading: false,
  error: null,
};

function reducer(state: QuizState, action: Action): QuizState {
  switch (action.type) {
    case 'SET_DATA':
      return { ...state, chapters: action.payload };
    case 'SET_CHAPTER': {
      const ch = state.chapters.find(c => c.id === action.payload);
      if (!ch) return state;
      const answers: Record<number, unknown> = {};
      const subjDone: Record<number, boolean> = {};
      ch.questions.forEach(q => {
        const saved = getSavedAnswer(action.payload, q.id);
        if (saved !== null) answers[q.id] = saved;
        if (q.type === 'subjective') {
          const sd = getSubjDone(action.payload);
          if (sd[q.id]) subjDone[q.id] = true;
        }
      });
      return { ...state, currentChapter: action.payload, answers, subjDone, submitted: false };
    }
    case 'SET_ANSWER':
      return { ...state, answers: { ...state.answers, [action.payload.qId]: action.payload.answer } };
    case 'SUBMIT':
      return { ...state, submitted: true };
    case 'RESET': {
      if (!state.currentChapter) return state;
      clearSavedAnswers(state.currentChapter);
      return { ...state, answers: {}, subjDone: {}, submitted: false };
    }
    case 'SET_VIEW':
      return { ...state, view: action.payload, submitted: false, answers: {}, subjDone: {} };
    case 'TOGGLE_THEME': {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      setTheme(next);
      return { ...state, theme: next };
    }
    case 'TOGGLE_SUBJ': {
      const next = { ...state.subjDone, [action.payload]: !state.subjDone[action.payload] };
      if (state.currentChapter) setSubjDone(state.currentChapter, next);
      return { ...state, subjDone: next };
    }
    case 'ADD_WRONG': {
      const existing = new Set(state.wrongBook.map(w => `${w.chId}-${w.question.id}`));
      const merged = [...state.wrongBook, ...action.payload.filter(w => !existing.has(`${w.chId}-${w.question.id}`))];
      setWrongBook(merged);
      return { ...state, wrongBook: merged };
    }
    case 'REMOVE_WRONG': {
      const next = state.wrongBook.filter(w => !(w.question.id === action.payload.qId && w.chId === action.payload.chId));
      setWrongBook(next);
      return { ...state, wrongBook: next };
    }
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

const QuizContext = createContext<{
  state: QuizState;
  dispatch: React.Dispatch<Action>;
  currentChapter: Chapter | undefined;
  selectChapter: (id: string) => void;
  setAnswer: (qId: number, answer: unknown) => void;
  submit: () => void;
  reset: () => void;
  toggleTheme: () => void;
  toggleSubj: (qId: number) => void;
  addWrong: (entries: WrongBookEntry[]) => void;
  removeWrong: (qId: number, chId: string) => void;
  switchView: (view: View) => void;
} | null>(null);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    setWrongBook(state.wrongBook);
  }, [state.wrongBook]);

  useEffect(() => {
    // Save answers on submit
    if (state.submitted && state.currentChapter) {
      const ch = state.chapters.find(c => c.id === state.currentChapter);
      if (!ch) return;
      const chId = state.currentChapter;
      ch.questions.forEach(q => {
        if (q.type !== 'subjective' && state.answers[q.id] !== undefined) {
          setSavedAnswer(chId, q.id, state.answers[q.id]);
        }
      });
    }
  }, [state.submitted, state.currentChapter, state.answers, state.chapters]);

  const selectChapter = useCallback((id: string) => {
    if (!id) return;
    dispatch({ type: 'SET_CHAPTER', payload: id });
  }, []);
  const setAnswer = useCallback((qId: number, answer: unknown) => dispatch({ type: 'SET_ANSWER', payload: { qId, answer } }), []);
  const submit = useCallback(() => dispatch({ type: 'SUBMIT' }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);
  const toggleTheme = useCallback(() => dispatch({ type: 'TOGGLE_THEME' }), []);
  const toggleSubj = useCallback((qId: number) => dispatch({ type: 'TOGGLE_SUBJ', payload: qId }), []);
  const addWrong = useCallback((entries: WrongBookEntry[]) => dispatch({ type: 'ADD_WRONG', payload: entries }), []);
  const removeWrong = useCallback((qId: number, chId: string) => dispatch({ type: 'REMOVE_WRONG', payload: { qId, chId } }), []);
  const switchView = useCallback((view: View) => dispatch({ type: 'SET_VIEW', payload: view }), []);

  const currentChapter = state.chapters.find(c => c.id === state.currentChapter);

  return (
    <QuizContext.Provider value={{ state, dispatch, currentChapter, selectChapter, setAnswer, submit, reset, toggleTheme, toggleSubj, addWrong, removeWrong, switchView }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz must be used within QuizProvider');
  return ctx;
}
