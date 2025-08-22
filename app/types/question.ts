export type QuestionType = 'single' | 'multi';

export interface QuestionOption {
  id: string;
  text: string;
  explanation?: string; // shown on “Show Answer”
}

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  options: QuestionOption[];
  correct: string[]; // always an array (single has length 1)
  explanation?: string; // optional summary shown after checking
  source?: string;
  shuffle?: boolean; // if true, shuffle options on load
  version: number;   // e.g., 1
}