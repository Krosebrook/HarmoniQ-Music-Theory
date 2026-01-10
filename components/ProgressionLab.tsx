import React, { useState, useEffect, useRef } from 'react';
import { NoteName, ProgressionStep, ProgressionTemplate } from '../types';
import { suggestProgression } from '../services/gemini';
import { NOTES, CHORDS, PROGRESSION_TEMPLATES } from '../constants';
import { useTheory } from '../context/TheoryContext';
import { useAudio } from '../hooks/useAudio';
import { generateMidi } from '../utils/midi';

interface ProgressionLabProps {
  // Props are now largely handled via Context, but kept for interface compatibility if needed
}

export const ProgressionLab: React.FC<ProgressionLabProps> = () => {
  const { currentTheory, progression, setProgression, rootNote: currentKey, instrument, volume } = useTheory();
  const { playChord } = useAudio(instrument, volume);
  
  const [mood, setMood] = useState('Epic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  
  // Studio Controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(100);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  
  const playbackRef = useRef<number | null>(null);

  const moods = ['Epic', 'Melancholic', 'Dreamy', 'Dark Jazz', 'Uplifting Pop', 'Soulful', 'Cyberpunk'];

  // Cleanup playback on unmount
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

  const clearProgression = () => {
    stopPlayback();
    setProgression([]);
  };

  // --- Playback Logic ---
  
  const playStep = (index: number) => {
    if (index >= progression.length) {
        // Loop
        playStep(0);
        return;
    }

    const step = progression[index];
    setActiveStepIndex(index);

    // Calculate notes
    const rootIdx = NOTES.indexOf(step.root);
    const intervals = CHORDS[step.variety as keyof typeof CHORDS] || CHORDS['Major'];
    const notes = intervals.map(i => NOTES[(rootIdx + i) % 12]);
    
    // Determine octave (simple voice leading heuristic)
    // We try to keep the root near Middle C (index ~0 in our array logic usually implies C4)
    // For this engine, we pass 0 as base.
    playChord(notes, 0, instrument === 'guitar' ? 50 : 0);

    // Schedule next
    // 60000ms / BPM = 1 beat. 4 beats per bar.
    const msPerBar = (60000 / bpm) * 4;
    
    playbackRef.current = window.setTimeout(() => {
        playStep(index + 1);
    }, msPerBar);
  };

  const togglePlayback = () => {
    if (isPlaying) {
        stopPlayback();
    } else {
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

  // --- Export Logic ---

  const handleExportMidi = () => {
    if (progression.length === 0) return;
    const blob = generateMidi(progression, bpm);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HarmoniQ_${currentKey}_${mood.replace(/\s/g, '_')}.mid`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- Manual Preview ---
  
  const handleChordClick = (step: ProgressionStep, index: number) => {
    if (isPlaying) return; // Don't interfere with playback
    setActiveStepIndex(index);
    const rootIdx = NOTES.indexOf(step.root);
    const intervals = CHORDS[step.variety as keyof typeof CHORDS] || CHORDS['Major'];
    const notes = intervals.map(i => NOTES[(rootIdx + i) % 12]);
    playChord(notes, 0, 50);
    
    // Clear highlight after a moment
    setTimeout(() => setActiveStepIndex(null), 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-3xl shadow-xl">
        {/* Header & Controls */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              Progression Studio
              {isPlaying && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>}
            </h2>
            <p className="text-slate-400 text-sm mt-1">Generate, sequence, and export harmonic ideas in the key of <span className="text-indigo-400 font-bold">{currentKey}</span>.</p>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center w-full xl:w-auto">
             {/* Transport Controls */}
             <div className="flex bg-slate-900 rounded-xl p-1 mr-2 border border-slate-700">
                <button 
                  onClick={togglePlayback}
                  disabled={progression.length === 0}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${isPlaying ? 'bg-red-500/20 text-red-400' : 'hover:bg-slate-700 text-white'}`}
                >
                  {isPlaying ? (
                     <><div className="w-3 h-3 bg-red-400 rounded-sm"></div> Stop</>
                  ) : (
                     <><svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> Play</>
                  )}
                </button>
                <div className="w-px bg-slate-700 mx-1"></div>
                <div className="flex items-center px-3 gap-2">
                   <span className="text-[10px] font-bold text-slate-500 uppercase">BPM</span>
                   <input 
                     type="number" 
                     value={bpm}
                     onChange={(e) => setBpm(Math.max(40, Math.min(300, parseInt(e.target.value))))}
                     className="w-12 bg-transparent text-sm font-mono text-center outline-none border-b border-slate-600 focus:border-indigo-500 text-white"
                   />
                </div>
             </div>

            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                showTemplates 
                ? 'bg-indigo-600 text-white border-indigo-500' 
                : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
              }`}
            >
              📚 Library
            </button>

            <select 
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="bg-slate-800 text-white text-sm rounded-xl px-4 py-2 border border-slate-600 outline-none focus:border-indigo-500"
            >
              {moods.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : '✨ Generate'}
            </button>

            {/* Export Dropdown / Button */}
            <button
                onClick={handleExportMidi}
                disabled={progression.length === 0}
                className="bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-600/50 text-emerald-400 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:grayscale flex items-center gap-2"
                title="Download Standard MIDI File"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                MIDI
            </button>
            
            <button
              onClick={clearProgression}
              className="p-2 text-slate-500 hover:text-white transition-colors"
              title="Clear Sequence"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Template Gallery Overlay */}
        {showTemplates && (
          <div className="mb-8 grid grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-slate-900/60 rounded-2xl border border-indigo-500/20 animate-in slide-in-from-top-4 duration-300">
            {PROGRESSION_TEMPLATES.map((t, i) => (
              <button
                key={i}
                onClick={() => applyTemplate(t)}
                className="group flex flex-col p-3 rounded-xl bg-slate-800 border border-slate-700 hover:border-indigo-500 hover:bg-slate-700 transition-all text-left"
              >
                <span className="text-white text-xs font-bold mb-1 truncate">{t.name}</span>
                <span className="text-slate-500 text-[9px] uppercase tracking-widest group-hover:text-indigo-400">{t.mood}</span>
              </button>
            ))}
          </div>
        )}

        {/* Progression Timeline / Sequencer View */}
        <div className="min-h-[220px] bg-slate-900/50 rounded-2xl p-6 border border-slate-800 flex items-center justify-center relative overflow-hidden">
          {progression.length === 0 ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <p className="text-slate-500 text-sm">No sequence generated. Use AI or pick a Template from the library!</p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 w-full px-2 snap-x">
              {progression.map((chord, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleChordClick(chord, idx)}
                  className={`flex-shrink-0 w-44 group cursor-pointer relative transition-all duration-300 snap-center ${
                      activeStepIndex === idx ? 'scale-105' : 'scale-100 opacity-80 hover:opacity-100'
                  }`}
                >
                  {/* Playhead Indicator */}
                  {activeStepIndex === idx && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-indigo-400 animate-bounce"></div>
                  )}

                  <div className={`bg-slate-800 border rounded-2xl p-5 transition-all shadow-lg ${
                      activeStepIndex === idx 
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-900/10' 
                      : 'border-slate-700 hover:border-indigo-500/50 hover:bg-slate-750'
                  }`}>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-mono text-slate-500">BAR {idx + 1}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          activeStepIndex === idx ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-indigo-400'
                      }`}>{chord.numeral}</span>
                    </div>
                    <div className="text-3xl font-black text-white mb-1 tracking-tight">{chord.root}</div>
                    <div className="text-xs text-slate-400 truncate font-medium">{chord.variety}</div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between items-center opacity-70">
                      <div className="flex gap-1">
                          <div className="w-1 h-3 bg-slate-600 rounded-full"></div>
                          <div className="w-1 h-3 bg-slate-600 rounded-full"></div>
                          <div className="w-1 h-3 bg-slate-600 rounded-full"></div>
                          <div className="w-1 h-3 bg-slate-600 rounded-full"></div>
                      </div>
                      {activeStepIndex === idx && (
                          <span className="text-[10px] text-indigo-400 font-bold uppercase animate-pulse">Playing</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Add Step Button (Future Feature) */}
              <div className="flex-shrink-0 w-12 flex items-center justify-center opacity-30 hover:opacity-100 transition-opacity">
                <button className="w-8 h-8 rounded-full border-2 border-slate-600 flex items-center justify-center text-slate-400 hover:border-indigo-500 hover:text-indigo-500">
                    +
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-indigo-500/10 p-6 rounded-2xl">
          <h3 className="text-indigo-400 font-bold mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            Voice Leading AI
          </h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            The generator favors smooth voice leading, minimizing finger movement between chords for a more professional sound.
          </p>
        </div>
        <div className="bg-gradient-to-br from-emerald-900/20 to-slate-900 border border-emerald-500/10 p-6 rounded-2xl">
           <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            DAW Ready
          </h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Export your creation as a standard <strong>.MID</strong> file. Drag and drop it directly into Logic, Ableton, or FL Studio to use with your own VSTs.
          </p>
        </div>
        <div className="bg-gradient-to-br from-amber-900/20 to-slate-900 border border-amber-500/10 p-6 rounded-2xl">
          <h3 className="text-amber-400 font-bold mb-2 flex items-center gap-2">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             Live Sequencer
          </h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Use the built-in playback to practice improvising scales over your custom backing track in real-time.
          </p>
        </div>
      </div>
    </div>
  );
};