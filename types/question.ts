export type QuestionType = 'single' | 'multi';
export type QType = 'mcq' | 'msq';

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
  /** true = keep JSON order (no shuffle), false/undefined = shuffle */
  lockOptionOrder?: boolean
}

export interface UserAnswer {
  questionId: string;
  selectedOptionIds: string[];   // de alternativ användaren valde
}