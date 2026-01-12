import { useCallback, useRef, useEffect } from 'react';

const FREQUENCIES: Record<string, number> = {
  'C': 261.63, 'Db': 277.18, 'D': 293.66, 'Eb': 311.13, 'E': 329.63, 'F': 349.23,
  'Gb': 369.99, 'G': 391.00, 'Ab': 415.30, 'A': 440.00, 'Bb': 466.16, 'B': 493.88
};

export const useAudio = (instrument: 'piano' | 'guitar', globalVolume: number) => {
  const audioCtx = useRef<AudioContext | null>(null);
  const masterGain = useRef<GainNode | null>(null);
  const limiter = useRef<DynamicsCompressorNode | null>(null);

  useEffect(() => {
    audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Safety Limiter
    limiter.current = audioCtx.current.createDynamicsCompressor();
    limiter.current.threshold.setValueAtTime(-10, audioCtx.current.currentTime);
    limiter.current.knee.setValueAtTime(40, audioCtx.current.currentTime);
    limiter.current.ratio.setValueAtTime(12, audioCtx.current.currentTime);
    limiter.current.attack.setValueAtTime(0, audioCtx.current.currentTime);
    limiter.current.release.setValueAtTime(0.25, audioCtx.current.currentTime);
    
    masterGain.current = audioCtx.current.createGain();
    masterGain.current.gain.value = globalVolume;
    
    limiter.current.connect(audioCtx.current.destination);
    masterGain.current.connect(limiter.current);

    return () => {
      if (audioCtx.current?.state !== 'closed') {
        audioCtx.current?.close();
      }
    };
  }, []);

  useEffect(() => {
    if (masterGain.current && audioCtx.current) {
      masterGain.current.gain.setTargetAtTime(globalVolume, audioCtx.current.currentTime, 0.05);
    }
  }, [globalVolume]);

  const playFrequency = (freq: number, startTime: number) => {
    if (!audioCtx.current) return;
    const ctx = audioCtx.current;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (instrument === 'piano') {
      osc.type = 'triangle';
      const overtone = ctx.createOscillator();
      overtone.type = 'sine';
      overtone.frequency.value = freq * 2;
      const overtoneGain = ctx.createGain();
      overtoneGain.gain.value = 0.15;
      overtone.connect(overtoneGain);
      overtoneGain.connect(gain);
      overtone.start(startTime);
      overtone.stop(startTime + 1.2);
    } else {
      osc.type = 'sawtooth';
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, startTime);
      filter.frequency.exponentialRampToValueAtTime(300, startTime + 0.4);
      osc.connect(filter);
      filter.connect(gain);
    }

    osc.frequency.setValueAtTime(freq, startTime);

    // Optimized Envelope
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(instrument === 'piano' ? 0.35 : 0.5, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + (instrument === 'piano' ? 1.8 : 0.8));

    if (instrument === 'piano') {
      osc.connect(gain);
    }
    gain.connect(masterGain.current!);

    osc.start(startTime);
    osc.stop(startTime + 2.0);
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
      const baseFreq = FREQUENCIES[note];
      if (baseFreq) {
         const freq = baseFreq * Math.pow(2, startOctave);
         playFrequency(freq, now + (index * (staggerMs / 1000)));
      }
    });
  }, [instrument]);

  return { playNote, playChord };
};
