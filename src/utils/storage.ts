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

/**
 * Self-assessment rating for subjective questions, keyed `${chId}-${qId}`.
 *
 * 主观题 carry 250 of the 300 exam points but cannot be auto-graded, so the only
 * honest signal is the learner's own rating. 0 = 未评, 1 = 不会, 2 = 模糊, 3 = 已掌握.
 */
const SUBJ_RATING_KEY = 'quiz_subj_rating';

export function getSubjRatings(): Record<string, number> {
  const raw = localStorage.getItem(SUBJ_RATING_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed as Record<string, number> : {};
  } catch { return {}; }
}

export function saveSubjRatings(data: Record<string, number>) {
  localStorage.setItem(SUBJ_RATING_KEY, JSON.stringify(data));
}
