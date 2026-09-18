import type { WrongBookEntry, Theme } from '../types';

const THEME_KEY = 'quiz_theme';
const WRONG_KEY = 'quiz_wrong_book';
const answerKey = (chId: string, qId: number) => `quiz_${chId}_${qId}`;
const subjKey = (chId: string) => `quiz_subj_${chId}`;

export function getTheme(): Theme {
  const v = localStorage.getItem(THEME_KEY);
  return (v === 'dark' || v === 'light') ? v : 'light';
}

export function setTheme(t: Theme) {
  localStorage.setItem(THEME_KEY, t);
}

export function getWrongBook(): WrongBookEntry[] {
  const raw = localStorage.getItem(WRONG_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export function setWrongBook(book: WrongBookEntry[]) {
  localStorage.setItem(WRONG_KEY, JSON.stringify(book));
}

export function getSavedAnswer(chId: string, qId: number): unknown {
  const v = localStorage.getItem(answerKey(chId, qId));
  if (v === null) return null;
  try { return JSON.parse(v); } catch { return v; }
}

export function setSavedAnswer(chId: string, qId: number, value: unknown) {
  localStorage.setItem(answerKey(chId, qId), JSON.stringify(value));
}

export function clearSavedAnswers(chId: string) {
  // Remove all answer keys for this chapter
  const prefix = `quiz_${chId}_`;
  const subj = subjKey(chId);
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(prefix) || k === subj) toRemove.push(k!);
  }
  toRemove.forEach(k => localStorage.removeItem(k));
}

export function getSubjDone(chId: string): Record<number, boolean> {
  const raw = localStorage.getItem(subjKey(chId));
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

export function setSubjDone(chId: string, data: Record<number, boolean>) {
  localStorage.setItem(subjKey(chId), JSON.stringify(data));
}
