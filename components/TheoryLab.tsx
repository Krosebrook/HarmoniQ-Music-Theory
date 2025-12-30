
import React, { useState, useEffect } from 'react';
import { useTheory } from '../context/TheoryContext';
import { NoteName, TheoryType } from '../types';
import { NOTES, SCALES, CHORDS, GUITAR_VOICINGS } from '../constants';
import { PianoView } from './PianoView';
import { FretboardView } from './FretboardView';
import { CircleOfFifths } from './CircleOfFifths';
import { suggestChordVoicing } from '../services/gemini';

export const TheoryLab: React.FC = () => {
  const { 
    rootNote, setRootNote, 
    theoryType, setTheoryType, 
    selectedVariety, setSelectedVariety, 
    currentTheory 
  } = useTheory();

  const [selectedShape, setSelectedShape] = useState<string>('');
  const [customAiVoicing, setCustomAiVoicing] = useState<(number | null)[] | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [displayLabelMode, setDisplayLabelMode] = useState<'note' | 'interval'>('note');

  useEffect(() => {
    setSelectedShape('');
    setCustomAiVoicing(null);
  }, [selectedVariety, theoryType, rootNote]);

  const handleGenerateAiVoicing = async () => {
    setIsAiLoading(true);
    try {
      const voicing = await suggestChordVoicing(rootNote, selectedVariety);
      setCustomAiVoicing(voicing);
      setSelectedShape('AI-Suggested');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <aside className="lg:col-span-1 space-y-6">
        <section className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl shadow-xl">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Instrument Config
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-3 ml-1">Root Frequency</label>
              <div className="grid grid-cols-4 gap-1.5">
                {NOTES.map((n) => (
                  <button
                    key={n}
                    onClick={() => setRootNote(n as NoteName)}
                    className={`h-9 rounded-lg text-sm font-bold transition-all ${
                      rootNote === n 
                        ? 'bg-indigo-600 text-white shadow-lg' 
                        : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-3 ml-1">Structure Type</label>
              <div className="flex gap-2">
                {[TheoryType.SCALE, TheoryType.CHORD].map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setTheoryType(type);
                      setSelectedVariety('Major');
                    }}
                    className={`flex-1 h-10 rounded-lg text-xs font-bold transition-all ${
                      theoryType === type 
                        ? 'bg-indigo-600 text-white shadow-lg' 
                        : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-700/50 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400">LABELING</label>
                <div className="flex bg-slate-900 rounded-lg p-1">
                  <button 
                    onClick={() => setDisplayLabelMode('note')}
                    className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${displayLabelMode === 'note' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
                  >
                    ABC
                  </button>
                  <button 
                    onClick={() => setDisplayLabelMode('interval')}
                    className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${displayLabelMode === 'interval' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
                  >
                    1-3-5
                  </button>
                </div>
              </div>
            </div>

            {theoryType === TheoryType.CHORD && (
              <div className="pt-6 border-t border-slate-700/50 animate-in fade-in slide-in-from-top-4 duration-500">
                <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-4">Guitar Voicing Shapes</label>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {Object.keys(GUITAR_VOICINGS[selectedVariety] || GUITAR_VOICINGS['Major']).map(shape => (
                    <button
                      key={shape}
                      onClick={() => { setSelectedShape(shape); setCustomAiVoicing(null); }}
                      className={`px-2 py-2.5 rounded-lg text-[10px] font-bold transition-all border ${
                        selectedShape === shape && !customAiVoicing
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg' 
                          : 'bg-slate-700/30 text-slate-400 border-slate-700 hover:bg-slate-700/50'
                      }`}
                    >
                      {shape}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleGenerateAiVoicing}
                  disabled={isAiLoading}
                  className="w-full py-3 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-[11px] font-black text-indigo-300 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isAiLoading ? <div className="w-3 h-3 border-2 border-indigo-300/30 border-t-indigo-300 rounded-full animate-spin"></div> : '✨ ASK AI FOR VOICING'}
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl shadow-xl">
          <h3 className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-4">Step Analysis</h3>
          <div className="text-xl font-black text-white mb-6 truncate">{currentTheory.name}</div>
          <div className="space-y-2">
            {currentTheory.notes.map((note, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-10 h-8 rounded-lg flex items-center justify-center font-mono text-[10px] font-black border ${currentTheory.intervals[i] === 'R' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-700/50 text-slate-400 border-slate-600/50'}`}>
                  {currentTheory.intervals[i]}
                </div>
                <div className="flex-1 text-sm font-bold text-slate-200">{note}</div>
              </div>
            ))}
          </div>
        </section>
      </aside>

      <div className="lg:col-span-3 space-y-8">
        <section className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-3xl shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Piano Keyboard
            </h2>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-700/30 px-3 py-1 rounded">Interactive Playable</div>
          </div>
          <PianoView 
            activeNotes={currentTheory.notes} 
            isChordMode={theoryType === TheoryType.CHORD} 
            displayLabelMode={displayLabelMode}
            currentTheory={currentTheory}
          />
        </section>

        <section className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-3xl shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Guitar Fretboard
            </h2>
          </div>
          <FretboardView 
            activeNotes={currentTheory.notes} 
            rootNote={rootNote}
            chordVariety={selectedVariety}
            selectedShape={selectedShape}
            customAiVoicing={customAiVoicing}
            displayLabelMode={displayLabelMode}
            currentTheory={currentTheory}
          />
        </section>

        <section className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-3xl shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white">Circle of Fifths</h2>
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
