import type { Chapter, Question } from '../types';
import { getSavedAnswer } from '../utils/storage';
import { gradeQuestions, calcAccuracy, getBadgeClass } from '../utils/grading';
export { getBadgeClass } from '../utils/grading';

export function getChapterStats(chapter: Chapter) {
  const questions = chapter.questions.filter(q => q.type !== 'subjective');
  const answers: Record<number, unknown> = {};
  questions.forEach(q => {
    const saved = getSavedAnswer(chapter.id, q.id);
    if (saved !== null) answers[q.id] = saved;
  });
  const results = gradeQuestions(chapter.questions, answers);
  return calcAccuracy(results);
}

export function getGlobalStats(chapters: Chapter[]) {
  let totalAll = 0, correctAll = 0;
  chapters.forEach(ch => {
    const s = getChapterStats(ch);
    totalAll += s.total;
    correctAll += s.correct;
  });
  const pct = totalAll > 0 ? Math.round(correctAll / totalAll * 100) : 0;
  return { total: totalAll, correct: correctAll, pct };
}
