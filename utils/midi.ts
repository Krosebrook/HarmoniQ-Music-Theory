
import { NoteName, ProgressionStep } from "../types";
import { NOTES, CHORDS } from "../constants";

/**
 * Lightweight MIDI Encoder
 * Creates a Format 0 Standard MIDI File (Single Track)
 */

// Helper: Convert Variable Length Quantity
const toVLQ = (num: number): number[] => {
  const bytes = [];
  let n = num;
  do {
    let byte = n & 0x7F;
    n >>= 7;
    if (bytes.length > 0) byte |= 0x80;
    bytes.unshift(byte);
  } while (n > 0);
  return bytes;
};

// Helper: Convert string to byte array
const strToBytes = (str: string) => str.split('').map(c => c.charCodeAt(0));

// Helper: Get MIDI note number (Middle C4 = 60)
const getMidiNote = (noteName: string, octave = 4): number => {
  const baseIndex = NOTES.indexOf(noteName);
  if (baseIndex === -1) return 60; // Fallback
  return (octave + 1) * 12 + baseIndex;
};

export const generateMidi = (progression: ProgressionStep[], bpm: number = 120): Blob => {
  const TICKS_PER_BEAT = 480;
  const MICROSECONDS_PER_MINUTE = 60000000;
  const MPQN = Math.floor(MICROSECONDS_PER_MINUTE / bpm);

  // HEADER CHUNK
  const header = [
    ...strToBytes('MThd'),
    0, 0, 0, 6, // Chunk size (always 6 for header)
    0, 0, // Format 0 (single track)
    0, 1, // Number of tracks (1)
    (TICKS_PER_BEAT >> 8) & 0xFF, TICKS_PER_BEAT & 0xFF // Time division
  ];

  // TRACK EVENTS
  let trackEvents: number[] = [];

  // 1. Set Tempo Meta Event (FF 51 03 tttttt)
  trackEvents.push(0x00, 0xFF, 0x51, 0x03, (MPQN >> 16) & 0xFF, (MPQN >> 8) & 0xFF, MPQN & 0xFF);

  // 2. Set Time Signature (4/4) - Optional but good (FF 58 04 nn dd cc bb)
  trackEvents.push(0x00, 0xFF, 0x58, 0x04, 4, 2, 24, 8);

  // 3. Note Events
  // Assume each chord lasts 1 bar (4 beats)
  const DURATION_TICKS = TICKS_PER_BEAT * 4;
  
  progression.forEach((step) => {
    const rootIdx = NOTES.indexOf(step.root);
    const intervals = CHORDS[step.variety as keyof typeof CHORDS] || CHORDS['Major'];
    
    // Calculate MIDI notes for the chord
    const notes = intervals.map(interval => {
      // Basic voice leading logic: keep notes near C4 (60)
      let noteVal = getMidiNote(NOTES[(rootIdx + interval) % 12], 3);
      // Bump octave if too low
      if (noteVal < 48) noteVal += 12;
      return noteVal;
    });

    // NOTE ON (Delta 0 for first note of chord, 0 for subsequent to simulate simultaneous)
    notes.forEach((note, i) => {
      trackEvents.push(0x00); // Delta time 0
      trackEvents.push(0x90); // Note On, Channel 0
      trackEvents.push(note); // Note Number
      trackEvents.push(0x64); // Velocity (100)
    });

    // NOTE OFF
    // First note off takes the delta time duration, others are 0
    notes.forEach((note, i) => {
      if (i === 0) {
        trackEvents.push(...toVLQ(DURATION_TICKS));
      } else {
        trackEvents.push(0x00);
      }
      trackEvents.push(0x80); // Note Off
      trackEvents.push(note);
      trackEvents.push(0x00); // Velocity 0
    });
  });

  // End of Track (FF 2F 00)
  trackEvents.push(0x00, 0xFF, 0x2F, 0x00);

  // TRACK CHUNK HEADER
  const trackHeader = [
    ...strToBytes('MTrk'),
    (trackEvents.length >> 24) & 0xFF,
    (trackEvents.length >> 16) & 0xFF,
    (trackEvents.length >> 8) & 0xFF,
    trackEvents.length & 0xFF
  ];

  const fileData = new Uint8Array([...header, ...trackHeader, ...trackEvents]);
  return new Blob([fileData], { type: 'audio/midi' });
};
