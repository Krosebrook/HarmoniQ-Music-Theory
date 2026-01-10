
import { useCallback, useRef, useEffect } from 'react';

const FREQUENCIES: Record<string, number> = {
  'C': 261.63, 'Db': 277.18, 'D': 293.66, 'Eb': 311.13, 'E': 329.63, 'F': 349.23,
  'Gb': 369.99, 'G': 391.00, 'Ab': 415.30, 'A': 440.00, 'Bb': 466.16, 'B': 493.88
};

export const useAudio = (instrument: 'piano' | 'guitar', globalVolume: number) => {
  const audioCtx = useRef<AudioContext | null>(null);
  const masterGain = useRef<GainNode | null>(null);

  useEffect(() => {
    audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    masterGain.current = audioCtx.current.createGain();
    masterGain.current.connect(audioCtx.current.destination);
    masterGain.current.gain.value = globalVolume;
  }, []);

  useEffect(() => {
    if (masterGain.current) {
      masterGain.current.gain.setTargetAtTime(globalVolume, audioCtx.current!.currentTime, 0.05);
    }
  }, [globalVolume]);

  const playFrequency = (freq: number, startTime: number) => {
    if (!audioCtx.current) return;
    const ctx = audioCtx.current;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (instrument === 'piano') {
      // Additive synthesis for piano-like overtones
      osc.type = 'triangle';
      const subOsc = ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.value = freq * 2;
      const subGain = ctx.createGain();
      subGain.gain.value = 0.3;
      subOsc.connect(subGain);
      subGain.connect(gain);
      subOsc.start(startTime);
      subOsc.stop(startTime + 1.5);
    } else {
      // Sharper attack for guitar
      osc.type = 'sawtooth';
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, startTime);
      filter.frequency.exponentialRampToValueAtTime(400, startTime + 0.5);
      osc.connect(filter);
      filter.connect(gain);
    }

    osc.frequency.setValueAtTime(freq, startTime);

    // Envelope
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(instrument === 'piano' ? 0.4 : 0.6, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + (instrument === 'piano' ? 2 : 1));

    if (instrument === 'piano') {
      osc.connect(gain);
    }
    gain.connect(masterGain.current!);

    osc.start(startTime);
    osc.stop(startTime + 2.1);
  };

  const playNote = useCallback((note: string, octave: number = 0) => {
    if (!audioCtx.current || audioCtx.current.state === 'suspended') {
      audioCtx.current?.resume();
    }
    const baseFreq = FREQUENCIES[note];
    if (!baseFreq) return;
    
    const freq = baseFreq * Math.pow(2, octave);
    playFrequency(freq, audioCtx.current!.currentTime);
  }, [instrument]);

  const playChord = useCallback((notes: string[], startOctave: number = 0, staggerMs: number = 0) => {
     if (!audioCtx.current || audioCtx.current.state === 'suspended') {
      audioCtx.current?.resume();
    }

    const now = audioCtx.current!.currentTime;

    notes.forEach((note, index) => {
      // Handle notes that might wrap octaves if needed, but for simplicity we assume passed notes are correct names
      // Simple octavization check if notes go lower than root visually, but here we just play raw frequency
      const baseFreq = FREQUENCIES[note];
      if (baseFreq) {
         // Naive octave handling: if index > 0 and note is 'lower' than root alphabetically (like C following G), bump octave? 
         // For quiz mode, we will pre-calculate exact notes including octave if possible, 
         // but for now let's just assume one octave span or allow the caller to specify pitch.
         // Actually, let's just stick to the passed octave for simplicity.
         const freq = baseFreq * Math.pow(2, startOctave);
         playFrequency(freq, now + (index * (staggerMs / 1000)));
      }
    });
  }, [instrument]);

  return { playNote, playChord };
};
