
import { ProgressionTemplate } from './types';

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

export const GUITAR_VOICINGS: Record<string, Record<string, (number | null)[]>> = {
  'Major': {
    'E-Shape': [0, 2, 2, 1, 0, 0],
    'A-Shape': [null, 0, 2, 2, 2, 0],
    'C-Shape': [null, 3, 2, 0, 1, 0],
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

export const PROGRESSION_TEMPLATES: ProgressionTemplate[] = [
  {
    name: "The Pop Loop",
    mood: "Uplifting",
    steps: [
      { degree: 0, variety: "Major", numeral: "I" },
      { degree: 7, variety: "Major", numeral: "V" },
      { degree: 9, variety: "Minor", numeral: "vi" },
      { degree: 5, variety: "Major", numeral: "IV" }
    ]
  },
  {
    name: "Classic ii-V-I",
    mood: "Jazzy",
    steps: [
      { degree: 2, variety: "Minor 7th", numeral: "ii7" },
      { degree: 7, variety: "Dominant 7th", numeral: "V7" },
      { degree: 0, variety: "Major 7th", numeral: "Imaj7" },
      { degree: 0, variety: "Major 7th", numeral: "Imaj7" }
    ]
  },
  {
    name: "Epic Journey",
    mood: "Dramatic",
    steps: [
      { degree: 9, variety: "Minor", numeral: "vi" },
      { degree: 5, variety: "Major", numeral: "IV" },
      { degree: 0, variety: "Major", numeral: "I" },
      { degree: 7, variety: "Major", numeral: "V" }
    ]
  },
  {
    name: "Andalusian Cadence",
    mood: "Spanish/Flamenco",
    steps: [
      { degree: 9, variety: "Minor", numeral: "i" },
      { degree: 7, variety: "Major", numeral: "VII" },
      { degree: 5, variety: "Major", numeral: "VI" },
      { degree: 4, variety: "Major", numeral: "V" }
    ]
  },
  {
    name: "Rock Soul",
    mood: "Gritty",
    steps: [
      { degree: 0, variety: "Major", numeral: "I" },
      { degree: 10, variety: "Major", numeral: "bVII" },
      { degree: 5, variety: "Major", numeral: "IV" },
      { degree: 0, variety: "Major", numeral: "I" }
    ]
  },
  {
    name: "Smooth Neo-Soul",
    mood: "Chill",
    steps: [
      { degree: 5, variety: "Major 7th", numeral: "IVmaj7" },
      { degree: 4, variety: "Minor 7th", numeral: "iii7" },
      { degree: 2, variety: "Minor 7th", numeral: "ii7" },
      { degree: 0, variety: "Major 7th", numeral: "Imaj7" }
    ]
  },
  {
    name: "Royal Road",
    mood: "Japanese Pop",
    steps: [
      { degree: 5, variety: "Major 7th", numeral: "IVmaj7" },
      { degree: 7, variety: "Dominant 7th", numeral: "V7" },
      { degree: 4, variety: "Minor 7th", numeral: "iii7" },
      { degree: 9, variety: "Minor 7th", numeral: "vi7" }
    ]
  },
  {
    name: "The 12-Bar (Mini)",
    mood: "Blues",
    steps: [
      { degree: 0, variety: "Dominant 7th", numeral: "I7" },
      { degree: 5, variety: "Dominant 7th", numeral: "IV7" },
      { degree: 0, variety: "Dominant 7th", numeral: "I7" },
      { degree: 7, variety: "Dominant 7th", numeral: "V7" }
    ]
  },
  {
    name: "Dark Descent",
    mood: "Melancholic",
    steps: [
      { degree: 0, variety: "Minor", numeral: "i" },
      { degree: 8, variety: "Major", numeral: "VI" },
      { degree: 3, variety: "Major", numeral: "III" },
      { degree: 10, variety: "Major", numeral: "VII" }
    ]
  },
  {
    name: "Lydian Bright",
    mood: "Dreamy",
    steps: [
      { degree: 0, variety: "Major", numeral: "I" },
      { degree: 2, variety: "Major", numeral: "II" },
      { degree: 5, variety: "Major 7th", numeral: "IVmaj7" },
      { degree: 0, variety: "Major", numeral: "I" }
    ]
  }
];
