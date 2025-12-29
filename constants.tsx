
export const NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export const SCALES = {
  'Major': [0, 2, 4, 5, 7, 9, 11],
  'Natural Minor': [0, 2, 3, 5, 7, 8, 10],
  'Harmonic Minor': [0, 2, 3, 5, 7, 8, 11],
  'Melodic Minor': [0, 2, 3, 5, 7, 9, 11],
  'Dorian': [0, 2, 3, 5, 7, 9, 10],
  'Phrygian': [0, 1, 3, 5, 7, 8, 10],
  'Lydian': [0, 2, 4, 6, 7, 9, 11],
  'Mixolydian': [0, 2, 4, 5, 7, 9, 10],
  'Locrian': [0, 1, 3, 5, 6, 8, 10],
  'Pentatonic Major': [0, 2, 4, 7, 9],
  'Pentatonic Minor': [0, 3, 5, 7, 10],
  'Blues': [0, 3, 5, 6, 7, 10]
};

export const CHORDS = {
  'Major': [0, 4, 7],
  'Minor': [0, 3, 7],
  'Diminished': [0, 3, 6],
  'Augmented': [0, 4, 8],
  'Major 7th': [0, 4, 7, 11],
  'Minor 7th': [0, 3, 7, 10],
  'Dominant 7th': [0, 4, 7, 10],
  'm7b5': [0, 3, 6, 10],
  'Diminished 7th': [0, 3, 6, 9],
  'Major 9th': [0, 4, 7, 11, 14],
  'Minor 9th': [0, 3, 7, 10, 14]
};

// Relative fret offsets for standard guitar shapes (CAGED-ish)
// null means string is muted
export const GUITAR_VOICINGS: Record<string, Record<string, (number | null)[]>> = {
  'Major': {
    'E-Shape': [0, 2, 2, 1, 0, 0], // Root on 6th string
    'A-Shape': [null, 0, 2, 2, 2, 0], // Root on 5th string
    'C-Shape': [null, 3, 2, 0, 1, 0], // Root on 5th string (Open C shape)
  },
  'Minor': {
    'E-Minor-Shape': [0, 2, 2, 0, 0, 0],
    'A-Minor-Shape': [null, 0, 2, 2, 1, 0],
  },
  'Dominant 7th': {
    'E-7-Shape': [0, 2, 0, 1, 0, 0],
    'A-7-Shape': [null, 0, 2, 0, 2, 0],
  },
  'Major 7th': {
    'E-Maj7-Shape': [0, null, 1, 1, 0, null],
    'A-Maj7-Shape': [null, 0, 2, 1, 2, 0],
  }
};
