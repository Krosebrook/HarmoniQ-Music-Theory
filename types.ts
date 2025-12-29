
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

export interface TheoryResult {
  notes: string[];
  intervals: string[];
  name: string;
  numeral?: string;
}

export interface ProgressionStep {
  root: NoteName;
  variety: string;
  numeral: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
