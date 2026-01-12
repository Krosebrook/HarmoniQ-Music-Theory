import React, { useState, useEffect, useRef } from 'react';
import { NoteName, ProgressionStep, ProgressionTemplate } from '../types';
import { suggestProgression, reharmonizeProgression } from '../services/gemini';
import { NOTES, CHORDS, PROGRESSION_TEMPLATES } from '../constants';
import { useTheory } from '../context/TheoryContext';
import { useAudio } from '../hooks/useAudio';
import { generateMidi } from '../utils/midi';

type GrooveType = 'Straight 4s' | 'Jazz Swing' | 'Pop Pulse';

export const ProgressionLab: React.FC = () => {
  const { progression, setProgression, rootNote: currentKey, instrument, volume } = useTheory();
  const { playChord } = useAudio(instrument, volume);
  
  const [mood, setMood] = useState('Epic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReharmonizing, setIsReharmonizing] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(100);
  const [groove, setGroove] = useState<GrooveType>('Straight 4s');
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  
  const playbackRef = useRef<number | null>(null);

  const moods = ['Epic', 'Melancholic', 'Dreamy', 'Dark Jazz', 'Uplifting Pop', 'Soulful', 'Cyberpunk'];

  useEffect(() => {
    return () => stopPlayback();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const suggested = await suggestProgression(mood, currentKey);
      setProgression(suggested);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReharmonize = async () => {
    if (progression.length === 0) return;
    setIsReharmonizing(true);
    try {
      const reharmonized = await reharmonizeProgression(progression, currentKey);
      setProgression(reharmonized);
    } catch (err) {
      console.error(err);
    } finally {
      setIsReharmonizing(false);
    }
  };

  const applyTemplate = (template: ProgressionTemplate) => {
    const rootIndex = NOTES.indexOf(currentKey);
    const steps: ProgressionStep[] = template.steps.map(s => {
      const noteIdx = (rootIndex + s.degree) % 12;
      return {
        root: NOTES[noteIdx] as NoteName,
        variety: s.variety,
        numeral: s.numeral
      };
    });
    setProgression(steps);
    setShowTemplates(false);
  };

  // --- Playback Logic ---
  
  const playStep = (index: number) => {
    if (index >= progression.length) {
        playStep(0);
        return;
    }

    const step = progression[index];
    setActiveStepIndex(index);
    const rootIdx = NOTES.indexOf(step.root);
    const intervals = CHORDS[step.variety as keyof typeof CHORDS] || CHORDS['Major'];
    const notes = intervals.map(i => NOTES[(rootIdx + i) % 12]);
    
    // Play full chord on beat 1
    playChord(notes, 0, instrument === 'guitar' ? 40 : 0);

    const barMs = (60000 / bpm) * 4;
    const beatMs = 60000 / bpm;

    // Rhythmic "Groove" Logic
    if (groove === 'Pop Pulse') {
        // Play pulses on 1, 2-and, 4
        setTimeout(() => playChord(notes, 0, 10), beatMs * 1.5);
        setTimeout(() => playChord(notes, 0, 10), beatMs * 3);
    } else if (groove === 'Jazz Swing') {
        // Play chords with swing feel on every beat but slightly offset
        setTimeout(() => playChord(notes, 0, 10), beatMs);
        setTimeout(() => playChord(notes, 0, 10), beatMs * 2);
        setTimeout(() => playChord(notes, 0, 10), beatMs * 3);
    }

    playbackRef.current = window.setTimeout(() => {
        playStep(index + 1);
    }, barMs);
  };

  const togglePlayback = () => {
    if (isPlaying) stopPlayback();
    else {
        if (progression.length === 0) return;
        setIsPlaying(true);
        playStep(0);
    }
  };

  const stopPlayback = () => {
    if (playbackRef.current) clearTimeout(playbackRef.current);
    setIsPlaying(false);
    setActiveStepIndex(null);
  };

  const handleExportMidi = () => {
    if (progression.length === 0) return;
    const blob = generateMidi(progression, bpm);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HarmoniQ_MIDI.mid`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-3xl shadow-xl">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">Progression Studio</h2>
            <p className="text-slate-400 text-sm mt-1">Key of <span className="text-indigo-400 font-bold">{currentKey}</span></p>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
             <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-700">
                <button onClick={togglePlayback} className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold ${isPlaying ? 'bg-red-500/20 text-red-400' : 'text-white'}`}>
                  {isPlaying ? 'Stop' : 'Play'}
                </button>
                <div className="flex items-center px-3 gap-2 border-l border-slate-700 ml-1">
                   <span className="text-[10px] font-bold text-slate-500 uppercase">BPM</span>
                   <input type="number" value={bpm} onChange={(e) => setBpm(parseInt(e.target.value))} className="w-12 bg-transparent text-sm font-mono text-white text-center" />
                </div>
                <select value={groove} onChange={(e) => setGroove(e.target.value as GrooveType)} className="bg-slate-800 text-[10px] text-indigo-400 font-bold px-2 ml-1 rounded-lg outline-none">
                  <option>Straight 4s</option>
                  <option>Jazz Swing</option>
                  <option>Pop Pulse</option>
                </select>
             </div>

            <button onClick={() => setShowTemplates(!showTemplates)} className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 border border-slate-600 text-slate-300 hover:bg-slate-700 transition-all">📚 Library</button>
            <button onClick={handleGenerate} disabled={isGenerating} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-lg">✨ Generate</button>
            <button onClick={handleReharmonize} disabled={isReharmonizing || progression.length === 0} className="bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/40 text-violet-400 px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2">🧪 Spice Up</button>
            <button onClick={handleExportMidi} disabled={progression.length === 0} className="bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-600/50 text-emerald-400 px-4 py-2 rounded-xl text-sm font-semibold">MIDI</button>
          </div>
        </div>

        <div className="min-h-[220px] bg-slate-900/50 rounded-2xl p-6 border border-slate-800 flex items-center justify-center relative overflow-hidden">
          {progression.length === 0 ? (
            <p className="text-slate-500 text-sm italic">No sequence generated...</p>
          ) : (
            <div className="flex gap-4 overflow-x-auto w-full px-2 pb-2">
              {progression.map((chord, idx) => (
                <div key={idx} className={`flex-shrink-0 w-44 bg-slate-800 border rounded-2xl p-5 transition-all ${activeStepIndex === idx ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-900/10' : 'border-slate-700 opacity-80'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-mono text-slate-500">BAR {idx + 1}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-700 text-indigo-400">{chord.numeral}</span>
                  </div>
                  <div className="text-3xl font-black text-white">{chord.root}</div>
                  <div className="text-xs text-slate-400 mt-1">{chord.variety}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
