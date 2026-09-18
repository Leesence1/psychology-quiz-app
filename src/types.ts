export type QuestionType = 'single' | 'multi' | 'subjective';

export interface Question {
  type: QuestionType;
  id: number;
  q: string;
  options?: string[];
  answer: number | number[] | string;
  explain?: string;
}

export interface Chapter {
  id: string;
  title: string;
  questions: Question[];
}

export interface WrongBookEntry {
  chId: string;
  chTitle: string;
  question: Question;
}

export type Theme = 'light' | 'dark';
export type View = 'quiz' | 'wrongbook';
