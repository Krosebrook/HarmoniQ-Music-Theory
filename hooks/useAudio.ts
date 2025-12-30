
import { useCallback, useRef, useEffect } from 'react';
import { NOTES } from '../constants';

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

  const playNote = useCallback((note: string, octave: number = 0) => {
    if (!audioCtx.current || audioCtx.current.state === 'suspended') {
      audioCtx.current?.resume();
    }

    const ctx = audioCtx.current!;
    const noteFreq = FREQUENCIES[note] * Math.pow(2, octave);
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    if (instrument === 'piano') {
      // Additive synthesis for piano-like overtones
      osc.type = 'triangle';
      const subOsc = ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.value = noteFreq * 2;
      const subGain = ctx.createGain();
      subGain.gain.value = 0.3;
      subOsc.connect(subGain);
      subGain.connect(gain);
      subOsc.start();
      subOsc.stop(ctx.currentTime + 1.5);
    } else {
      // Sharper attack for guitar
      osc.type = 'sawtooth';
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.5);
      osc.connect(filter);
      filter.connect(gain);
    }

    osc.frequency.setValueAtTime(noteFreq, ctx.currentTime);
    
    // Envelope
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(instrument === 'piano' ? 0.4 : 0.6, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (instrument === 'piano' ? 2 : 1));

    if (instrument === 'piano') {
      osc.connect(gain);
    }
    gain.connect(masterGain.current!);
    
    osc.start();
    osc.stop(ctx.currentTime + 2.1);
  }, [instrument]);

  return { playNote };
};
