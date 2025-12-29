
import React, { useState, useEffect } from 'react';
import { NoteName, TheoryType, TheoryResult } from '../types';
import { NOTES, SCALES, CHORDS, GUITAR_VOICINGS } from '../constants';
import { PianoView } from './PianoView';
import { FretboardView } from './FretboardView';
import { CircleOfFifths } from './CircleOfFifths';
import { suggestChordVoicing } from '../services/gemini';

interface TheoryLabProps {
  rootNote: NoteName;
  setRootNote: (n: NoteName) => void;
  theoryType: TheoryType;
  setTheoryType: (t: TheoryType) => void;
  selectedVariety: string;
  setSelectedVariety: (v: string) => void;
  currentTheory: TheoryResult;
}

export const TheoryLab: React.FC<TheoryLabProps> = ({
  rootNote,
  setRootNote,
  theoryType,
  setTheoryType,
  selectedVariety,
  setSelectedVariety,
  currentTheory
}) => {
  const [selectedShape, setSelectedShape] = useState<string>('');
  const [customAiVoicing, setCustomAiVoicing] = useState<(number | null)[] | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showTechniques, setShowTechniques] = useState<boolean>(true);
  const [displayLabelMode, setDisplayLabelMode] = useState<'note' | 'interval'>('note');

  // Reset states when core parameters change
  useEffect(() => {
    setSelectedShape('');
    setCustomAiVoicing(null);
  }, [selectedVariety, theoryType, rootNote]);

  const availableShapes = theoryType === TheoryType.CHORD 
    ? Object.keys(GUITAR_VOICINGS[selectedVariety] || GUITAR_VOICINGS['Major'] || {})
    : [];

  const handleGenerateAiVoicing = async () => {
    setIsAiLoading(true);
    try {
      const voicing = await suggestChordVoicing(rootNote, selectedVariety);
      setCustomAiVoicing(voicing);
      setSelectedShape('AI-Suggested'); // Dummy shape label
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const getIntervalColor = (interval: string) => {
    if (interval === 'R') return 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20';
    if (['3', 'b3', '7', 'b7'].includes(interval)) return 'bg-indigo-400/20 text-indigo-300 border border-indigo-400/30';
    if (['5', '4'].includes(interval)) return 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30';
    return 'bg-slate-700/50 text-slate-400 border border-slate-600/50';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <aside className="lg:col-span-1 space-y-6">
        <section className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl shadow-xl">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">Root Note</label>
              <div className="grid grid-cols-4 gap-1">
                {NOTES.map((n) => (
                  <button
                    key={n}
                    onClick={() => setRootNote(n as NoteName)}
                    className={`h-9 rounded-md text-sm font-medium transition-colors ${
                      rootNote === n 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">Type</label>
              <div className="flex gap-2">
                {[TheoryType.SCALE, TheoryType.CHORD].map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setTheoryType(type);
                      setSelectedVariety(type === TheoryType.SCALE ? 'Major' : 'Major');
                    }}
                    className={`flex-1 h-9 rounded-md text-sm font-medium transition-colors ${
                      theoryType === type 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">Variety</label>
              <select
                value={selectedVariety}
                onChange={(e) => setSelectedVariety(e.target.value)}
                className="w-full h-10 bg-slate-900 border border-slate-700 rounded-md px-3 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
                {Object.keys(theoryType === TheoryType.SCALE ? SCALES : CHORDS).map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div className="pt-4 border-t border-slate-700/50 space-y-3">
               <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-400">Labels</label>
                <div className="flex bg-slate-900 rounded-lg p-1">
                  <button 
                    onClick={() => setDisplayLabelMode('note')}
                    className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${displayLabelMode === 'note' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    ABC
                  </button>
                  <button 
                    onClick={() => setDisplayLabelMode('interval')}
                    className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${displayLabelMode === 'interval' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    1-3-5
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-400">Slurs</label>
                <button 
                  onClick={() => setShowTechniques(!showTechniques)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${showTechniques ? 'bg-indigo-600' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${showTechniques ? 'left-6' : 'left-1'}`}></div>
                </button>
              </div>
            </div>

            {theoryType === TheoryType.CHORD && (
              <div className="pt-4 border-t border-slate-700/50">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Voicings</label>
                  <button 
                    onClick={handleGenerateAiVoicing}
                    disabled={isAiLoading}
                    className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 hover:bg-indigo-500/20 transition-all disabled:opacity-50"
                  >
                    {isAiLoading ? '...' : 'Ask AI ✨'}
                  </button>
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => { setSelectedShape(''); setCustomAiVoicing(null); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      selectedShape === '' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-700/50'
                    }`}
                  >
                    Scale Display
                  </button>
                  {customAiVoicing && (
                    <button
                      onClick={() => setSelectedShape('AI-Suggested')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                        selectedShape === 'AI-Suggested' ? 'bg-indigo-600 text-white' : 'bg-indigo-900/20 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      Custom AI Voicing
                      <span className="text-[10px] opacity-70">✨</span>
                    </button>
                  )}
                  {availableShapes.map(shape => (
                    <button
                      key={shape}
                      onClick={() => { setSelectedShape(shape); setCustomAiVoicing(null); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        selectedShape === shape ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-700/30 text-slate-400 hover:bg-slate-700/60'
                      }`}
                    >
                      {shape}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl shadow-xl">
          <h3 className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-4">Step Analysis</h3>
          <div className="text-2xl font-bold text-white mb-6 leading-tight">{currentTheory.name}</div>
          
          <div className="space-y-2.5">
            {currentTheory.notes.map((note, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <div className={`w-10 h-8 rounded-lg flex items-center justify-center font-mono text-[10px] font-black transition-all group-hover:scale-110 ${getIntervalColor(currentTheory.intervals[i])}`}>
                  {currentTheory.intervals[i]}
                </div>
                <div className="flex-1 border-b border-slate-700/30 pb-2">
                  <div className="text-sm font-bold text-slate-100 flex justify-between items-center">
                    {note}
                    {currentTheory.intervals[i] === 'R' && <span className="text-[9px] bg-indigo-600/30 text-indigo-300 px-1.5 py-0.5 rounded">TONIC</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </aside>

      <div className="lg:col-span-3 space-y-8">
        <section className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl shadow-xl overflow-x-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-100">Piano View</h2>
            <div className="flex gap-2">
               {theoryType === TheoryType.CHORD && (
                 <span className="text-[10px] font-bold text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded uppercase tracking-tighter">Harmonic Voicing</span>
               )}
               <span className="text-xs text-slate-500 px-2 py-1 bg-slate-700/50 rounded">Virtual Keys</span>
            </div>
          </div>
          <PianoView 
            activeNotes={currentTheory.notes} 
            isChordMode={theoryType === TheoryType.CHORD} 
            displayLabelMode={displayLabelMode}
            currentTheory={currentTheory}
          />
        </section>

        <section className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl shadow-xl overflow-x-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-100">Fretboard View</h2>
            <div className="flex gap-2">
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded uppercase tracking-tighter">Legato Detection</span>
              <span className="text-xs text-slate-500 px-2 py-1 bg-slate-700/50 rounded">Guitar Std.</span>
            </div>
          </div>
          <FretboardView 
            activeNotes={currentTheory.notes} 
            rootNote={rootNote}
            chordVariety={selectedVariety}
            selectedShape={selectedShape}
            customAiVoicing={customAiVoicing}
            showTechniques={showTechniques}
            displayLabelMode={displayLabelMode}
            currentTheory={currentTheory}
          />
        </section>

        <section className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-2xl shadow-xl">
           <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-100">Circle of Fifths</h2>
            <span className="text-xs text-slate-500 px-2 py-1 bg-slate-700/50 rounded">Relational Theory</span>
          </div>
          <CircleOfFifths 
            activeNotes={currentTheory.notes} 
            currentRoot={rootNote} 
            onSelectRoot={(note) => setRootNote(note as NoteName)}
          />
        </section>
      </div>
    </div>
  );
};
