export enum NoteName {
  C = 'C',
  Db = 'Db',
  D = 'D',
  Eb = 'Eb',
  E = 'E',
  F = 'F',
  Gb = 'Gb',
  G = 'G',
  Ab = 'Ab',
  A = 'A',
  Bb = 'Bb',
  B = 'B'
}

export enum TheoryType {
  SCALE = 'Scale',
  CHORD = 'Chord',
  PROGRESSION = 'Progression'
}

export enum ImageSize {
  SIZE_1K = '1K',
  SIZE_2K = '2K',
  SIZE_4K = '4K'
}

export interface DiatonicChord {
  root: string;
  variety: string;
  numeral: string;
  notes: string[];
}

export interface TheoryResult {
  notes: string[];
  intervals: string[];
  name: string;
  numeral?: string;
  diatonicChords?: DiatonicChord[];
}

export interface ProgressionStep {
  root: NoteName;
  variety: string;
  numeral: string;
}

export interface ProgressionTemplate {
  name: string;
  mood: string;
  steps: { degree: number; variety: string; numeral: string }[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// Ear Training Types
export type QuizMode = 'interval' | 'chord';

export interface QuizStats {
  correct: number;
  total: number;
  streak: number;
  bestStreak: number;
}

export interface QuizQuestion {
  type: QuizMode;
  root: string;
  notes: string[]; // Actual notes to play
  correctAnswer: string; // The label (e.g., "Major 3rd" or "Minor")
  options: string[]; // Multiple choice options
}
