import type { Question } from '../types';

export interface GradingResult {
  qId: number;
  correct: boolean;
  userAnswer: unknown;
}

export function gradeQuestions(questions: Question[], answers: Record<number, unknown>): GradingResult[] {
  return questions
    .filter(q => q.type !== 'subjective')
    .map(q => {
      const userAns = answers[q.id];
      let correct = false;
      if (q.type === 'single') {
        correct = userAns === q.answer;
      } else if (q.type === 'multi') {
        const userArr = Array.isArray(userAns) ? [...userAns].sort().join(',') : '';
        const ansArr = [...(q.answer as number[])].sort().join(',');
        correct = userArr === ansArr;
      }
      return { qId: q.id, correct, userAnswer: userAns };
    });
}

export function calcAccuracy(results: GradingResult[]) {
  const total = results.length;
  const correct = results.filter(r => r.correct).length;
  const pct = total > 0 ? Math.round(correct / total * 100) : 0;
  return { total, correct, pct };
}

export function getScoreClass(pct: number): string {
  if (pct >= 80) return 'good';
  if (pct < 60) return 'bad';
  return '';
}

export function getScoreEmoji(pct: number): string {
  if (pct === 100) return '🎉';
  if (pct >= 80) return '👍';
  if (pct >= 60) return '💪';
  return '📖';
}

export function getBadgeClass(pct: number): string {
  if (pct >= 80) return 'good';
  if (pct < 60) return 'bad';
  return 'ok';
}
